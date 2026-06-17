"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      character_name: characterName,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  return (
    <main className="p-8 max-w-sm mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6">Lag din karakter</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Brukernavn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Karakternavn"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Opprett karakter
        </button>
      </form>
    </main>
  );
}