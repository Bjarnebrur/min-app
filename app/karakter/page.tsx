import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { xpRequired } from "@/lib/xp";

export default async function KarakterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user!.id)
    .single();

  if (!profile) redirect("/setup");

  const { data: skills } = await supabase
    .from("skills")
    .select()
    .eq("user_id", user!.id);

  const { data: completedTasks } = await supabase
    .from("tasks")
    .select()
    .eq("user_id", user!.id)
    .eq("done", true);

  const { data: completedSchool } = await supabase
    .from("school_items")
    .select()
    .eq("user_id", user!.id)
    .eq("status", "completed");

  const totalCompleted = (completedTasks?.length ?? 0) + (completedSchool?.length ?? 0);

  return (
    <main className="p-8 max-w-lg mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 text-center mb-6">
        <div className="text-6xl mb-3">⚔️</div>
        <h1 className="text-3xl font-bold text-[var(--gold)]">{profile.character_name}</h1>
        <p className="text-[var(--gray)]">@{profile.username}</p>
        <div className="mt-4">
          <p className="text-2xl font-bold">Level {profile.level}</p>
          <div className="w-48 mx-auto bg-[var(--background)] rounded-full h-3 mt-2 border border-[var(--card-border)]">
            <div className="bg-[var(--xp-bar)] h-full rounded-full" style={{ width: `${(profile.xp / xpRequired(profile.level)) * 100}%` }}></div>
          </div>
          <p className="text-sm text-[var(--gray)] mt-1">{profile.xp} / {xpRequired(profile.level)} XP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--gold)]">{skills?.length ?? 0}</p>
          <p className="text-[var(--gray)] text-sm">Skills</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--gold)]">{totalCompleted}</p>
          <p className="text-[var(--gray)] text-sm">Fullførte oppgaver</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--gold)] mb-3">Skills</h2>
      <ul className="flex flex-col gap-3">
        {skills?.map((skill) => (
          <li key={skill.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="font-bold">{skill.name}</p>
              <p className="text-[var(--gold)] font-bold">Lvl {skill.level}</p>
            </div>
            <div className="w-full bg-[var(--background)] rounded-full h-2 mt-2 border border-[var(--card-border)]">
              <div className="bg-[var(--xp-bar)] h-2 rounded-full" style={{ width: `${(skill.xp / xpRequired(skill.level)) * 100}%` }}></div>
            </div>
            <p className="text-xs text-[var(--gray)] mt-1">{skill.xp} / {xpRequired(skill.level)} XP</p>
          </li>
        ))}
      </ul>
    </main>
  );
}