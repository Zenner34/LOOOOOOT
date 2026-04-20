"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

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
      router.push("/overview");
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto panel p-6 mt-10">
      <h1 className="text-lg font-semibold mb-4">Admin login</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            autoFocus
            value={pw}
            onChange={e => setPw(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn-primary w-full" disabled={busy || !pw}>
          {busy ? "…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
