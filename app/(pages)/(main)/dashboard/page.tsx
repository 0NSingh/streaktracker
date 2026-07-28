"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAtom } from "jotai";
import { userAtom, authLoadingAtom } from "@/packages/lib/store";

type Goal = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  _count: { entries: number };
  currentStreak: number;
  longestStreak: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [checking] = useAtom(authLoadingAtom);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!checking && !user) {
      router.push("/signin");
      return;
    }
    if (!user) return;
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => {
        setGoals(data.goals);
        setLoading(false);
      });
  }, [user, checking, router]);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    if (res.ok) {
      const { goal } = await res.json();
      router.push(`/g/${goal.slug}`);
    }
    setCreating(false);
  }

  if (checking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const totalEntries = goals.reduce((s, g) => s + g._count.entries, 0);
  const totalStreak = goals.reduce((s, g) => s + g.currentStreak, 0);
  const bestStreak = Math.max(...goals.map((g) => g.longestStreak), 0);
  const activeGoals = goals.filter((g) => g.currentStreak > 0).length;

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white">
            Home
          </Link>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <div className="text-xl font-bold text-white">{goals.length}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Goals</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <div className="text-xl font-bold text-white">{totalEntries}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Entries</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <div className="text-xl font-bold text-white">{activeGoals}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Active</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <div className="text-xl font-bold text-white">{bestStreak}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Best streak</div>
            </div>
          </div>
        )}

        <form onSubmit={createGoal} className="flex gap-3 mb-10">
          <input
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            placeholder="New learning goal..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            Create
          </button>
        </form>

        {goals.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">
            No goals yet. Create your first one above!
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <Link
                key={goal.id}
                href={`/g/${goal.slug}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{goal.title}</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      {goal._count.entries} entries · Created{" "}
                      {new Date(goal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-lg font-bold text-white">{goal.currentStreak}</div>
                      <div className="text-xs text-zinc-500">streak</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-zinc-400">{goal.longestStreak}</div>
                      <div className="text-xs text-zinc-500">best</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
