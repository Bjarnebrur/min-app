"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SkillsPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("hobby");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      name,
      category,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  return (
    <main className="p-8 max-w-sm mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6">Legg til skill</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Navn på skill (f.eks. Matlaging)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="hobby">Hobby</option>
          <option value="skole">Skole</option>
          <option value="trening">Trening</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Legg til
        </button>
      </form>
    </main>
  );
}