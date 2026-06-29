"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: allRewards } = await supabase.from("rewards").select().order("requirement_level", { ascending: true });
      if (allRewards) setRewards(allRewards);
      const { data: userRewards } = await supabase.from("user_rewards").select().eq("user_id", user.id);
      if (userRewards) setUnlockedIds(userRewards.map((ur) => ur.reward_id));
    }
    fetchData();
  }, []);

  const avatarRewards = rewards.filter((r) => r.type === "avatar");
  const titleRewards = rewards.filter((r) => r.type === "title");
  const frameRewards = rewards.filter((r) => r.type === "frame");

  function RewardCard({ reward }: { reward: any }) {
    const unlocked = unlockedIds.includes(reward.id);
    return (
      <div className={`bg-[var(--card-bg)] border ${unlocked ? "border-[var(--gold-dark)]" : "border-[var(--card-border)]"} p-4 rounded-lg ${!unlocked ? "opacity-40" : ""}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-[var(--foreground)]">
            {reward.type === "title" ? "🏷️" : reward.type === "frame" ? "🖼️" : "⚔️"} {reward.name}
          </span>
          {unlocked ? (
            <span className="text-[var(--green-light)] text-sm">✓ Unlocka</span>
          ) : (
            <span className="text-[var(--gray)] text-xs">🔒 Lvl {reward.requirement_level}</span>
          )}
        </div>
        <p className="text-[var(--gray)] text-xs">{reward.description}</p>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-2 text-[var(--gold)]">🏆 Alle Rewards</h1>
      <p className="text-[var(--gray)] mb-6">{unlockedIds.length} / {rewards.length} unlocka</p>

      {avatarRewards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--gold)] mb-3">⚔️ Avatar-utstyr</h2>
          <div className="flex flex-col gap-3">
            {avatarRewards.map((r) => <RewardCard key={r.id} reward={r} />)}
          </div>
        </div>
      )}

      {titleRewards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--gold)] mb-3">🏷️ Titler</h2>
          <div className="flex flex-col gap-3">
            {titleRewards.map((r) => <RewardCard key={r.id} reward={r} />)}
          </div>
        </div>
      )}

      {frameRewards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--gold)] mb-3">🖼️ Rammer</h2>
          <div className="flex flex-col gap-3">
            {frameRewards.map((r) => <RewardCard key={r.id} reward={r} />)}
          </div>
        </div>
      )}
    </main>
  );
}
