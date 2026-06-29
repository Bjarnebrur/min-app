import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import ResetButton from "@/app/components/ResetButton";
import LpcAvatar from "@/app/components/LpcAvatar";
import Notes from "@/app/components/Notes";
import Rewards from "@/app/components/Rewards";
import { xpRequired } from "@/lib/xp";

const STATS = [
  { key: "strength", label: "Strength", icon: "💪" },
  { key: "intellect", label: "Intellect", icon: "🧠" },
  { key: "agility", label: "Agility", icon: "⚡" },
  { key: "stamina", label: "Stamina", icon: "❤️" },
  { key: "social", label: "Social", icon: "🗣️" },
  { key: "creativity", label: "Creativity", icon: "🎨" },
  { key: "discipline", label: "Discipline", icon: "⚖️" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user!.id)
    .single();

  if (!profile) redirect("/setup");

  const maxStat = Math.max(...STATS.map((s) => profile[s.key] || 0), 1);

  return (
    <main className="p-6 h-screen overflow-hidden">
      <div className="text-center mb-4">
        <Link href="/karakter" className="text-5xl font-bold text-[var(--gold)] hover:underline">{profile.character_name}</Link>
        <p className="text-[var(--gray)]">@{profile.username}</p>
        <div className="mt-2">
          <p className="text-xl font-bold">Level {profile.level}</p>
          <div className="w-48 mx-auto bg-[var(--card-bg)] rounded-full h-3 mt-1 border border-[var(--card-border)]">
            <div className="bg-[var(--xp-bar)] h-full rounded-full" style={{ width: `${(profile.xp / xpRequired(profile.level)) * 100}%` }}></div>
          </div>
          <p className="text-sm text-[var(--gray)] mt-1">{profile.xp} / {xpRequired(profile.level)} XP</p>
        </div>
        <LogoutButton />
        <ResetButton />
      </div>

      <div className="flex gap-8 justify-center">
        {/* Venstre side - Avatar + Stats */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Avatar placeholder */}
          <Link href="/avatar" className="bg-[var(--card-bg)] border-2 border-[var(--gold-dark)] rounded-lg p-2 flex items-center justify-center hover:border-[var(--gold)] transition-colors cursor-pointer">
            <LpcAvatar
              skin={profile.skin_color || "light"}
              hair={profile.hair_color || "halfmessy_orange"}
              head={profile.helmet || "none"}
              back={profile.cape || "none"}
              torso={profile.chest || profile.shirt_color || "cardigan_brown"}
              legs={profile.legs || "none"}
              feet={profile.feet || "none"}
              weapon={profile.weapon || "none"}
              shield={profile.shield || "none"}
              size={200}
            />
          </Link>

          {/* Stats */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3">
            <h2 className="font-bold text-sm text-[var(--gold)] mb-3">Stats</h2>
            <div className="flex flex-col gap-2">
              {STATS.map((stat) => (
                <div key={stat.key} className="flex items-center gap-2">
                  <span className="text-xs w-4">{stat.icon}</span>
                  <span className="text-xs text-[var(--gray)] w-16">{stat.label}</span>
                  <div className="flex-1 bg-[var(--background)] rounded-full h-2 border border-[var(--card-border)]">
                    <div className="bg-[var(--xp-bar)] h-full rounded-full" style={{ width: `${((profile[stat.key] || 0) / maxStat) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-[var(--gold)] w-6 text-right font-bold">{profile[stat.key] || 0}</span>
                </div>
              ))}
            </div>
            <Link href="/respec" className="text-[var(--gold)] text-xs mt-2 hover:underline block text-center">⚙ Respec stats</Link>
          </div>
        </div>

        {/* Midten - Navigasjon */}
        <div className="flex flex-col gap-5 w-96">
          <Link href="/skills" className="bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-lg hover:border-[var(--gold)] transition-colors">
            <h2 className="text-xl font-bold text-[var(--gold)]">⚔ Skills</h2>
            <p className="text-[var(--gray)] text-sm mt-1">Dine aktiviteter og hobbier</p>
          </Link>

          <Link href="/skole" className="bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-lg hover:border-[var(--gold)] transition-colors">
            <h2 className="text-xl font-bold text-[var(--gold)]">📚 Skole</h2>
            <p className="text-[var(--gray)] text-sm mt-1">Pensum, moduler og oppgaver</p>
          </Link>

          <Link href="/dailys" className="bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-lg hover:border-[var(--gold)] transition-colors">
            <h2 className="text-xl font-bold text-[var(--gold)]">☀ Dailys</h2>
            <p className="text-[var(--gray)] text-sm mt-1">Dagens gjøremål</p>
          </Link>
        </div>

        {/* Høyre side - Rewards + Notater */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 max-h-64 overflow-y-auto">
            <h2 className="font-bold text-sm text-[var(--gold)] mb-2">🏆 Rewards</h2>
            <Rewards level={profile.level} />
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 flex-1 min-h-48 max-h-96">
            <Notes />
          </div>
        </div>
      </div>
    </main>
  );
}
