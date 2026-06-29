"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LpcAvatar, { SKIN_OPTIONS, HAIR_OPTIONS, TORSO_OPTIONS } from "@/app/components/LpcAvatar";

const STATS = ["Strength", "Intellect", "Agility", "Stamina", "Social", "Creativity", "Discipline"];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [age, setAge] = useState(18);
  const [stats, setStats] = useState<Record<string, number>>({
    Strength: 0, Intellect: 0, Agility: 0, Stamina: 0, Social: 0, Creativity: 0, Discipline: 0,
  });
  const [skinId, setSkinId] = useState(SKIN_OPTIONS[0].id);
  const [hairId, setHairId] = useState(HAIR_OPTIONS[0].id);
  const [clothesId, setClothesId] = useState(TORSO_OPTIONS[0].id);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const pointsUsed = Object.values(stats).reduce((a, b) => a + b, 0);
  const pointsLeft = age - pointsUsed;

  function handleStatChange(stat: string, delta: number) {
    const newVal = stats[stat] + delta;
    if (newVal < 0) return;
    if (delta > 0 && pointsLeft <= 0) return;
    setStats({ ...stats, [stat]: newVal });
  }

  async function handleSubmit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      character_name: characterName,
      age,
      strength: stats.Strength,
      intellect: stats.Intellect,
      agility: stats.Agility,
      stamina: stats.Stamina,
      social: stats.Social,
      creativity: stats.Creativity,
      discipline: stats.Discipline,
      skin_color: skinId,
      hair_color: hairId,
      hair_style: "lpc",
      shirt_color: clothesId,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  if (step === 1) {
    return (
      <main className="p-8 max-w-sm mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-6 text-[var(--gold)]">Lag din karakter</h1>
        <p className="text-[var(--gray)] mb-4">Steg 1 av 3 — Navn</p>
        {error && <p className="text-[var(--red)] mb-4">{error}</p>}
        <form onSubmit={(e) => { e.preventDefault(); if (!username.trim() || !characterName.trim()) { setError("Fyll ut alle felt"); return; } setError(""); setStep(2); }} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Brukernavn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] p-2 rounded text-[var(--foreground)]"
          />
          <input
            type="text"
            placeholder="Karakternavn"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] p-2 rounded text-[var(--foreground)]"
          />
          <button type="submit" className="bg-[var(--gold-dark)] text-white p-2 rounded hover:bg-[var(--gold)]">
            Neste →
          </button>
        </form>
      </main>
    );
  }

  if (step === 2) {
    return (
      <main className="p-8 max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-2 text-[var(--gold)]">Fordel poeng</h1>
        <p className="text-[var(--gray)] mb-2">Steg 2 av 3 — Din alder bestemmer hvor mange poeng du har.</p>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-[var(--foreground)] font-bold">Alder:</label>
          <button onClick={() => setAge(Math.max(1, age - 1))} className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] w-8 h-8 rounded hover:border-[var(--gold)]">-</button>
          <span className="text-2xl font-bold text-[var(--gold)] w-10 text-center">{age}</span>
          <button onClick={() => setAge(age + 1)} className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] w-8 h-8 rounded hover:border-[var(--gold)]">+</button>
        </div>

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
          <button onClick={() => setStep(1)} className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] p-2 rounded flex-1 hover:border-[var(--gold)]">
            ← Tilbake
          </button>
          <button onClick={() => { if (pointsLeft > 0) { setError(`Du har ${pointsLeft} poeng igjen!`); return; } setError(""); setStep(3); }} className="bg-[var(--gold-dark)] text-white p-2 rounded flex-1 hover:bg-[var(--gold)]">
            Neste →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-2 text-[var(--gold)]">Tilpass utseende</h1>
      <p className="text-[var(--gray)] mb-6">Steg 3 av 3 — Lag din avatar.</p>

      <div className="flex gap-8 justify-center">
        <div className="bg-[var(--card-bg)] border-2 border-[var(--gold-dark)] rounded-lg p-4 flex items-center justify-center">
          <LpcAvatar skin={skinId} hair={hairId} torso={clothesId} size={220} />
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-2">Hudfarge</p>
            <div className="flex gap-2">
              {SKIN_OPTIONS.map((s) => (
                <button key={s.id} onClick={() => setSkinId(s.id)} className={`px-3 py-1 rounded text-sm border ${skinId === s.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-2">Hår</p>
            <div className="flex flex-wrap gap-2">
              {HAIR_OPTIONS.map((h) => (
                <button key={h.id} onClick={() => setHairId(h.id)} className={`px-3 py-1 rounded text-sm border ${hairId === h.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-2">Klær</p>
            <div className="flex flex-wrap gap-2">
              {TORSO_OPTIONS.map((c) => (
                <button key={c.id} onClick={() => setClothesId(c.id)} className={`px-3 py-1 rounded text-sm border ${clothesId === c.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-[var(--red)] mt-4">{error}</p>}

      <div className="flex gap-3 mt-6">
        <button onClick={() => setStep(2)} className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] p-2 rounded flex-1 hover:border-[var(--gold)]">
          ← Tilbake
        </button>
        <button onClick={handleSubmit} className="bg-[var(--gold-dark)] text-white p-2 rounded flex-1 hover:bg-[var(--gold)]">
          Opprett karakter
        </button>
      </div>
    </main>
  );
}
