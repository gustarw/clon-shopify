import "server-only";
import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE_NAME = "sn_session";
const SESSION_DAYS = 30;
const developmentSecret = new Uint8Array(randomBytes(32));

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  return developmentSecret;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: Number(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role === "admin" ? "admin" : "customer",
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function getCookieName(): string {
  return COOKIE_NAME;
}
