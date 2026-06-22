"use client";

const SKIN_COLORS = ["#f5d0a9", "#d4a373", "#8d5524", "#4a2c0a"];
const HAIR_COLORS = ["#2c1b0e", "#8b4513", "#daa520", "#c0392b", "#ecf0f1", "#3498db"];
const HAIR_STYLES = ["short", "long", "spiky", "none"];
const SHIRT_COLORS = ["#2c3e50", "#c0392b", "#27ae60", "#2980b9", "#8e44ad", "#d4a843"];

interface AvatarProps {
  skin: string;
  hair: string;
  hairStyle: string;
  shirt: string;
  size?: number;
}

export default function Avatar({ skin, hair, hairStyle, shirt, size = 200 }: AvatarProps) {
  const s = size;
  const headSize = s * 0.3;
  const bodyWidth = s * 0.35;
  const bodyHeight = s * 0.3;
  const legWidth = s * 0.12;
  const legHeight = s * 0.25;
  const armWidth = s * 0.08;
  const armHeight = s * 0.25;
  const centerX = s / 2;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Legs */}
      <rect x={centerX - legWidth - 4} y={s * 0.65} width={legWidth} height={legHeight} rx={4} fill="#3b3b5c" />
      <rect x={centerX + 4} y={s * 0.65} width={legWidth} height={legHeight} rx={4} fill="#3b3b5c" />

      {/* Body/Shirt */}
      <rect x={centerX - bodyWidth / 2} y={s * 0.38} width={bodyWidth} height={bodyHeight} rx={6} fill={shirt} />

      {/* Arms */}
      <rect x={centerX - bodyWidth / 2 - armWidth} y={s * 0.4} width={armWidth} height={armHeight} rx={4} fill={skin} />
      <rect x={centerX + bodyWidth / 2} y={s * 0.4} width={armWidth} height={armHeight} rx={4} fill={skin} />

      {/* Head */}
      <circle cx={centerX} cy={s * 0.28} r={headSize / 2} fill={skin} />

      {/* Eyes */}
      <circle cx={centerX - headSize * 0.2} cy={s * 0.27} r={3} fill="#1a1a2e" />
      <circle cx={centerX + headSize * 0.2} cy={s * 0.27} r={3} fill="#1a1a2e" />

      {/* Mouth */}
      <line x1={centerX - 6} y1={s * 0.32} x2={centerX + 6} y2={s * 0.32} stroke="#1a1a2e" strokeWidth={1.5} strokeLinecap="round" />

      {/* Hair */}
      {hairStyle === "short" && (
        <path d={`M${centerX - headSize / 2 - 2} ${s * 0.25} Q${centerX} ${s * 0.12} ${centerX + headSize / 2 + 2} ${s * 0.25}`} fill={hair} />
      )}
      {hairStyle === "long" && (
        <>
          <path d={`M${centerX - headSize / 2 - 2} ${s * 0.25} Q${centerX} ${s * 0.1} ${centerX + headSize / 2 + 2} ${s * 0.25}`} fill={hair} />
          <rect x={centerX - headSize / 2 - 4} y={s * 0.25} width={8} height={s * 0.2} rx={4} fill={hair} />
          <rect x={centerX + headSize / 2 - 4} y={s * 0.25} width={8} height={s * 0.2} rx={4} fill={hair} />
        </>
      )}
      {hairStyle === "spiky" && (
        <>
          <polygon points={`${centerX - 15},${s * 0.2} ${centerX - 10},${s * 0.08} ${centerX - 5},${s * 0.2}`} fill={hair} />
          <polygon points={`${centerX - 5},${s * 0.19} ${centerX},${s * 0.06} ${centerX + 5},${s * 0.19}`} fill={hair} />
          <polygon points={`${centerX + 5},${s * 0.2} ${centerX + 10},${s * 0.08} ${centerX + 15},${s * 0.2}`} fill={hair} />
        </>
      )}

      {/* Shoes */}
      <ellipse cx={centerX - legWidth / 2 - 4} cy={s * 0.9} rx={legWidth * 0.7} ry={4} fill="#2c2c3e" />
      <ellipse cx={centerX + legWidth / 2 + 4} cy={s * 0.9} rx={legWidth * 0.7} ry={4} fill="#2c2c3e" />
    </svg>
  );
}

export { SKIN_COLORS, HAIR_COLORS, HAIR_STYLES, SHIRT_COLORS };
