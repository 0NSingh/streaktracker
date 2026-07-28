"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { userAtom } from "@/packages/lib/store";
import { computeStreak, generateHeatmapData } from "@/packages/lib/streak-utils";

type EntryEdit = {
  id: string;
  previousNote: string | null;
  previousWeight: number | null;
  newNote: string | null;
  newWeight: number | null;
  createdAt: string;
};

type Entry = {
  id: string;
  date: string;
  note: string | null;
  weight: number;
  createdAt: string;
  updatedAt?: string;
  edits: EntryEdit[];
};

type GoalData = {
  id: string;
  title: string;
  slug: string;
  userId: string;
  user: { name: string | null };
  _count: { entries: number };
};

function Heatmap({ entries }: { entries: Entry[] }) {
  const entryData = entries.map((e) => ({ date: new Date(e.date), weight: e.weight }));
  const days = generateHeatmapData(entryData, 26);
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const levels = ["bg-zinc-800", "bg-green-900", "bg-green-700", "bg-green-500", "bg-green-400"];
  return (
    <div className="flex gap-[3px] overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day) => (
            <div key={day.date} className={`h-3 w-3 rounded-sm ${levels[day.level]}`} title={`${day.date}: ${day.level > 0 ? "Logged" : "No entry"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ShareDialog({ slug, onClose }: { slug: string; onClose: () => void }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/g/${slug}` : `/g/${slug}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Share your streak</h3>
        <p className="text-sm text-zinc-400 mb-3">Anyone with this link can see your learning log.</p>
        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 mb-4">
          <code className="flex-1 text-sm text-zinc-300 truncate">{url}</code>
          <button onClick={copy} className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-zinc-200">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({ entry, onConfirm, onCancel }: { entry: Entry; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-2">Delete entry?</h3>
        <p className="text-zinc-400 text-sm mb-1">
          {new Date(entry.date).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
        </p>
        {entry.note && <p className="text-zinc-300 text-sm mb-4">&ldquo;{entry.note}&rdquo;</p>}
        {!entry.note && <p className="text-zinc-500 text-sm mb-4">No note</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">Delete</button>
        </div>
      </div>
    </div>
  );
}

function EditDialog({ entry, onSave, onCancel, isOwner }: { entry: Entry; onSave: (data: { note: string; weight: number; date: string }) => void; onCancel: () => void; isOwner: boolean }) {
  const [note, setNote] = useState(entry.note || "");
  const [weight, setWeight] = useState(entry.weight);
  const [date, setDate] = useState(entry.date.slice(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Edit entry</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-zinc-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Weight (1-5)</label>
            <input type="number" min={1} max={5} value={weight} onChange={(e) => setWeight(Number(e.target.value))}
              className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-zinc-500" />
          </div>
        </div>

        {entry.edits.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Edit history</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {entry.edits.map((edit) => (
                <div key={edit.id} className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400">
                  <span className="text-zinc-500">{new Date(edit.createdAt).toLocaleString()}</span>
                  {edit.previousNote !== null && edit.newNote !== null && (
                    <p className="text-zinc-300 mt-1">
                      Note: &ldquo;{edit.previousNote}&rdquo; → &ldquo;{edit.newNote}&rdquo;
                    </p>
                  )}
                  {edit.previousWeight !== null && edit.newWeight !== null && (
                    <p className="text-zinc-300">Weight: {edit.previousWeight} → {edit.newWeight}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && (
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
            <button onClick={() => onSave({ note: note || "", weight, date })} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoalPage() {
  const params = useParams<{ slug: string }>();
  const user = useAtomValue(userAtom);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [note, setNote] = useState("");
  const [logging, setLogging] = useState(false);
  const [deleting, setDeleting] = useState<Entry | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showShare, setShowShare] = useState(false);

  const fetchEntries = useCallback(async () => {
    const sp = new URLSearchParams();
    if (dateFrom) sp.set("from", dateFrom);
    if (dateTo) sp.set("to", dateTo);
    const qs = sp.toString();
    try {
      const r = await fetch(`/api/goals/${params.slug}/entries${qs ? `?${qs}` : ""}`);
      if (!r.ok) return;
      const data = await r.json();
      if (data.entries) setEntries(data.entries);
    } catch (e) {
      console.error("Failed to fetch entries:", e);
    }
  }, [params.slug, dateFrom, dateTo]);

  useEffect(() => {
    fetch(`/api/goals/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.goal) setGoal(data.goal);
      });
    fetchEntries();
  }, [params.slug, fetchEntries]);

  const logEntry = useCallback(async () => {
    setLogging(true);
    const today = new Date().toISOString();
    await fetch(`/api/goals/${params.slug}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, note: note || null }),
    });
    setNote("");
    await fetchEntries();
    setLogging(false);
  }, [params.slug, note, fetchEntries]);

  const deleteEntry = useCallback(async (entry: Entry) => {
    await fetch(`/api/goals/${params.slug}/entries/${entry.id}`, { method: "DELETE" });
    setDeleting(null);
    await fetchEntries();
  }, [params.slug, fetchEntries]);

  const saveEdit = useCallback(async (entry: Entry, data: { note: string; weight: number; date: string }) => {
    await fetch(`/api/goals/${params.slug}/entries/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    await fetchEntries();
  }, [params.slug, fetchEntries]);

  const isOwner = goal && user?.id === goal.userId;
  const entryDates = entries.map((e) => ({ date: new Date(e.date), weight: e.weight }));
  const streak = computeStreak(entryDates);

  if (!goal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          {user && (
            <>
              <span className="mx-2">·</span>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            </>
          )}
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">{goal.title}</h1>
            <p className="text-zinc-500">
              by {goal.user.name || "Anonymous"} · {entries.length} entries
            </p>
          </div>
          <button onClick={() => setShowShare(true)}
            className="shrink-0 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:border-zinc-500">
            Share
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="text-3xl font-bold text-white">{streak.currentStreak}</div>
            <div className="text-xs text-zinc-500 mt-1">Current streak</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="text-3xl font-bold text-white">{streak.longestStreak}</div>
            <div className="text-xs text-zinc-500 mt-1">Best streak</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="text-3xl font-bold text-white">{streak.totalEntries}</div>
            <div className="text-xs text-zinc-500 mt-1">Days active</div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Activity (last 6 months)</h2>
          <Heatmap entries={entries} />
        </div>

        {isOwner && (
          <div className="flex gap-3 mb-10">
            <input
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
              placeholder="What did you learn today?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={logging}
            />
            <button
              onClick={logEntry}
              disabled={logging}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              Log entry
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Entry log</h2>

          <div className="flex gap-3 mb-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white text-sm outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white text-sm outline-none focus:border-zinc-500" />
            </div>
            {(dateFrom || dateTo) && (
              <div className="flex items-end">
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white">
                  Clear
                </button>
              </div>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No entries match your filters.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const isEdited = entry.createdAt !== entry.updatedAt;
                return (
                  <div key={entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">
                            {new Date(entry.date).toLocaleDateString(undefined, {
                              weekday: "short", year: "numeric", month: "short", day: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isEdited && (
                            <span className="text-xs text-zinc-600 italic">edited</span>
                          )}
                        </div>
                        {entry.note && (
                          <div className="text-white mt-1">{entry.note}</div>
                        )}
                        {entry.weight > 1 && (
                          <div className="text-xs text-zinc-500 mt-1">Weight: {entry.weight}</div>
                        )}
                        {entry.edits.length > 0 && (
                          <button
                            onClick={() => setEditing(entry)}
                            className="text-xs text-zinc-600 hover:text-zinc-400 mt-1"
                          >
                            {entry.edits.length} edit{entry.edits.length > 1 ? "s" : ""}
                          </button>
                        )}
                      </div>
                      {isOwner && (
                        <div className="flex gap-2 ml-3 shrink-0">
                          <button
                            onClick={() => setEditing(entry)}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-zinc-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleting(entry)}
                            className="rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950 hover:border-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {deleting && (
        <DeleteDialog
          entry={deleting}
          onConfirm={() => deleteEntry(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}

      {editing && (
        <EditDialog
          entry={editing}
          isOwner={!!isOwner}
          onSave={(data) => saveEdit(editing, data)}
          onCancel={() => setEditing(null)}
        />
      )}

      {showShare && (
        <ShareDialog slug={goal.slug} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
