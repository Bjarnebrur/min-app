import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data: tasks } = await supabase.from("tasks").select();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Mine oppgaver</h1>
      <ul className="mt-4 list-disc pl-6">
        {tasks?.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </main>
  );
}