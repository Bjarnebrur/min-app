"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATS = ["Strength", "Intellect", "Agility", "Stamina", "Social", "Creativity", "Discipline"];
const STAT_KEYS: Record<string, string> = {
  Strength: "strength", Intellect: "intellect", Agility: "agility", Stamina: "stamina",
  Social: "social", Creativity: "creativity", Discipline: "discipline",
};

export default function RespecPage() {
  const [age, setAge] = useState(18);
  const [stats, setStats] = useState<Record<string, number>>({
    Strength: 0, Intellect: 0, Agility: 0, Stamina: 0, Social: 0, Creativity: 0, Discipline: 0,
  });
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select().eq("id", user.id).single();
      if (data) {
        setAge(data.age || 18);
        setStats({
          Strength: data.strength || 0,
          Intellect: data.intellect || 0,
          Agility: data.agility || 0,
          Stamina: data.stamina || 0,
          Social: data.social || 0,
          Creativity: data.creativity || 0,
          Discipline: data.discipline || 0,
        });
      }
    }
    fetchProfile();
  }, []);

  const pointsUsed = Object.values(stats).reduce((a, b) => a + b, 0);
  const pointsLeft = age - pointsUsed;

  function handleStatChange(stat: string, delta: number) {
    const newVal = stats[stat] + delta;
    if (newVal < 0) return;
    if (delta > 0 && pointsLeft <= 0) return;
    setStats({ ...stats, [stat]: newVal });
  }

  function handleReset() {
    setStats({ Strength: 0, Intellect: 0, Agility: 0, Stamina: 0, Social: 0, Creativity: 0, Discipline: 0 });
  }

  async function handleSave() {
    if (pointsLeft > 0) {
      setError(`Du har ${pointsLeft} poeng igjen!`);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const update: Record<string, number> = {};
    for (const [stat, key] of Object.entries(STAT_KEYS)) {
      update[key] = stats[stat];
    }

    await supabase.from("profiles").update(update).eq("id", user.id);
    router.push("/");
  }

  return (
    <main className="p-8 max-w-md mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-2 text-[var(--gold)]">Respec Stats</h1>
      <p className="text-[var(--gray)] mb-6">Fordel dine {age} poeng på nytt.</p>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-[var(--foreground)]">Poeng igjen:</p>
          <p className={`text-2xl font-bold ${pointsLeft > 0 ? "text-[var(--gold)]" : "text-[var(--green-light)]"}`}>{pointsLeft}</p>
        </div>

        <div className="flex flex-col gap-3">
          {STATS.map((stat) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-[var(--foreground)] w-24 text-sm">{stat}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleStatChange(stat, -1)} className="bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] w-7 h-7 rounded text-sm hover:border-[var(--red)]">-</button>
                <span className="text-[var(--gold)] font-bold w-8 text-center">{stats[stat]}</span>
                <button onClick={() => handleStatChange(stat, 1)} className="bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] w-7 h-7 rounded text-sm hover:border-[var(--gold)]">+</button>
              </div>
              <div className="w-24 bg-[var(--background)] rounded-full h-2 border border-[var(--card-border)]">
                <div className="bg-[var(--xp-bar)] h-full rounded-full" style={{ width: `${Math.min((stats[stat] / age) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-[var(--red)] mb-4">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleReset} className="bg-[var(--red)] text-white p-2 rounded flex-1 hover:opacity-80">
          Reset alle
        </button>
        <button onClick={handleSave} className="bg-[var(--gold-dark)] text-white p-2 rounded flex-1 hover:bg-[var(--gold)]">
          Lagre
        </button>
      </div>
    </main>
  );
}
