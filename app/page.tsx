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
        <h1 className="text-4xl font-bold">{profile.character_name}</h1>
        <p className="text-gray-500">@{profile.username}</p>
        <p className="mt-2 text-lg">Level {profile.level} — {profile.xp} XP</p>
        <LogoutButton />
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/skills" className="border p-6 rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-bold">⚔ Skills</h2>
          <p className="text-gray-500 text-sm mt-1">Dine aktiviteter og hobbier</p>
        </Link>

        <Link href="/skole" className="border p-6 rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-bold">📚 Skole</h2>
          <p className="text-gray-500 text-sm mt-1">Pensum, moduler og oppgaver</p>
        </Link>

        <Link href="/dailys" className="border p-6 rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-bold">☀ Dailys</h2>
          <p className="text-gray-500 text-sm mt-1">Dagens gjøremål</p>
        </Link>
      </div>
    </main>
  );
}