import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = { openId: string; name: string; email: string };
export type AuthenticatedUser = User;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, storedKey] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !storedKey) return false;
  const derivedKey = scryptSync(password, salt, 64);
  const expectedKey = Buffer.from(storedKey, "hex");
  return derivedKey.length === expectedKey.length && timingSafeEqual(derivedKey, expectedKey);
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
      return openId && name && email ? { openId, name, email } : null;
    } catch {
      return null;
    }
  }
}

class AuthSDK {
  private readonly sessions = new SessionService();

  async createSessionToken(user: Pick<SessionPayload, "openId" | "name" | "email">) {
    return this.sessions.createSessionToken(user);
  }

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    let sessionToken = cookies[COOKIE_NAME];
    if (!sessionToken) {
      const authorization = req.headers.authorization;
      if (typeof authorization === "string" && authorization.startsWith("Bearer ")) sessionToken = authorization.slice("Bearer ".length);
    }
    const session = await this.sessions.verifySession(sessionToken);
    if (!session) throw ForbiddenError("Invalid email session");
    const user = await db.getUserByOpenId(session.openId);
    if (!user) throw ForbiddenError("Account not found");
    await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
    return user;
  }
}

export const sdk = new AuthSDK();
export { COOKIE_NAME };
