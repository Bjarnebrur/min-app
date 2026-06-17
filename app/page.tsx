import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user!.id)
    .single();

  if (!profile) {
    redirect("/setup");
  }

  const { data: skills } = await supabase
    .from("skills")
    .select()
    .eq("user_id", user!.id);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Hei, {profile.character_name}!</h1>
      <p className="mt-2 text-gray-500">@{profile.username}</p>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mine skills</h2>
          <Link href="/skills" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Legg til skill
          </Link>
        </div>
        <ul className="flex flex-col gap-3">
          {skills?.map((skill) => (
            <li key={skill.id} className="border p-4 rounded">
              <p className="font-bold">{skill.name}</p>
              <p className="text-gray-500 text-sm">{skill.category}</p>
              <p className="text-sm mt-1">Level {skill.level} — {skill.xp} XP</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}