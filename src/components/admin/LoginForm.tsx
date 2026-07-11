"use client";

import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";

interface LoginFormProps {
  nextPath: string;
  configured: boolean;
}

export default function LoginForm({ nextPath, configured }: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;

    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          next: nextPath,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; next?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Login belum dapat diproses.");
      }

      window.location.assign(payload?.next || "/admin");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Login belum dapat diproses.",
      );
      setPending(false);
    }
  }

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={handleSubmit}
      aria-busy={pending}
    >
      <div>
        <label htmlFor="admin-email" className="text-sm font-bold text-accent">
          Email admin
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!configured || pending}
          className="mt-2 min-h-12 w-full rounded-lg border border-neutral-300 bg-surface px-4 text-base text-accent placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="admin@contoh.com"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="text-sm font-bold text-accent"
        >
          Kata sandi
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured || pending}
          className="mt-2 min-h-12 w-full rounded-lg border border-neutral-300 bg-surface px-4 text-base text-accent placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Masukkan kata sandi"
        />
      </div>

      <div aria-live="polite">
        {!configured ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            Koneksi Supabase belum dikonfigurasi. Isi environment variable publik
            Supabase sebelum login.
          </p>
        ) : error ? (
          <p
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-100"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!configured || pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {pending ? "Memeriksa akun..." : "Masuk ke dashboard"}
      </button>
    </form>
  );
}
