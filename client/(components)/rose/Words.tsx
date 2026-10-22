"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";
import { clamp01, lerp } from "./geometry";
import { BEATS, elapsed, useTimeline } from "./timeline";

/** Splits a message into short phrases that can drift around the rose. */
export function toPhrases(message: string, max = 9): string[] {
  const sentences = message
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const phrases = sentences.flatMap((sentence) => {
    const words = sentence.split(/\s+/);
    if (words.length <= 9) return [sentence];
    const parts = Math.ceil(words.length / 7);
    const size = Math.ceil(words.length / parts);
    return Array.from({ length: parts }, (_, i) => words.slice(i * size, (i + 1) * size).join(" "));
  });

  // Too many phrases crowd the scene, so fold the extras into their neighbours.
  while (phrases.length > max) {
    let shortest = 0;
    for (let i = 1; i < phrases.length - 1; i++) {
      if (phrases[i].length + phrases[i + 1].length < phrases[shortest].length + phrases[shortest + 1].length) shortest = i;
    }
    phrases.splice(shortest, 2, `${phrases[shortest]} ${phrases[shortest + 1]}`);
  }
  return phrases;
}

export type LabelRefs = RefObject<(HTMLButtonElement | null)[]>;

const centre = new THREE.Vector3(0, 0.2, 0);
const point = new THREE.Vector3();
const view = new THREE.Vector3();

/**
 * Moves the phrase labels (plain DOM, rendered by WordLayer) along an orbit
 * around the rose. Labels behind the rose dim, shrink and blur.
 */
export function WordOrbit({ count, labels, blur = true }: { count: number; labels: LabelRefs; blur?: boolean }) {
  const timeline = useTimeline();
  const { camera, viewport, size } = useThree();

  useFrame(({ clock }) => {
    const t = elapsed(timeline, clock.elapsedTime);
    const now = clock.elapsedTime;
    // Narrow (phone) screens get a tighter, taller orbit so words stay on screen.
    const radius = Math.min(2.3, viewport.getCurrentViewport(camera, centre).width * 0.3);
    const spread = size.width / size.height < 0.8 ? 1.5 : 1.05;
    const centreDepth = view.copy(centre).applyMatrix4(camera.matrixWorldInverse).z;

    for (let i = 0; i < count; i++) {
      const label = labels.current[i];
      if (!label) continue;

      const angle = (i / count) * Math.PI * 2 + now * 0.16;
      const band = count > 1 ? (i % 2 ? 1 : -1) * ((i / (count - 1)) * 0.8 + 0.2) : 0;
      point.set(Math.cos(angle) * radius, centre.y + band * spread + Math.sin(now * 0.7 + i) * 0.08, Math.sin(angle) * radius * 0.85);

      const depth = view.copy(point).applyMatrix4(camera.matrixWorldInverse).z - centreDepth;
      const front = clamp01(0.5 + depth / (radius * 1.6));
      const shown = t < 0 ? 0 : clamp01((t - BEATS.words - i * BEATS.wordGap) / 1.2);

      point.project(camera);
      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height;
      place(label, x, y, front, shown, blur);
    }
  });

  return null;
}

function place(label: HTMLElement, x: number, y: number, front: number, shown: number, blur: boolean) {
  label.style.opacity = String(shown * lerp(0.18, 1, front));
  label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${lerp(0.78, 1.05, front) * lerp(0.6, 1, shown)})`;
  // Repainting a CSS blur every frame over the canvas flickers on mobile Safari.
  if (blur) label.style.filter = `blur(${(1 - front) * 1.6 + (1 - shown) * 6}px)`;
  label.style.zIndex = front > 0.5 ? "2" : "0";
  label.style.pointerEvents = shown > 0.5 ? "auto" : "none";
}

/** The phrase labels themselves; positioned every frame by WordOrbit. */
export function WordLayer({
  phrases,
  labels,
  font,
  glow,
  onPick,
}: {
  phrases: string[];
  labels: LabelRefs;
  font: string;
  glow: string;
  onPick: (index: number) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {phrases.map((phrase, i) => (
        <button
          key={i}
          ref={(el) => {
            labels.current[i] = el;
          }}
          type="button"
          onClick={() => onPick(i)}
          className="absolute left-0 top-0 block w-max max-w-[min(36vw,15rem)] cursor-pointer text-balance text-center leading-snug text-white opacity-0 will-change-transform"
          style={{
            fontFamily: font,
            fontSize: "clamp(0.95rem, 2.6vw, 1.3rem)",
            textShadow: `0 0 12px ${glow}, 0 0 28px ${glow}99, 0 1px 2px rgb(0 0 0 / 0.6)`,
          }}
        >
          {phrase}
        </button>
      ))}
    </div>
  );
}
