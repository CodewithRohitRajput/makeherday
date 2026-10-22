import * as THREE from "three";
import type { RoseOption } from "@/lib/design";

/*
 * Procedural rose parts. Every petal starts as a subdivided plane (u across,
 * v from base to tip) that is shaped, cupped and curled in place, so the whole
 * flower is generated in code with no model files to download.
 */

export interface PetalShape {
  length: number;
  /** Half the widest width. */
  width: number;
  /** Radius of the cylinder the petal wraps around; small = tightly cupped. */
  wrap: number;
  /** How far the tip rolls back, away from the centre. */
  curl: number;
  /** How far the upper corners roll back, giving outer petals their points. */
  roll: number;
  /** Outward belly through the middle of the petal. */
  bowl: number;
  ruffle: number;
  seed: number;
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function petalGeometry(p: PetalShape, segments: [number, number] = [18, 22]): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1, 1, segments[0], segments[1]);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const un = uv.getX(i) * 2 - 1;
    const v = uv.getY(i);

    // Narrow claw at the base and broad shoulders; the top edge is an arc made by
    // pulling the sides down, so the tip never collapses to a point.
    const halfW = p.width * (0.16 + 0.84 * Math.pow(v, 0.55)) * (1 - 0.3 * Math.pow(v, 4));
    let x = un * halfW;
    let y = v * p.length * (1 - 0.3 * un * un * v * v);

    // Cup around the flower's centre; the cup relaxes towards the tip.
    const radius = p.wrap * (1 + 1.4 * v * v);
    const phi = x / radius;
    let z = -radius * (1 - Math.cos(phi));
    x = radius * Math.sin(phi);

    z += p.bowl * Math.sin(Math.PI * v * 0.9);

    const tip = Math.max(0, (v - 0.55) / 0.45);
    z += p.curl * tip * tip;
    y -= p.curl * 0.35 * tip * tip * tip;

    z += p.roll * Math.pow(Math.abs(un), 2.5) * Math.pow(v, 1.5);
    z += p.ruffle * Math.sin(un * 7 + p.seed * 3 + v * 4) * Math.pow(v, 3);

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Vertex colours: a pale claw where the petal joins the flower, darker margins,
 * and fake ambient occlusion so the inner petals sit in shadow.
 * `depth` is 0 for the innermost petal and 1 for the outermost.
 */
export function paintPetal(geo: THREE.BufferGeometry, rose: RoseOption, depth: number, tint = 1) {
  const uv = geo.attributes.uv;
  const petal = new THREE.Color(rose.petal);
  const deep = new THREE.Color(rose.deep);
  const base = new THREE.Color(rose.base);
  const out = new THREE.Color();
  const colors = new Float32Array(uv.count * 3);

  for (let i = 0; i < uv.count; i++) {
    const un = Math.abs(uv.getX(i) * 2 - 1);
    const v = uv.getY(i);
    out.copy(petal).lerp(base, smoothstep(0.34, 0, v) * 0.8);
    out.lerp(deep, smoothstep(0.7, 1, Math.max(un, v)) * 0.4);
    const ao = (0.22 + 0.78 * Math.pow(depth, 0.7)) * (0.5 + 0.5 * smoothstep(0, 0.6, v));
    out.multiplyScalar(ao * tint);
    colors.set([out.r, out.g, out.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/** A rose leaflet: pointed oval, saw-toothed edge, folded along the midrib. */
export function leafGeometry(length: number, width: number, seed: number) {
  const geo = new THREE.PlaneGeometry(1, 1, 12, 24);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const light = new THREE.Color("#5d8a3a");
  const dark = new THREE.Color("#1f3d16");
  const out = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const un = uv.getX(i) * 2 - 1;
    const v = uv.getY(i);
    const tooth = 1 + 0.08 * ((v * 15 + seed) % 1);
    const halfW = width * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.8)), 0.85) * tooth;
    const x = un * halfW;
    const z = Math.abs(x) * 0.4 - 0.2 * length * v * v;
    pos.setXYZ(i, x, v * length, z);

    out.copy(dark).lerp(light, 0.35 + 0.4 * Math.exp(-un * un * 60) + 0.25 * (1 - v));
    colors.set([out.r, out.g, out.b], i * 3);
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Faint veins fanning out from the base, used as a bump map on petals. */
export function veinTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 46; i++) {
    const spread = (i / 45) * 2 - 1;
    ctx.strokeStyle = i % 2 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
    ctx.lineWidth = 0.6 + (i % 3) * 0.4;
    ctx.beginPath();
    ctx.moveTo(64 + spread * 8, 256);
    ctx.quadraticCurveTo(64 + spread * 40, 150, 64 + spread * 70, -10);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** Soft round sprite for glows. */
export function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/** Small deterministic random so a rose looks the same on every render. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
