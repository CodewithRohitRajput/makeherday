"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { RoseOption } from "@/lib/design";
import { clamp01, easeInOut, easeOut, leafGeometry, lerp, paintPetal, petalGeometry, seeded, veinTexture } from "./geometry";
import { BEATS, elapsed, useTimeline } from "./timeline";

const PETALS = 30;
const GOLDEN = 2.39996;

interface PetalLayout {
  geometry: THREE.BufferGeometry;
  angle: number;
  radius: number;
  height: number;
  closed: number;
  open: number;
  /** Bloom progress (0–1) at which this petal starts to open; outer petals go first. */
  delay: number;
}

function layoutPetals(rose: RoseOption): PetalLayout[] {
  const rand = seeded(7);
  return Array.from({ length: PETALS }, (_, i) => {
    const k = i / (PETALS - 1);
    const geometry = petalGeometry({
      length: lerp(0.6, 1.08, Math.pow(k, 0.7)),
      width: lerp(0.26, 0.74, Math.pow(k, 0.9)),
      wrap: lerp(0.11, 0.85, Math.pow(k, 1.2)),
      curl: lerp(0, 0.42, Math.pow(k, 1.5)),
      roll: lerp(0, 0.24, Math.pow(k, 1.3)),
      bowl: lerp(0.03, 0.16, k),
      ruffle: lerp(0.004, 0.03, k),
      seed: i,
    });
    paintPetal(geometry, rose, k, 0.9 + rand() * 0.18);
    return {
      geometry,
      angle: i * GOLDEN + (rand() - 0.5) * 0.18,
      radius: lerp(0.015, 0.17, k),
      height: lerp(0.12, -0.02, k),
      closed: lerp(-0.12, 0.12, k),
      open: lerp(-0.04, 1.02, Math.pow(k, 2)) * (0.92 + rand() * 0.16),
      delay: (1 - k) * 0.55,
    };
  });
}

const STEM = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -0.05, 0),
  new THREE.Vector3(0.03, -0.8, 0.02),
  new THREE.Vector3(-0.05, -1.8, 0.06),
  new THREE.Vector3(0.05, -2.9, 0),
  new THREE.Vector3(0, -4.2, -0.05),
]);

export default function Rose({ rose }: { rose: RoseOption }) {
  const timeline = useTimeline();
  const root = useRef<THREE.Group>(null);
  const petalRefs = useRef<(THREE.Group | null)[]>([]);

  const petals = useMemo(() => layoutPetals(rose), [rose]);
  const veins = useMemo(() => veinTexture(), []);

  const petalMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.62,
        sheen: 0.7,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color(rose.sheen),
        specularIntensity: 0.2,
        bumpMap: veins,
        bumpScale: 0.3,
        side: THREE.DoubleSide,
      }),
    [rose, veins],
  );

  const green = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({ color: "#2f5a22", roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.5, side: THREE.DoubleSide }),
    [],
  );
  const leafMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.45,
        clearcoat: 0.5,
        clearcoatRoughness: 0.35,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const sepal = useMemo(() => {
    const geo = petalGeometry({ length: 0.55, width: 0.08, wrap: 0.6, curl: 0.25, roll: 0, bowl: 0.02, ruffle: 0, seed: 0 }, [6, 14]);
    geo.deleteAttribute("color");
    return geo;
  }, []);
  const stem = useMemo(() => new THREE.TubeGeometry(STEM, 80, 0.045, 10), []);
  const thorns = useMemo(
    () =>
      [0.22, 0.38, 0.52, 0.7, 0.84].map((t, i) => {
        const p = STEM.getPoint(t);
        const angle = i * 2.3;
        return { position: [p.x + Math.sin(angle) * 0.04, p.y, p.z + Math.cos(angle) * 0.04] as THREE.Vector3Tuple, angle };
      }),
    [],
  );
  const leaves = useMemo(
    () => ({
      big: leafGeometry(0.62, 0.22, 0.3),
      small: leafGeometry(0.45, 0.16, 0.7),
    }),
    [],
  );

  useEffect(
    () => () => {
      petals.forEach((p) => p.geometry.dispose());
      petalMaterial.dispose();
    },
    [petals, petalMaterial],
  );

  useFrame(({ clock }) => {
    const t = elapsed(timeline, clock.elapsedTime);
    const group = root.current;
    if (!group) return;

    const rise = easeInOut((t - BEATS.roseRise) / 1.8);
    group.visible = t > BEATS.roseRise;
    group.scale.setScalar(lerp(0.12, 1, rise));
    group.position.y = lerp(-1.1, -0.1, rise) + Math.sin(clock.elapsedTime * 0.8) * 0.03 * rise;
    group.rotation.y = (1 - rise) * 2.4 + Math.max(0, t - BEATS.roseRise) * 0.12;

    const bloom = clamp01((t - BEATS.bloom) / BEATS.bloomLength);
    petals.forEach((p, i) => {
      const petal = petalRefs.current[i];
      if (!petal) return;
      const open = easeOut((bloom - p.delay) / 0.45);
      petal.rotation.x = lerp(p.closed, p.open, open);
      petal.scale.setScalar(lerp(0.82, 1, open));
    });
  });

  return (
    <group ref={root} rotation={[0.32, 0, 0]} visible={false}>
      {petals.map((p, i) => (
        <group key={i} position={[Math.sin(p.angle) * p.radius, p.height, Math.cos(p.angle) * p.radius]} rotation={[0, p.angle, 0]}>
          <group
            ref={(el) => {
              petalRefs.current[i] = el;
            }}
            rotation={[p.closed, 0, 0]}
          >
            <mesh geometry={p.geometry} material={petalMaterial} castShadow receiveShadow />
          </group>
        </group>
      ))}

      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2 + 0.3;
        return (
          <group key={i} position={[Math.sin(angle) * 0.09, -0.04, Math.cos(angle) * 0.09]} rotation={[0, angle, 0]}>
            <mesh geometry={sepal} material={green} rotation={[2.2, 0, 0]} castShadow />
          </group>
        );
      })}

      <mesh material={green} position={[0, -0.1, 0]} scale={[1, 1.25, 1]} castShadow>
        <sphereGeometry args={[0.12, 20, 16]} />
      </mesh>
      <mesh geometry={stem} material={green} castShadow receiveShadow />
      {thorns.map(({ position, angle }, i) => (
        <mesh key={i} material={green} position={position} rotation={[Math.cos(angle) * 1.2, 0, -Math.sin(angle) * 1.2]}>
          <coneGeometry args={[0.025, 0.11, 6]} />
        </mesh>
      ))}

      <LeafCluster position={STEM.getPoint(0.3)} side={1} leaves={leaves} leafMaterial={leafMaterial} stemMaterial={green} />
      <LeafCluster position={STEM.getPoint(0.55)} side={-1} leaves={leaves} leafMaterial={leafMaterial} stemMaterial={green} />
    </group>
  );
}

function LeafCluster({
  position,
  side,
  leaves,
  leafMaterial,
  stemMaterial,
}: {
  position: THREE.Vector3;
  side: 1 | -1;
  leaves: { big: THREE.BufferGeometry; small: THREE.BufferGeometry };
  leafMaterial: THREE.Material;
  stemMaterial: THREE.Material;
}) {
  return (
    <group position={position} rotation={[0.35, side * 0.5, -side * 0.95]}>
      <mesh material={stemMaterial} position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.014, 0.02, 0.6, 6]} />
      </mesh>
      <mesh geometry={leaves.big} material={leafMaterial} position={[0, 0.58, 0]} castShadow receiveShadow />
      <mesh geometry={leaves.small} material={leafMaterial} position={[0, 0.3, 0]} rotation={[0.2, 0, 1]} castShadow receiveShadow />
      <mesh geometry={leaves.small} material={leafMaterial} position={[0, 0.3, 0]} rotation={[0.2, 0, -1]} castShadow receiveShadow />
    </group>
  );
}
