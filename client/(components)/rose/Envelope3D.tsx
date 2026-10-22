"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { SealId } from "@/lib/design";
import { clamp01, easeInOut, easeOut, glowTexture, lerp } from "./geometry";
import { BEATS, elapsed, useTimeline } from "./timeline";

const W = 2.4;
const H = 1.6;
const FLAP = H * 0.62;

interface EnvelopeProps {
  seal: string;
  emblem: SealId;
  initial: string;
  glow: string;
  onOpen: () => void;
}

/** Draws the emblem pressed into the wax: colour map plus a matching bump map. */
function sealTextures(emblem: SealId, initial: string, seal: string) {
  const make = (draw: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    draw(canvas.getContext("2d")!);
    return new THREE.CanvasTexture(canvas);
  };

  const shape = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(128, 128);
    if (emblem === "initial" && initial) {
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim() || "serif";
      ctx.font = `italic 600 150px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initial, 0, 8);
    } else if (emblem === "star") {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 ? 22 : 74;
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 62);
      ctx.bezierCurveTo(-90, 0, -70, -78, 0, -34);
      ctx.bezierCurveTo(70, -78, 90, 0, 0, 62);
      ctx.fill();
    }
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(128, 128, 104, 0, Math.PI * 2);
    ctx.stroke();
  };

  const map = make((ctx) => {
    ctx.fillStyle = seal;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = ctx.strokeStyle = "rgba(0,0,0,0.22)";
    shape(ctx);
  });
  map.colorSpace = THREE.SRGBColorSpace;

  const bump = make((ctx) => {
    ctx.fillStyle = "#404040";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = ctx.strokeStyle = "#d0d0d0";
    shape(ctx);
  });
  return { map, bump };
}

/** Wax blob: a squat cylinder with an uneven, poured edge. */
function waxGeometry() {
  const geo = new THREE.CylinderGeometry(0.25, 0.27, 0.07, 64, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + 0.05 * Math.sin(a * 7) + 0.03 * Math.sin(a * 13 + 1) + 0.02 * Math.sin(a * 23);
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

export default function Envelope3D({ seal, emblem, initial, glow, onOpen }: EnvelopeProps) {
  const timeline = useTimeline();
  const root = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Group>(null);
  const sealRef = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Sprite>(null);
  const inside = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const shapes = useMemo(() => {
    const pocket = new THREE.Shape();
    pocket.moveTo(-W / 2, H / 2);
    pocket.lineTo(0, -H * 0.04);
    pocket.lineTo(W / 2, H / 2);
    pocket.lineTo(W / 2, -H / 2);
    pocket.lineTo(-W / 2, -H / 2);
    pocket.closePath();

    const bottom = new THREE.Shape();
    bottom.moveTo(-W / 2, -H / 2);
    bottom.lineTo(W / 2, -H / 2);
    bottom.quadraticCurveTo(W * 0.04, H * 0.06, 0, H * 0.08);
    bottom.quadraticCurveTo(-W * 0.04, H * 0.06, -W / 2, -H / 2);

    const flapShape = new THREE.Shape();
    flapShape.moveTo(-W / 2, 0);
    flapShape.lineTo(W / 2, 0);
    flapShape.lineTo(W * 0.06, -FLAP + 0.06);
    flapShape.quadraticCurveTo(0, -FLAP - 0.02, -W * 0.06, -FLAP + 0.06);
    flapShape.closePath();

    return {
      pocket: new THREE.ShapeGeometry(pocket),
      bottom: new THREE.ShapeGeometry(bottom, 12),
      flap: new THREE.ShapeGeometry(flapShape, 8),
    };
  }, []);

  const materials = useMemo(() => {
    const paper = (color: string) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.92,
        sheen: 0.4,
        sheenColor: new THREE.Color("#fff6e8"),
        side: THREE.DoubleSide,
        transparent: true,
      });
    const { map, bump } = sealTextures(emblem, initial, seal);
    return {
      back: paper("#efe2cf"),
      pocket: paper("#f6ecdd"),
      bottom: paper("#fbf3e7"),
      flap: paper("#f3e7d6"),
      wax: new THREE.MeshPhysicalMaterial({ color: seal, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25, transparent: true }),
      face: new THREE.MeshPhysicalMaterial({
        map,
        bumpMap: bump,
        bumpScale: 3,
        roughness: 0.3,
        clearcoat: 0.8,
        clearcoatRoughness: 0.25,
        transparent: true,
      }),
      inside: new THREE.MeshBasicMaterial({
        color: new THREE.Color(glow).multiplyScalar(2.5),
        toneMapped: false,
        transparent: true,
        opacity: 0,
      }),
      halo: new THREE.SpriteMaterial({
        map: glowTexture(),
        color: glow,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, [emblem, initial, seal, glow]);
  const wax = useMemo(() => waxGeometry(), []);

  useFrame(({ clock }) => {
    const t = elapsed(timeline, clock.elapsedTime);
    const now = clock.elapsedTime;
    if (!root.current || !flap.current || !sealRef.current) return;

    const away = easeInOut((t - BEATS.envelopeAway) / 1.3);
    root.current.visible = away < 1;
    root.current.position.y = Math.sin(now * 1.2) * 0.05 * (t < 0 ? 1 : 0) - away * 2.6;
    root.current.rotation.set(
      -0.12 + Math.sin(now * 0.9) * 0.03 + away * 0.9,
      Math.sin(now * 0.6) * 0.12 * (t < 0 ? 1 : 1 - clamp01(t)),
      0,
    );
    const hoverScale = t < 0 && hovered ? 1.04 : 1;
    root.current.scale.setScalar(lerp(root.current.scale.x, hoverScale * (1 - away * 0.35), 0.15));

    // The seal swells, then lifts off and vanishes.
    const pop = clamp01((t - BEATS.sealPop) / 0.5);
    sealRef.current.scale.setScalar(t < 0 ? 1 : pop < 0.35 ? lerp(1, 1.18, pop / 0.35) : lerp(1.18, 0, easeOut((pop - 0.35) / 0.65)));
    sealRef.current.position.z = 0.06 + pop * 0.5;

    flap.current.rotation.x = -Math.PI * 0.92 * easeInOut((t - BEATS.flapOpen) / 1);

    const glowAmount = clamp01((t - BEATS.flapOpen) / 0.8) * (1 - away);
    const fade = 1 - away;
    root.current.traverse((o) => {
      if (o instanceof THREE.Mesh) (o.material as THREE.Material).opacity = o === inside.current ? glowAmount : fade;
    });
    if (halo.current) {
      halo.current.material.opacity = glowAmount * 0.9;
      halo.current.scale.setScalar(1.5 + glowAmount * 2.5);
    }
    if (light.current) light.current.intensity = glowAmount * 8;
  });

  return (
    <group
      ref={root}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh material={materials.back} castShadow receiveShadow>
        <boxGeometry args={[W, H, 0.02]} />
      </mesh>
      <mesh ref={inside} material={materials.inside} position={[0, 0.12, 0.012]}>
        <planeGeometry args={[W * 0.9, H * 0.75]} />
      </mesh>
      <mesh geometry={shapes.pocket} material={materials.pocket} position={[0, 0, 0.02]} receiveShadow />
      <mesh geometry={shapes.bottom} material={materials.bottom} position={[0, 0, 0.026]} receiveShadow />

      <group ref={flap} position={[0, H / 2, 0.034]}>
        <mesh geometry={shapes.flap} material={materials.flap} castShadow receiveShadow />
        <group ref={sealRef} position={[0, -FLAP + 0.12, 0.06]}>
          <mesh geometry={wax} material={materials.wax} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh material={materials.face} position={[0, 0, 0.036]}>
            <circleGeometry args={[0.235, 48]} />
          </mesh>
        </group>
      </group>

      <sprite ref={halo} material={materials.halo} position={[0, 0.25, 0.1]} />
      <pointLight ref={light} color={glow} position={[0, 0.3, 0.5]} intensity={0} distance={6} decay={1.5} />
    </group>
  );
}
