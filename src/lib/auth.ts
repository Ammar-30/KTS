import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";

export const SESSION_COOKIE = "session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export type SessionPayload = {
  sub: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "TRANSPORT" | "ADMIN";
};

export async function signSession(payload: SessionPayload) {
  // 7 days expiry
  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const { sub, email, role } = payload as SessionPayload;
    if (!sub || !email || !role) return null;
    return { sub, email, role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  return s;
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
