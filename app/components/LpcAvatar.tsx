"use client";

const SKIN_OPTIONS = [
  { id: "light", label: "Lys", body: "/avatar/body_light.png", head: "/avatar/head_light.png", face: "/avatar/face_neutral.png" },
  { id: "olive", label: "Oliven", body: "/avatar/body_olive.png", head: "/avatar/head_olive.png", face: "/avatar/face_olive.png" },
  { id: "dark", label: "Mørk", body: "/avatar/body_dark.png", head: "/avatar/head_dark.png", face: "/avatar/face_dark.png" },
];

const HAIR_OPTIONS = [
  { id: "halfmessy_orange", label: "Rufset oransje", src: "/avatar/hair_halfmessy_orange.png" },
  { id: "short_black", label: "Kort svart", src: "/avatar/hair_short_black.png" },
  { id: "long_blonde", label: "Langt blondt", src: "/avatar/hair_long_blonde.png" },
  { id: "wavy_red", label: "Bølget rødt", src: "/avatar/hair_wavy_red.png" },
  { id: "loose_brown", label: "Løst brunt", src: "/avatar/hair_loose_brown.png" },
  { id: "spiked_black", label: "Pigget svart", src: "/avatar/hair_spiked_black.png" },
  { id: "bald", label: "Skallet", src: "/avatar/hair_bald_white.png" },
  { id: "none", label: "Ingen", src: "" },
];

const HEAD_OPTIONS = [
  { id: "none", label: "Ingen", src: "" },
  { id: "helmet_steel", label: "Stål-hjelm", src: "/avatar/armor_helmet_steel.png" },
];

const BACK_OPTIONS = [
  { id: "none", label: "Ingen", back: "", front: "", trim: "" },
  { id: "cape_white", label: "Hvit kappe", back: "/avatar/cape_back.png", front: "/avatar/cape_front.png", trim: "/avatar/cape_trim.png" },
];

const TORSO_OPTIONS = [
  { id: "none", label: "Ingen", src: "" },
  { id: "cardigan_brown", label: "Brun cardigan", src: "/avatar/cardigan_brown.png" },
  { id: "shirt_white", label: "Hvit skjorte", src: "/avatar/shirt_white.png" },
  { id: "armor_leather", label: "Lær-rustning", src: "/avatar/armor_leather.png" },
  { id: "armor_plate", label: "Plate-bryst", src: "/avatar/armor_plate.png" },
  { id: "cardigan_red", label: "Rød cardigan", src: "/avatar/torso_cardigan_red.png" },
  { id: "tabbard_green", label: "Grønn tabbard", src: "/avatar/torso_tabbard_green.png" },
];

const LEGS_OPTIONS = [
  { id: "none", label: "Ingen", src: "" },
  { id: "armor_steel_legs", label: "Plate-ben", src: "/avatar/armor_steel.png" },
];

const FEET_OPTIONS = [
  { id: "none", label: "Ingen", src: "" },
  { id: "armor_steel_feet", label: "Plate-støvler", src: "/avatar/armor_feet_steel.png" },
];

const WEAPON_OPTIONS = [
  { id: "none", label: "Ingen", back: "", front: "" },
  { id: "sword_steel", label: "Stål-sverd", back: "/avatar/sword_steel_back.png", front: "/avatar/sword_steel_front.png" },
  { id: "sword_alt", label: "Sverd alt.", back: "/avatar/sword_back_alt.png", front: "/avatar/sword_front_alt.png" },
  { id: "spear", label: "Spyd", back: "/avatar/weapon_spear_back.png", front: "/avatar/weapon_spear_front.png" },
  { id: "greataxe", label: "Stor-øks", back: "/avatar/melee_greataxe_back.png", front: "/avatar/melee_greataxe_front.png" },
  { id: "crossbow", label: "Armbøst", back: "/avatar/ranged_crossbow_back.png", front: "/avatar/ranged_crossbow_front.png" },
];

const SHIELD_OPTIONS = [
  { id: "none", label: "Ingen", back: "", front: "" },
  { id: "shield_crusader", label: "Korsfarerskjold", back: "/avatar/shield_crusader_back.png", front: "/avatar/shield_crusader_front.png" },
];

interface LpcAvatarProps {
  skin: string;
  hair: string;
  head?: string;
  back?: string;
  torso: string;
  legs?: string;
  feet?: string;
  weapon?: string;
  shield?: string;
  size?: number;
}

function getFrameStyle(src: string, size: number, isOversized = false) {
  const frameWidth = 64;
  const scale = size / frameWidth;

  if (isOversized) {
    const scale = size / frameWidth;
    const offsetY = -frameWidth * 10 * scale;
    return {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: size,
      height: size,
      backgroundImage: `url(${src})`,
      backgroundPosition: `0px ${offsetY}px`,
      backgroundSize: `${768 * scale}px auto`,
      backgroundRepeat: "no-repeat" as const,
      imageRendering: "pixelated" as const,
    };
  }

  const offsetY = -frameWidth * 10 * scale;
  return {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: size,
    height: size,
    backgroundImage: `url(${src})`,
    backgroundPosition: `0px ${offsetY}px`,
    backgroundSize: `${832 * scale}px auto`,
    backgroundRepeat: "no-repeat" as const,
    imageRendering: "pixelated" as const,
  };
}

export default function LpcAvatar({ skin, hair, head = "none", back = "none", torso, legs = "none", feet = "none", weapon = "none", shield = "none", size = 200 }: LpcAvatarProps) {
  const skinData = SKIN_OPTIONS.find((s) => s.id === skin) || SKIN_OPTIONS[0];
  const hairData = HAIR_OPTIONS.find((h) => h.id === hair) || HAIR_OPTIONS[0];
  const headData = HEAD_OPTIONS.find((h) => h.id === head) || HEAD_OPTIONS[0];
  const backData = BACK_OPTIONS.find((b) => b.id === back) || BACK_OPTIONS[0];
  const torsoData = TORSO_OPTIONS.find((t) => t.id === torso) || TORSO_OPTIONS[0];
  const legsData = LEGS_OPTIONS.find((l) => l.id === legs) || LEGS_OPTIONS[0];
  const feetData = FEET_OPTIONS.find((f) => f.id === feet) || FEET_OPTIONS[0];
  const weaponData = WEAPON_OPTIONS.find((w) => w.id === weapon) || WEAPON_OPTIONS[0];
  const shieldData = SHIELD_OPTIONS.find((s) => s.id === shield) || SHIELD_OPTIONS[0];

  const showHair = head === "none";

  const oversizedSrcs = [weaponData.back, weaponData.front].filter(Boolean);

  const layers = [
    { src: shieldData.back, os: false },
    { src: backData.back, os: false },
    { src: weaponData.back, os: true },
    { src: skinData.body, os: false },
    { src: feetData.src, os: false },
    { src: legsData.src, os: false },
    { src: torsoData.src, os: false },
    { src: skinData.head, os: false },
    { src: skinData.face, os: false },
    { src: showHair ? hairData.src : "", os: false },
    { src: headData.src, os: false },
    { src: backData.front, os: false },
    { src: backData.trim, os: false },
    { src: shieldData.front, os: false },
    { src: weaponData.front, os: true },
  ].filter((l) => l.src);

  return (
    <div style={{ width: size, height: size, position: "relative", overflow: "hidden" }}>
      {layers.map((layer, i) => (
        <div key={i} style={getFrameStyle(layer.src, size, layer.os)} />
      ))}
    </div>
  );
}

export { SKIN_OPTIONS, HAIR_OPTIONS, HEAD_OPTIONS, BACK_OPTIONS, TORSO_OPTIONS, LEGS_OPTIONS, FEET_OPTIONS, WEAPON_OPTIONS, SHIELD_OPTIONS };
