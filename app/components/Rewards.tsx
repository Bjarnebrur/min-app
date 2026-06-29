"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface RewardsProps {
  level: number;
}

export default function Rewards({ level }: RewardsProps) {
  const [allRewards, setAllRewards] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [newReward, setNewReward] = useState<string | null>(null);
  const supabase = createClient();

  async function fetchRewards() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rewards } = await supabase.from("rewards").select().order("requirement_level", { ascending: true });
    if (rewards) setAllRewards(rewards);

    const { data: userRewards } = await supabase.from("user_rewards").select().eq("user_id", user.id);
    if (userRewards) setUnlockedIds(userRewards.map((ur) => ur.reward_id));
  }

  async function checkNewRewards() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const reward of allRewards) {
      if (reward.requirement_type === "main_level" && level >= reward.requirement_level && !unlockedIds.includes(reward.id)) {
        await supabase.from("user_rewards").insert({ user_id: user.id, reward_id: reward.id });
        setNewReward(reward.name);
        setUnlockedIds((prev) => [...prev, reward.id]);
        setTimeout(() => setNewReward(null), 3000);
      }
    }
  }

  useEffect(() => { fetchRewards(); }, []);
  useEffect(() => { if (allRewards.length > 0) checkNewRewards(); }, [level, allRewards]);

  const unlockedRewards = allRewards.filter((r) => unlockedIds.includes(r.id));
  const lockedRewards = allRewards.filter((r) => !unlockedIds.includes(r.id));

  return (
    <div className="flex flex-col gap-2 h-full">
      {newReward && (
        <div className="bg-[var(--gold-dark)] text-white text-center p-2 rounded text-sm animate-pulse">
          🎉 Ny reward: {newReward}!
        </div>
      )}

      {unlockedRewards.length > 0 && (
        <div>
          <p className="text-xs text-[var(--gold)] font-bold mb-1">Unlocka</p>
          <ul className="flex flex-col gap-1">
            {unlockedRewards.map((r) => (
              <li key={r.id} className="bg-[var(--background)] border border-[var(--gold-dark)] p-1.5 rounded text-xs flex justify-between items-center">
                <span className="text-[var(--foreground)]">{r.type === "title" ? "🏷️" : "⚔️"} {r.name}</span>
                <span className="text-[var(--green-light)]">✓</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lockedRewards.length > 0 && (
        <div>
          <p className="text-xs text-[var(--gray)] font-bold mb-1 mt-2">Låst</p>
          <ul className="flex flex-col gap-1">
            {lockedRewards.map((r) => (
              <li key={r.id} className="bg-[var(--background)] border border-[var(--card-border)] p-1.5 rounded text-xs flex justify-between items-center opacity-50">
                <span className="text-[var(--gray)]">🔒 {r.name}</span>
                <span className="text-[var(--gray)]">Lvl {r.requirement_level}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
