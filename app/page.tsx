"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAtom } from "jotai";
import { userAtom, authLoadingAtom } from "@/packages/lib/store";

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  const [checking] = useAtom(authLoadingAtom);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    if (!user) {
      router.push("/signin");
      return;
    }

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    if (res.ok) {
      const { goal } = await res.json();
      router.push(`/g/${goal.slug}`);
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-lg text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Streak Tracker
          </h1>
        </div>
        <p className="text-zinc-400 mb-10 text-lg">
          Declare what you&apos;re learning. Build a streak. Share your journey.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-lg text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            placeholder="What are you learning?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full rounded-xl bg-white py-4 text-lg font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Start tracking →"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="text-zinc-400 hover:text-white">
                Dashboard
              </Link>
              <button onClick={signOut} className="text-zinc-500 hover:text-white">
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/signin")}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              Sign in to save your goals
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
