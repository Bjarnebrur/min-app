"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LpcAvatar, { SKIN_OPTIONS, HAIR_OPTIONS, CLOTHES_OPTIONS } from "@/app/components/LpcAvatar";

export default function AvatarPage() {
  const [skinId, setSkinId] = useState("");
  const [hairId, setHairId] = useState("");
  const [clothesId, setClothesId] = useState("");
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select().eq("id", user.id).single();
      if (data) {
        setSkinId(data.skin_color || "light");
        setHairId(data.hair_color || "halfmessy_orange");
        setClothesId(data.shirt_color || "cardigan_brown");
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({
      skin_color: skinId,
      hair_color: hairId,
      shirt_color: clothesId,
    }).eq("id", user.id);
    router.push("/");
  }

  return (
    <main className="p-8 max-w-lg mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-6 text-[var(--gold)]">Rediger avatar</h1>

      <div className="flex gap-8 justify-center">
        <div className="bg-[var(--card-bg)] border-2 border-[var(--gold-dark)] rounded-lg p-4 flex items-center justify-center">
          <LpcAvatar skin={skinId} hair={hairId} clothes={clothesId} size={220} />
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-2">Hudfarge</p>
            <div className="flex gap-2">
              {SKIN_OPTIONS.map((s) => (
                <button key={s.id} onClick={() => setSkinId(s.id)} className={`px-3 py-1 rounded text-sm border ${skinId === s.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-2">Hår</p>
            <div className="flex flex-wrap gap-2">
              {HAIR_OPTIONS.map((h) => (
                <button key={h.id} onClick={() => setHairId(h.id)} className={`px-3 py-1 rounded text-sm border ${hairId === h.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-2">Klær</p>
            <div className="flex flex-wrap gap-2">
              {CLOTHES_OPTIONS.map((c) => (
                <button key={c.id} onClick={() => setClothesId(c.id)} className={`px-3 py-1 rounded text-sm border ${clothesId === c.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full mt-6 bg-[var(--gold-dark)] text-white p-2 rounded hover:bg-[var(--gold)]">
        Lagre endringer
      </button>
    </main>
  );
}
