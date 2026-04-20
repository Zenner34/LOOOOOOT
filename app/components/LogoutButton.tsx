"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/";
  }
  return <button className="btn" onClick={logout}>Log out</button>;
}
