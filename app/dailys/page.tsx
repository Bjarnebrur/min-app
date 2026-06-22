"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DailysPage() {
  const [dailys, setDailys] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [countdown, setCountdown] = useState("");
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: dailysData } = await supabase.from("dailys").select();
    if (dailysData) setDailys(dailysData);

    const { data: completions } = await supabase
      .from("daily_completions")
      .select()
      .eq("user_id", user.id)
      .eq("completed_date", today);
    if (completions) setCompletedIds(completions.map((c) => c.daily_id));

    let currentStreak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_completions")
        .select()
        .eq("user_id", user.id)
        .eq("completed_date", dateStr);
      if (data && data.length === dailysData?.length && dailysData?.length > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleComplete(dailyId: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("daily_completions").insert({
      user_id: user.id,
      daily_id: dailyId,
      completed_date: today,
    });

    fetchData();
  }

  return (
    <main className="p-8 mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block absolute left-8 top-8">← Tilbake</Link>
      <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-[var(--gold)]">☀ Dailys</h1>
        <div className="text-right">
          <p className="text-[var(--gray)] text-xs">Resettes om</p>
          <p className="text-[var(--foreground)] font-mono text-lg">{countdown}</p>
        </div>
      </div>
      <p className="text-[var(--yellow)] mb-6">🔥 Streak: {streak} dager på rad</p>

      <ul className="flex flex-col gap-3">
        {dailys.map((daily) => {
          const done = completedIds.includes(daily.id);
          return (
            <li key={daily.id} className={`border p-4 rounded-lg flex justify-between items-center ${
              done
                ? "bg-[var(--green)] border-[var(--green-light)]"
                : "bg-[var(--card-bg)] border-[var(--card-border)]"
            }`}>
              <div>
                <p className={`font-bold ${done ? "line-through text-green-200" : "text-[var(--foreground)]"}`}>{daily.title}</p>
                <p className={`text-sm ${done ? "text-green-300" : "text-[var(--gray)]"}`}>{daily.description}</p>
              </div>
              {!done && (
                <button
                  onClick={() => handleComplete(daily.id)}
                  className="bg-[var(--green)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--green-light)]"
                >
                  Fullført
                </button>
              )}
              {done && <span className="text-green-200 font-bold text-xl">✓</span>}
            </li>
          );
        })}
      </ul>
      </div>
    </main>
  );
}
