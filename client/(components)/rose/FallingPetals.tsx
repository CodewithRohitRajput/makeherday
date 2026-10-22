"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { RoseOption } from "@/lib/design";
import { clamp01, paintPetal, petalGeometry, seeded } from "./geometry";
import { elapsed, useTimeline } from "./timeline";

const COUNT = 42;

/** Loose petals drifting down through the scene once the finale begins. */
export default function FallingPetals({ rose, from }: { rose: RoseOption; from: number }) {
  const timeline = useTimeline();
  const mesh = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(
    () =>
      paintPetal(
        petalGeometry({ length: 0.26, width: 0.16, wrap: 0.3, curl: 0.06, roll: 0.03, bowl: 0.02, ruffle: 0.01, seed: 2 }, [6, 8]),
        rose,
        0.85,
      ),
    [rose],
  );
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.5,
        sheen: 1,
        sheenColor: new THREE.Color(rose.sheen),
        side: THREE.DoubleSide,
      }),
    [rose],
  );
  const drift = useMemo(() => {
    const rand = seeded(11);
    return Array.from({ length: COUNT }, () => ({
      x: (rand() - 0.5) * 7,
      z: (rand() - 0.5) * 3 - 0.5,
      offset: rand() * 9,
      speed: 0.35 + rand() * 0.35,
      sway: 0.3 + rand() * 0.5,
      spin: new THREE.Vector3(rand(), rand(), rand()).multiplyScalar(2),
    }));
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = elapsed(timeline, clock.elapsedTime) - from;
    mesh.current.visible = t > 0;
    if (t <= 0) return;

    drift.forEach((d, i) => {
      // Each petal falls on a loop, entering above the frame after its own delay.
      const life = t - d.offset * 0.35;
      const y = 3.2 - ((Math.max(0, life) * d.speed) % 6.6);
      dummy.position.set(d.x + Math.sin(life * d.sway * 2) * 0.4, y, d.z);
      dummy.rotation.set(life * d.spin.x, life * d.spin.y, life * d.spin.z);
      dummy.scale.setScalar(life > 0 ? clamp01(life) : 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, COUNT]} frustumCulled={false} visible={false} />;
}
