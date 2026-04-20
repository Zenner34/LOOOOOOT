import { NextResponse } from "next/server";
import { checkPassword, issueCookieValue, cookieOptions, cookieName } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password ?? "");
  if (!password) {
    return NextResponse.json({ error: "password required" }, { status: 400 });
  }
  const ok = await checkPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName(), await issueCookieValue(), cookieOptions());
  return res;
}
