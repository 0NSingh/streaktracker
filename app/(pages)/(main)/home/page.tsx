"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Goal = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  _count: { entries: number };
};

export default function DashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) {
          router.push("/signin");
          return;
        }
        return fetch("/api/goals").then((r) => r.json());
      })
      .then((data) => {
        if (data) setGoals(data.goals);
        setLoading(false);
      });
  }, [router]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button
            onClick={async () => {
              await fetch("/api/auth/signout", { method: "POST" });
              router.push("/");
            }}
            className="text-sm text-zinc-500 hover:text-white"
          >
            Sign out
          </button>
        </div>

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
                <h2 className="text-lg font-semibold text-white">{goal.title}</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {goal._count.entries} entries · Created{" "}
                  {new Date(goal.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
