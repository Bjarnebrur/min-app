import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Hei, {profile.character_name}!</h1>
      <p className="mt-2 text-gray-500">@{profile.username}</p>
    </main>
  );
}
