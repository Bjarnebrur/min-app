"use client";

import { useEffect, useRef } from "react";

interface FrameOverlayProps {
  src: string;
  size: number;
}

export default function FrameOverlay({ src, size }: FrameOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Gjør rosa/magenta piksler gjennomsiktige (med litt toleranse)
        if (r > 180 && g < 80 && b > 180) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = src;
  }, [src, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    />
  );
}
