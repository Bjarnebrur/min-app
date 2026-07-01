"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LpcAvatar, { SKIN_OPTIONS, HAIR_OPTIONS, HEAD_OPTIONS, BACK_OPTIONS, TORSO_OPTIONS, LEGS_OPTIONS, FEET_OPTIONS, WEAPON_OPTIONS, SHIELD_OPTIONS } from "@/app/components/LpcAvatar";
import FrameOverlay from "@/app/components/FrameOverlay";

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
  const [activeFrame, setActiveFrame] = useState("none");
  const [unlockedFrames, setUnlockedFrames] = useState<any[]>([]);
  const [openCat, setOpenCat] = useState<string | null>(null);
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
        setActiveFrame(data.active_frame || "none");
      }
      const { data: userRewards } = await supabase.from("user_rewards").select("reward_id").eq("user_id", user.id);
      if (userRewards) {
        const ids = userRewards.map((ur: any) => ur.reward_id);
        const { data: frameRewards } = await supabase.from("rewards").select().eq("type", "frame").in("id", ids);
        if (frameRewards) setUnlockedFrames(frameRewards);
      }
    }
    fetchProfile();
  }, []);

  function handleWeaponChange(id: string) {
    setWeaponId(id);
    const weapon = WEAPON_OPTIONS.find((w) => w.id === id);
    if (weapon?.handed === "two") setShieldId("none");
  }

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
      active_frame: activeFrame,
    }).eq("id", user.id);
    router.push("/");
  }

  const isTwoHanded = WEAPON_OPTIONS.find((w) => w.id === weaponId)?.handed === "two";

  const categories = [
    {
      key: "skin",
      label: "Hudfarge",
      value: skinId,
      options: SKIN_OPTIONS,
      setter: setSkinId,
      preview: (opt: any) => <LpcAvatar skin={opt.id} hair="none" torso="none" size={48} />,
    },
    {
      key: "hair",
      label: "Hår",
      value: hairId,
      options: HAIR_OPTIONS,
      setter: setHairId,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair={opt.id} torso="none" size={48} />,
    },
    {
      key: "head",
      label: "Hode",
      value: headId,
      options: HEAD_OPTIONS,
      setter: setHeadId,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair={opt.id === "none" ? hairId : "none"} head={opt.id} torso="none" size={48} />,
    },
    {
      key: "back",
      label: "Rygg",
      value: backId,
      options: BACK_OPTIONS,
      setter: setBackId,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair="none" back={opt.id} torso="none" size={48} />,
    },
    {
      key: "torso",
      label: "Torso",
      value: torsoId,
      options: TORSO_OPTIONS,
      setter: setTorsoId,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair="none" torso={opt.id} size={48} />,
    },
    {
      key: "legs",
      label: "Ben",
      value: legsId,
      options: LEGS_OPTIONS,
      setter: setLegsId,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair="none" torso="none" legs={opt.id} size={48} />,
    },
    {
      key: "feet",
      label: "Føtter",
      value: feetId,
      options: FEET_OPTIONS,
      setter: setFeetId,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair="none" torso="none" feet={opt.id} size={48} />,
    },
    {
      key: "weapon",
      label: "Våpen",
      value: weaponId,
      options: WEAPON_OPTIONS,
      setter: handleWeaponChange,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair="none" torso="none" weapon={opt.id} size={48} />,
    },
    {
      key: "shield",
      label: isTwoHanded ? "Skjold (låst — tohånds våpen)" : "Skjold",
      value: shieldId,
      options: SHIELD_OPTIONS,
      setter: setShieldId,
      disabled: isTwoHanded,
      preview: (opt: any) => <LpcAvatar skin={skinId} hair="none" torso="none" shield={opt.id} size={48} />,
    },
  ];

  const frameOptions = [
    { id: "none", label: "Ingen", frame_id: null },
    ...unlockedFrames.map((r) => ({ id: r.frame_id, label: r.name, frame_id: r.frame_id })),
  ];

  return (
    <main className="p-8 max-w-2xl mx-auto mt-10">
      <Link href="/" className="text-[var(--gold)] hover:underline text-sm mb-4 inline-block">← Tilbake</Link>
      <h1 className="text-3xl font-bold mb-6 text-[var(--gold)]">Rediger avatar</h1>

      <div className="flex gap-8">
        <div className="flex-shrink-0 flex items-center justify-center mr-8" style={{ width: "260px" }}>
        <div className="bg-[var(--card-bg)] border-2 border-[var(--gold-dark)] rounded-lg" style={{ width: "222px", height: "222px" }}>
          <div style={{ position: "relative", width: 220, height: 220 }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 220, height: 220, background: "var(--card-bg)", borderRadius: "4px" }} />
            <LpcAvatar skin={skinId} hair={hairId} head={headId} back={backId} torso={torsoId} legs={legsId} feet={feetId} weapon={weaponId} shield={shieldId} size={220} />
            {activeFrame !== "none" && (
              <div style={{ position: "absolute", top: -36, left: -36, width: 292, height: 292 }}>
                <FrameOverlay src={`/frames/${activeFrame}.png`} size={292} />
              </div>
            )}
          </div>
        </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[480px]">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden ${cat.disabled ? "opacity-40 pointer-events-none" : ""}`}
            >
              <button
                onClick={() => setOpenCat(openCat === cat.key ? null : cat.key)}
                className="w-full flex justify-between items-center px-3 py-2.5 text-left hover:bg-[var(--background)] transition-colors gap-3"
              >
                <span className="text-sm font-bold text-[var(--foreground)] flex-shrink-0">{cat.label}</span>
                <span className="text-xs text-[var(--gray)] truncate text-right">
                  {cat.options.find((o: any) => o.id === cat.value)?.label} {openCat === cat.key ? "▲" : "▼"}
                </span>
              </button>

              {openCat === cat.key && (
                <div className="px-3 pb-3 border-t border-[var(--card-border)] pt-3 max-h-80 overflow-y-auto">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {cat.options.map((opt: any) => (
                      <button
                        key={opt.id}
                        onClick={() => cat.setter(opt.id)}
                        className={`flex flex-col items-center gap-2 p-2 rounded border transition-colors ${
                          cat.value === opt.id
                            ? "border-[var(--gold)] bg-[var(--background)]"
                            : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--gold)]"
                        }`}
                      >
                        <div className="w-12 h-12 overflow-hidden rounded flex-shrink-0">{cat.preview(opt)}</div>
                        <span className={`text-xs w-full text-center leading-snug break-words ${cat.value === opt.id ? "text-[var(--gold)]" : "text-[var(--gray)]"}`}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Ramme-velger */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenCat(openCat === "frame" ? null : "frame")}
              className="w-full flex justify-between items-center px-3 py-2.5 text-left hover:bg-[var(--background)] transition-colors gap-3"
            >
              <span className="text-sm font-bold text-[var(--foreground)] flex-shrink-0">🖼️ Ramme</span>
              <span className="text-xs text-[var(--gray)] truncate text-right">
                {frameOptions.find((f) => f.id === activeFrame)?.label ?? "Ingen"} {openCat === "frame" ? "▲" : "▼"}
              </span>
            </button>
            {openCat === "frame" && (
              <div className="px-3 pb-3 border-t border-[var(--card-border)] pt-3 max-h-64 overflow-y-auto">
                {frameOptions.length === 1 ? (
                  <p className="text-xs text-[var(--gray)]">Ingen rammer låst opp ennå. Level opp for å få rammer!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {frameOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setActiveFrame(opt.id)}
                        style={{ width: "80px", flexShrink: 0 }}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded border transition-colors ${
                          activeFrame === opt.id
                            ? "border-[var(--gold)] bg-[var(--background)]"
                            : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--gold)]"
                        }`}
                      >
                        <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                          {opt.frame_id ? <FrameOverlay src={`/frames/${opt.frame_id}.png`} size={48} /> : <div className="w-12 h-12 flex items-center justify-center text-[var(--gray)] text-xs">∅</div>}
                        </div>
                        <span className={`text-xs w-full text-center leading-tight break-words ${activeFrame === opt.id ? "text-[var(--gold)]" : "text-[var(--gray)]"}`}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full mt-6 bg-[var(--gold-dark)] text-white p-2 rounded hover:bg-[var(--gold)]">
        Lagre endringer
      </button>
    </main>
  );
}
