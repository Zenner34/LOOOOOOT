import bcrypt from "bcryptjs";

const COOKIE_NAME = "loot_admin";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days
const enc = new TextEncoder();

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET not set");
  return s;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verify(token: string): Promise<boolean> {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const provided = token.slice(idx + 1);
  const expected = await hmac(payload);
  if (!constantTimeEq(provided, expected)) return false;
  const iat = Number(payload.split(":")[1]);
  if (!Number.isFinite(iat)) return false;
  const ageS = (Date.now() - iat) / 1000;
  return ageS < MAX_AGE_S;
}

export async function issueCookieValue(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  };
}

export function cookieName(): string {
  return COOKIE_NAME;
}

function extractCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.split(/;\s*/).find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!m) return null;
  return decodeURIComponent(m.slice(COOKIE_NAME.length + 1));
}

export async function isAdminFromHeader(cookieHeader: string | null): Promise<boolean> {
  const token = extractCookie(cookieHeader);
  if (!token) return false;
  try { return await verify(token); } catch { return false; }
}

// Used by server components (Node runtime).
export async function isAdmin(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  try { return await verify(token); } catch { return false; }
}

export async function checkPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}
