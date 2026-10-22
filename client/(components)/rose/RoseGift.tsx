"use client";

import { lazy, Suspense, useSyncExternalStore } from "react";
import GiftView, { type GiftContent } from "../GiftView";

// Only ever rendered on the client (see the server snapshot below), so three.js stays out of the server render.
const RoseExperience = lazy(() => import("./RoseExperience"));

let webgl: boolean | undefined;
function supportsWebGL() {
  if (webgl === undefined) {
    try {
      webgl = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

/**
 * The 3D rose reveal. Loads three.js only when a rose gift is shown and falls
 * back to the flat envelope on devices without WebGL.
 */
export default function RoseGift({ gift, fullscreen = false, demo = false }: { gift: GiftContent; fullscreen?: boolean; demo?: boolean }) {
  const supported = useSyncExternalStore(
    () => () => {},
    supportsWebGL,
    () => null,
  );

  if (supported === null) return <RoseLoading fullscreen={fullscreen} />;
  if (!supported) return <GiftView gift={gift} sealed flat />;
  return (
    <Suspense fallback={<RoseLoading fullscreen={fullscreen} />}>
      <RoseExperience gift={gift} embedded={!fullscreen} demo={demo} />
    </Suspense>
  );
}

function RoseLoading({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <div
      aria-label="Loading your gift"
      className={`grid place-items-center bg-[#0d0507] ${
        fullscreen ? "fixed inset-0 h-dvh" : "mx-auto aspect-[4/5] w-full max-w-md rounded-[2rem]"
      }`}
    >
      <span className="size-10 animate-ping rounded-full bg-[#ff4d6d]/40" />
    </div>
  );
}
