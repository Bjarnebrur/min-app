"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LpcAvatar, { SKIN_OPTIONS, HAIR_OPTIONS, HEAD_OPTIONS, BACK_OPTIONS, TORSO_OPTIONS, LEGS_OPTIONS, FEET_OPTIONS, WEAPON_OPTIONS, SHIELD_OPTIONS } from "@/app/components/LpcAvatar";

export default function AvatarPage() {
  const [skinId, setSkinId] = useState("light");
  const [hairId, setHairId] = useState("halfmessy_orange");
  const [headId, setHeadId] = useState("none");
  const [backId, setBackId] = useState("none");
  const [torsoId, setTorsoId] = useState("cardigan_brown");
  const [legsId, setLegsId] = useState("none");
  const [feetId, setFeetId] = useState("none");
  const [weaponId, setWeaponId] = useState("none");
  const [shieldId, setShieldId] = useState("none");
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
        setHeadId(data.helmet || "none");
        setBackId(data.cape || "none");
        setTorsoId(data.chest || data.shirt_color || "cardigan_brown");
        setLegsId(data.legs || "none");
        setFeetId(data.feet || "none");
        setWeaponId(data.weapon || "none");
        setShieldId(data.shield || "none");
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
      helmet: headId,
      cape: backId,
      chest: torsoId,
      shirt_color: torsoId,
      legs: legsId,
      feet: feetId,
      weapon: weaponId,
      shield: shieldId,
    }).eq("id", user.id);
    router.push("/");
  }

  const categories = [
    { label: "1. Hudfarge", value: skinId, setter: setSkinId, options: SKIN_OPTIONS },
    { label: "2. Hår", value: hairId, setter: setHairId, options: HAIR_OPTIONS },
    { label: "3. Hode", value: headId, setter: setHeadId, options: HEAD_OPTIONS },
    { label: "4. Rygg", value: backId, setter: setBackId, options: BACK_OPTIONS },
    { label: "5. Torso", value: torsoId, setter: setTorsoId, options: TORSO_OPTIONS },
    { label: "6. Ben", value: legsId, setter: setLegsId, options: LEGS_OPTIONS },
    { label: "7. Føtter", value: feetId, setter: setFeetId, options: FEET_OPTIONS },
    { label: "8. Våpen", value: weaponId, setter: setWeaponId, options: WEAPON_OPTIONS },
    { label: "9. Skjold", value: shieldId, setter: setShieldId, options: SHIELD_OPTIONS },
  ];

  return (
    <main className="p-8 max-w-2xl mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-6 text-[var(--gold)]">Rediger avatar</h1>

      <div className="flex gap-8">
        <div className="bg-[var(--card-bg)] border-2 border-[var(--gold-dark)] rounded-lg p-4 flex items-center justify-center flex-shrink-0">
          <LpcAvatar skin={skinId} hair={hairId} head={headId} back={backId} torso={torsoId} legs={legsId} feet={feetId} weapon={weaponId} shield={shieldId} size={220} />
        </div>

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-96">
          {categories.map((cat) => (
            <div key={cat.label}>
              <p className="text-sm font-bold text-[var(--foreground)] mb-1">{cat.label}</p>
              <div className="flex flex-wrap gap-1">
                {cat.options.map((opt: any) => (
                  <button key={opt.id} onClick={() => cat.setter(opt.id)} className={`px-2 py-1 rounded text-xs border ${cat.value === opt.id ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--card-border)] text-[var(--gray)]"} bg-[var(--card-bg)]`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="w-full mt-6 bg-[var(--gold-dark)] text-white p-2 rounded hover:bg-[var(--gold)]">
        Lagre endringer
      </button>
    </main>
  );
}
