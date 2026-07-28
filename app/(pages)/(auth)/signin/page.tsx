"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Sign in</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="rounded-xl bg-white py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
