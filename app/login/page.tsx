"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/overview";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "login failed");
      }
      // Only follow internal redirects (defence against open-redirect).
      router.push(next.startsWith("/") ? next : "/overview");
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 sm:mt-16 animate-fade-in">
      <div className="flex flex-col items-center gap-3 mb-6">
        <img
          src="/logo.PNG"
          alt="Rising Sun"
          width={64}
          height={64}
          className="w-16 h-16 rounded-xl ring-1 ring-gold-400/40 shadow-glow"
        />
        <div className="text-center">
          <span className="heading-eyebrow">Admin</span>
          <h1 className="text-2xl font-bold tracking-tight">Rising Sun</h1>
          <p className="text-sm text-neutral-400 mt-1">Sign in to access loot management.</p>
        </div>
      </div>

      <div className="panel p-5">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              autoFocus
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || !pw}>
            {busy ? "…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
