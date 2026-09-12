import { randomBytes, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const GOOGLE_STATE_COOKIE = "google_oauth_state";
const stateCookieOptions = (req: Request) => ({
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: req.protocol === "https" || req.headers["x-forwarded-proto"] === "https",
});

function getRedirectUri(req: Request) {
  if (ENV.googleRedirectUri) return ENV.googleRedirectUri;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProto === "string" ? forwardedProto.split(",")[0].trim() : req.protocol;
  return `${protocol}://${req.get("host")}/api/auth/google/callback`;
}

function safeStateMatches(actual: string | undefined, expected: string) {
  if (!actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/google", (req: Request, res: Response) => {
    try {
      const state = randomBytes(32).toString("hex");
      const redirectUri = getRedirectUri(req);
      const url = sdk.google.getAuthorizationUrl(state, redirectUri);
      res.cookie(GOOGLE_STATE_COOKIE, state, { ...stateCookieOptions(req), maxAge: 10 * 60 * 1000 });
      res.redirect(302, url);
    } catch (error) {
      console.error("[Google OAuth] Start failed", error);
      res.status(500).json({ error: "Google OAuth is not configured" });
    }
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const expectedState = cookies[GOOGLE_STATE_COOKIE];
    res.clearCookie(GOOGLE_STATE_COOKIE, stateCookieOptions(req));

    if (!code || !safeStateMatches(state, expectedState ?? "")) {
      res.status(400).json({ error: "Invalid Google OAuth state or code" });
      return;
    }

    try {
      const googleUser = await sdk.google.exchangeCode(code, getRedirectUri(req));
      const role = ENV.googleAdminEmails.includes(googleUser.email.toLowerCase()) ? "admin" : undefined;
      await db.upsertUser({
        openId: googleUser.openId,
        name: googleUser.name,
        email: googleUser.email,
        loginMethod: "google",
        role,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(googleUser);
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).json({ error: "Google sign-in failed" });
    }
  });
}
