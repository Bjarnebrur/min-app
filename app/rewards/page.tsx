"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import FrameOverlay from "@/app/components/FrameOverlay";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [activeFrame, setActiveFrame] = useState<string>("none");
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: allRewards } = await supabase.from("rewards").select().order("requirement_level", { ascending: true });
      if (allRewards) setRewards(allRewards);
      const { data: userRewards } = await supabase.from("user_rewards").select().eq("user_id", user.id);
      if (userRewards) setUnlockedIds(userRewards.map((ur) => ur.reward_id));
      const { data: profile } = await supabase.from("profiles").select("active_frame").eq("id", user.id).single();
      if (profile) setActiveFrame(profile.active_frame || "none");
    }
    fetchData();
  }, []);

  async function handleSetFrame(frameId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ active_frame: frameId }).eq("id", user.id);
    setActiveFrame(frameId);
  }

  const avatarRewards = rewards.filter((r) => r.type === "avatar");
  const titleRewards = rewards.filter((r) => r.type === "title");
  const frameRewards = rewards.filter((r) => r.type === "frame");

  function RewardCard({ reward }: { reward: any }) {
    const unlocked = unlockedIds.includes(reward.id);
    const isFrame = reward.type === "frame";
    const isActive = isFrame && activeFrame === reward.frame_id;

    return (
      <div className={`bg-[var(--card-bg)] border ${isActive ? "border-[var(--gold)]" : unlocked ? "border-[var(--gold-dark)]" : "border-[var(--card-border)]"} p-4 rounded-lg ${!unlocked ? "opacity-40" : ""}`}>
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
        <p className="text-[var(--gray)] text-xs mb-3">{reward.description}</p>

        {isFrame && unlocked && reward.frame_id && (
          <div className="flex items-center gap-3">
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <FrameOverlay src={`/frames/${reward.frame_id}.png`} size={64} />
            </div>
            <button
              onClick={() => handleSetFrame(isActive ? "none" : reward.frame_id)}
              className={`text-xs px-3 py-1.5 rounded border ${isActive ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)] hover:border-[var(--gold)] hover:text-[var(--gold)]"} transition-colors`}
            >
              {isActive ? "✓ Aktiv" : "Bruk ramme"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="p-8 max-w-5xl mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-2 text-[var(--gold)]">🏆 Alle Rewards</h1>
      <p className="text-[var(--gray)] mb-6">{unlockedIds.length} / {rewards.length} unlocka</p>

      <div className="flex gap-6 items-start">
        {avatarRewards.length > 0 && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--gold)] mb-3">⚔️ Avatar-utstyr</h2>
            <div className="flex flex-col gap-3">
              {avatarRewards.map((r) => <RewardCard key={r.id} reward={r} />)}
            </div>
          </div>
        )}

        {titleRewards.length > 0 && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--gold)] mb-3">🏷️ Titler</h2>
            <div className="flex flex-col gap-3">
              {titleRewards.map((r) => <RewardCard key={r.id} reward={r} />)}
            </div>
          </div>
        )}

        {frameRewards.length > 0 && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--gold)] mb-3">🖼️ Rammer</h2>
            <div className="flex flex-col gap-3">
              {frameRewards.map((r) => <RewardCard key={r.id} reward={r} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
