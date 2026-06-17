import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Min app</h1>
      <p className="mt-2">{user ? `Hei, ${user.email}!` : "Ikke logget inn."}</p>
    </main>
  );
}