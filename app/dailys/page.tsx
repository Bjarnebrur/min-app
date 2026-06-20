"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DailysPage() {
  const [dailys, setDailys] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
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

    // Beregn streak
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
    <main className="p-8 max-w-md mx-auto mt-10">
      <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-2">☀ Dailys</h1>
      <p className="text-gray-500 mb-6">Streak: {streak} dager på rad</p>

      <ul className="flex flex-col gap-3">
        {dailys.map((daily) => {
          const done = completedIds.includes(daily.id);
          return (
            <li key={daily.id} className={`border p-4 rounded-lg flex justify-between items-center ${done ? "bg-green-50 border-green-300" : ""}`}>
              <div>
                <p className={`font-bold ${done ? "line-through text-green-700" : ""}`}>{daily.title}</p>
                <p className="text-gray-500 text-sm">{daily.description}</p>
              </div>
              {!done && (
                <button
                  onClick={() => handleComplete(daily.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Fullført
                </button>
              )}
              {done && <span className="text-green-600 font-bold">✓</span>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}