"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Belum dapat keluar dari sesi.");
      }

      window.location.assign("/admin/login");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Belum dapat keluar dari sesi.",
      );
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5" aria-busy={pending}>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-paper px-4 text-sm font-bold text-accent transition-colors hover:border-primary hover:text-primary-dark disabled:cursor-wait disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {pending ? "Keluar..." : "Keluar"}
      </button>
      {error ? (
        <p className="max-w-52 text-right text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
