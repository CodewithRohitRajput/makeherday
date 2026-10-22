"use client";

import { Environment, Lightformer, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { designColors, getFont, getRose, parseDesign, type Design, type RoseOption } from "@/lib/design";
import { getOccasion } from "@/lib/gifts";
import type { GiftContent } from "../GiftView";
import Envelope3D from "./Envelope3D";
import FallingPetals from "./FallingPetals";
import Rose from "./Rose";
import { finaleAt, TimelineContext } from "./timeline";
import { toPhrases, WordLayer, WordOrbit, type LabelRefs } from "./Words";

type Stage = "sealed" | "opening" | "finale";

interface RoseExperienceProps {
  gift: GiftContent;
  /** Sized to fit a card instead of filling the screen. */
  embedded?: boolean;
  /** Self-playing showcase: opens on its own, loops, and has no controls. */
  demo?: boolean;
}

export default function RoseExperience({ gift, embedded = false, demo = false }: RoseExperienceProps) {
  const design = useMemo(() => parseDesign(gift.theme, gift.giftType), [gift.theme, gift.giftType]);
  const rose = getRose(design.rose);
  const occasion = getOccasion(design.occasion);
  const recipient = gift.recipientName.trim() || "her name";
  const sender = gift.senderName.trim() || "your name";
  const message = gift.message.trim() || "Your message will appear here, floating around the rose.";
  const phrases = useMemo(() => toPhrases(message), [message]);
  const font = getFont(design.font);

  const timeline = useRef<number | null>(null);
  const clock = useRef<THREE.Clock | null>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState<Stage>("sealed");
  const [picked, setPicked] = useState<number | null>(null);
  const [letter, setLetter] = useState(false);

  useEffect(() => {
    if (stage !== "opening") return;
    const timer = setTimeout(() => setStage("finale"), finaleAt(phrases.length) * 1000);
    return () => clearTimeout(timer);
  }, [stage, phrases.length]);

  // Stop rendering while scrolled out of view.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const open = () => {
    if (timeline.current !== null || !clock.current) return;
    timeline.current = clock.current.elapsedTime;
    setStage("opening");
  };

  const replay = () => {
    timeline.current = null;
    setPicked(null);
    setLetter(false);
    setStage("sealed");
  };

  const demoTick = useEffectEvent(() => (stage === "sealed" ? open() : replay()));
  useEffect(() => {
    if (!demo || !ready || !visible || stage === "opening") return;
    const timer = setTimeout(demoTick, stage === "sealed" ? 1800 : 6000);
    return () => clearTimeout(timer);
  }, [demo, ready, visible, stage]);

  const heading = design.heading || occasion.heading(recipient);
  const carded = embedded || demo;
  const glowText = { textShadow: `0 0 18px ${rose.glow}, 0 0 42px ${rose.glow}88` };
  const headingFont = { fontFamily: font.heading, fontStyle: font.italic ? "italic" : "normal", fontWeight: font.weight };
  const background = `#${new THREE.Color(rose.deep).lerp(new THREE.Color("#050203"), 0.84).getHexString()}`;

  return (
    <div
      ref={container}
      className={`relative isolate overflow-hidden text-white select-none ${
        carded ? "mx-auto aspect-[4/5] w-full max-w-md rounded-[2rem] shadow-lift" : "fixed inset-0 h-dvh"
      }`}
      style={{ background }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.9, 6.4], fov: 35 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="absolute! inset-0"
        frameloop={visible ? "always" : "never"}
        onCreated={(state) => {
          clock.current = state.clock;
          setReady(true);
        }}
      >
        {/* The Canvas is a separate React root, so the timeline is passed back in. */}
        <TimelineContext.Provider value={timeline}>
          <Scene
            design={design}
            rose={rose}
            background={background}
            phrases={phrases}
            labels={labels}
            sender={sender}
            stage={stage}
            interactive={!demo}
            onOpen={open}
          />
        </TimelineContext.Provider>
      </Canvas>

      <WordLayer phrases={phrases} labels={labels} font={font.body} glow={rose.glow} onPick={demo ? () => {} : setPicked} />

      {stage === "sealed" && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 animate-glow-in px-6 pt-[9%] text-center">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-white/60">Something special for</p>
            <p
              className="mt-2 break-words leading-tight"
              style={{ ...headingFont, ...glowText, fontSize: `calc(${carded ? "clamp(1.8rem, 6vw, 2.5rem)" : "clamp(2.2rem, 8vw, 3.4rem)"} * ${font.headingScale})` }}
            >
              {recipient}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[8%] text-center">
            <button
              type="button"
              onClick={open}
              className="animate-pulse rounded-full px-5 py-2 text-sm tracking-wide text-white/85 focus-visible:outline-2 focus-visible:outline-white/70"
            >
              Tap the envelope to open
            </button>
            <p className="mt-2 text-sm text-white/55">
              from{" "}
              <span style={headingFont} className="text-lg text-white/85">
                {sender}
              </span>
            </p>
          </div>
        </>
      )}

      {stage === "finale" && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[7%] text-center">
            <h1
              className="animate-glow-in break-words leading-[1.1]"
              style={{ ...headingFont, ...glowText, fontSize: `calc(${carded ? "clamp(1.5rem, 5vw, 2.1rem)" : "clamp(2rem, 7vw, 3.6rem)"} * ${font.headingScale})` }}
            >
              {heading}
            </h1>
            <p className="mt-3 animate-glow-in text-sm text-white/70 [animation-delay:0.8s]">
              with love,{" "}
              <span style={headingFont} className="text-lg text-white">
                {sender}
              </span>
            </p>
          </div>
          <div
            className={`absolute inset-x-0 bottom-0 animate-glow-in flex-wrap items-center justify-center gap-2 px-4 pb-[6%] [animation-delay:1.4s] ${
              demo ? "hidden" : "flex"
            }`}
          >
            <PillButton onClick={() => setLetter(true)} primary>
              Read the letter
            </PillButton>
            <PillButton onClick={replay}>Replay</PillButton>
            {!embedded && (
              <Link
                href="/create"
                className="rounded-full border border-white/25 px-4 py-2 text-sm text-white/85 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Make one back
              </Link>
            )}
          </div>
        </>
      )}

      {stage === "opening" && !demo && picked === null && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[1.5%] text-center text-[0.68rem] tracking-wide text-white/35">
          Drag to turn the rose · tap a line to read it
        </p>
      )}

      {picked !== null && (
        <Overlay onClose={() => setPicked(null)}>
          <p
            className="animate-glow-in text-center leading-snug"
            style={{ ...glowText, fontFamily: font.body, fontSize: "clamp(1.5rem, 5.5vw, 2.4rem)" }}
          >
            {phrases[picked]}
          </p>
          <p className="mt-6 text-center text-xs text-white/45">Tap anywhere to let it go</p>
        </Overlay>
      )}

      {letter && (
        <Overlay onClose={() => setLetter(false)}>
          <div className="max-h-[78%] w-full max-w-lg animate-glow-in overflow-y-auto rounded-3xl border border-white/15 bg-white/[0.06] p-7 text-left sm:p-9">
            <p className="leading-tight" style={{ ...headingFont, ...glowText, fontSize: `${1.9 * font.headingScale}rem` }}>
              {heading}
            </p>
            <p
              className="mt-5 whitespace-pre-line leading-relaxed text-white/90"
              style={{ fontFamily: font.body, fontSize: `${1.2 * font.bodyScale}rem` }}
            >
              {message}
            </p>
            {design.postscript && (
              <p className="mt-4 text-white/70" style={{ fontFamily: font.body }}>
                <span className="font-semibold" style={{ color: rose.glow }}>
                  P.S.{" "}
                </span>
                {design.postscript}
              </p>
            )}
            <p className="mt-7 text-xs text-white/55">{design.signoff || occasion.signoff}</p>
            <p style={{ ...headingFont, color: rose.glow, fontSize: `${1.7 * font.headingScale}rem` }}>{sender}</p>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Scene({
  design,
  rose,
  background,
  phrases,
  labels,
  sender,
  stage,
  interactive,
  onOpen,
}: {
  design: Design;
  rose: RoseOption;
  background: string;
  phrases: string[];
  labels: LabelRefs;
  sender: string;
  stage: Stage;
  interactive: boolean;
  onOpen: () => void;
}) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const { seal } = designColors(design);

  return (
    <>
      <color attach="background" args={[background]} />
      <ambientLight intensity={0.25} />
      <spotLight
        position={[-3, 5, 4.5]}
        angle={0.5}
        penumbra={0.8}
        decay={0}
        intensity={2.2}
        color="#ffe6d0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[3, 2.5, -4]} intensity={2.4} color={rose.glow} />
      <pointLight position={[0, -1.2, 3]} intensity={1.2} decay={0} color="#ffd9c0" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff1e4" position={[0, 4, 3]} scale={[8, 3, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="ring" intensity={3} color={rose.glow} position={[-4, 1, -3]} scale={3} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[5, 0, 2]} scale={[2, 6, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
      <Sparkles count={70} scale={[7, 5, 4]} size={2.6} speed={0.25} noise={1} opacity={0.75} color={rose.glow} />

      <group scale={Math.min(1, Math.max(0.65, aspect / 0.9))}>
        <Envelope3D
          seal={seal}
          emblem={design.seal}
          initial={sender === "your name" ? "" : sender.charAt(0).toUpperCase()}
          glow={rose.glow}
          onOpen={onOpen}
        />
        <Rose rose={rose} />
      </group>
      <WordOrbit count={phrases.length} labels={labels} />
      <FallingPetals rose={rose} from={finaleAt(phrases.length) - 0.5} />

      {interactive && (
        <OrbitControls
          enabled={stage !== "sealed"}
          enablePan={false}
          enableZoom={false}
          enableDamping
          rotateSpeed={0.5}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.62}
          target={[0, 0.1, 0]}
        />
      )}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.9} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  );
}

function PillButton({ children, onClick, primary = false }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition-colors ${
        primary
          ? "bg-white font-medium text-[#2b0a12] hover:bg-white/90"
          : "border border-white/25 text-white/85 backdrop-blur-sm hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal
      onClick={onClose}
      className="absolute inset-0 z-50 flex animate-[fade-up_0.4s_ease-out_both] flex-col items-center justify-center bg-black/55 px-6 backdrop-blur-md"
    >
      {children}
    </div>
  );
}
