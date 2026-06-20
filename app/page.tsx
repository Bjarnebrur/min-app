import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

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

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <Link href="/karakter" className="text-4xl font-bold text-[var(--gold)] hover:underline">{profile.character_name}</Link>
        <p className="text-[var(--gray)]">@{profile.username}</p>
        <div className="mt-3">
          <p className="text-lg font-bold">Level {profile.level}</p>
          <div className="w-48 mx-auto bg-[var(--card-bg)] rounded-full h-3 mt-1 border border-[var(--card-border)]">
            <div className="bg-[var(--xp-bar)] h-full rounded-full" style={{ width: `${profile.xp % 100}%` }}></div>
          </div>
          <p className="text-sm text-[var(--gray)] mt-1">{profile.xp} / {profile.level * 100} XP</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/skills" className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-lg hover:border-[var(--gold)] transition-colors">
          <h2 className="text-xl font-bold text-[var(--gold)]">⚔ Skills</h2>
          <p className="text-[var(--gray)] text-sm mt-1">Dine aktiviteter og hobbier</p>
        </Link>

        <Link href="/skole" className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-lg hover:border-[var(--gold)] transition-colors">
          <h2 className="text-xl font-bold text-[var(--gold)]">📚 Skole</h2>
          <p className="text-[var(--gray)] text-sm mt-1">Pensum, moduler og oppgaver</p>
        </Link>

        <Link href="/dailys" className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-lg hover:border-[var(--gold)] transition-colors">
          <h2 className="text-xl font-bold text-[var(--gold)]">☀ Dailys</h2>
          <p className="text-[var(--gray)] text-sm mt-1">Dagens gjøremål</p>
        </Link>
      </div>
    </main>
  );
}
