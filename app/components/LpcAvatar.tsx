"use client";

const SKIN_OPTIONS = [
  { id: "light", label: "Lys", body: "/avatar/body_light.png", head: "/avatar/head_light.png", face: "/avatar/face_neutral.png" },
  { id: "dark", label: "Mørk", body: "/avatar/body_dark.png", head: "/avatar/head_dark.png", face: "/avatar/face_dark.png" },
];

const HAIR_OPTIONS = [
  { id: "halfmessy_orange", label: "Rufset oransje", src: "/avatar/hair_halfmessy_orange.png" },
  { id: "short_black", label: "Kort svart", src: "/avatar/hair_short_black.png" },
  { id: "long_blonde", label: "Langt blondt", src: "/avatar/hair_long_blonde.png" },
  { id: "wavy_red", label: "Bølget rødt", src: "/avatar/hair_wavy_red.png" },
  { id: "none", label: "Ingen", src: "" },
];

const CLOTHES_OPTIONS = [
  { id: "cardigan_brown", label: "Brun cardigan", src: "/avatar/cardigan_brown.png" },
  { id: "shirt_white", label: "Hvit skjorte", src: "/avatar/shirt_white.png" },
  { id: "armor_leather", label: "Lær-rustning", src: "/avatar/armor_leather.png" },
  { id: "armor_plate", label: "Plate-rustning", src: "/avatar/armor_plate.png" },
];

interface LpcAvatarProps {
  skin: string;
  hair: string;
  clothes: string;
  size?: number;
}

function getFrameStyle(src: string, size: number) {
  const frameWidth = 64;
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
    backgroundSize: `${832 * scale}px auto`,
    backgroundRepeat: "no-repeat" as const,
    imageRendering: "pixelated" as const,
  };
}

export default function LpcAvatar({ skin, hair, clothes, size = 200 }: LpcAvatarProps) {
  const skinData = SKIN_OPTIONS.find((s) => s.id === skin) || SKIN_OPTIONS[0];
  const hairData = HAIR_OPTIONS.find((h) => h.id === hair) || HAIR_OPTIONS[0];
  const clothesData = CLOTHES_OPTIONS.find((c) => c.id === clothes) || CLOTHES_OPTIONS[0];

  const layers = [skinData.body, clothesData.src, skinData.head, skinData.face, hairData.src].filter(Boolean);

  return (
    <div style={{ width: size, height: size, position: "relative", overflow: "hidden" }}>
      {layers.map((src, i) => (
        <div key={i} style={getFrameStyle(src, size)} />
      ))}
    </div>
  );
}

export { SKIN_OPTIONS, HAIR_OPTIONS, CLOTHES_OPTIONS };
