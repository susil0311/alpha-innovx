import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { OAuth2Client } from "google-auth-library";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  openId: string;
  name: string;
  email: string;
};

export type AuthenticatedUser = User;

class GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(ENV.googleClientId, ENV.googleClientSecret);
  }

  getAuthorizationUrl(state: string, redirectUri: string) {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      throw new Error("Google OAuth is not configured");
    }

    return new OAuth2Client(ENV.googleClientId, ENV.googleClientSecret, redirectUri).generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
    });
  }

  async exchangeCode(code: string, redirectUri: string) {
    const client = new OAuth2Client(ENV.googleClientId, ENV.googleClientSecret, redirectUri);
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new Error("Google did not return an ID token");

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: ENV.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) throw new Error("Google profile is incomplete");
    if (payload.email_verified === false) throw new Error("Google email is not verified");

    const allowedDomains = ENV.googleAllowedDomains;
    if (allowedDomains.length > 0) {
      const domain = payload.email.split("@")[1]?.toLowerCase();
      if (!domain || !allowedDomains.includes(domain)) {
        throw new Error("This Google account domain is not allowed");
      }
    }

    return {
      openId: `google:${payload.sub}`,
      name: payload.name ?? payload.email.split("@")[0] ?? "Google operator",
      email: payload.email,
      picture: payload.picture ?? null,
    };
  }
}

class SessionService {
  private getSessionSecret() {
    if (!ENV.cookieSecret) throw new Error("JWT_SECRET is not configured");
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async createSessionToken(user: Pick<SessionPayload, "openId" | "name" | "email">) {
    const now = Date.now();
    return new SignJWT(user)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(Math.floor(now / 1000))
      .setExpirationTime(Math.floor((now + ONE_YEAR_MS) / 1000))
      .sign(this.getSessionSecret());
  }

  async verifySession(cookieValue: string | undefined | null): Promise<SessionPayload | null> {
    if (!cookieValue) return null;
    try {
      const { payload } = await jwtVerify(cookieValue, this.getSessionSecret(), { algorithms: ["HS256"] });
      const openId = typeof payload.openId === "string" ? payload.openId : "";
      const name = typeof payload.name === "string" ? payload.name : "";
      const email = typeof payload.email === "string" ? payload.email : "";
      if (!openId || !name || !email) return null;
      return { openId, name, email };
    } catch {
      return null;
    }
  }
}

class AuthSDK {
  readonly google = new GoogleAuthService();
  private readonly sessions = new SessionService();

  async createSessionToken(user: Pick<SessionPayload, "openId" | "name" | "email">) {
    return this.sessions.createSessionToken(user);
  }

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    let sessionToken = cookies[COOKIE_NAME];
    if (!sessionToken) {
      const authorization = req.headers.authorization;
      if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
        sessionToken = authorization.slice("Bearer ".length);
      }
    }

    const session = await this.sessions.verifySession(sessionToken);
    if (!session) throw ForbiddenError("Invalid Google session");

    const user = await db.getUserByOpenId(session.openId);
    if (!user) throw ForbiddenError("Google user not found");
    await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
    return user;
  }
}

export const sdk = new AuthSDK();
