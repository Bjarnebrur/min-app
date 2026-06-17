"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Feil e-post eller passord");
    } else {
      router.push("/");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setError("Sjekk e-posten din for bekreftelse!");
    }
  }

  return (
    <main className="p-8 max-w-sm mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6">Logg inn</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Logg inn
        </button>
        <button
          onClick={handleSignUp}
          className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
        >
          Opprett konto
        </button>
      </form>
    </main>
  );
}