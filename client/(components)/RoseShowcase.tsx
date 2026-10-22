import Link from "next/link";
import { ROSES } from "@/lib/design";
import { ArrowRightIcon, MailIcon, PetalSolid, RoseIcon, SparkleIcon, StarSolid } from "./Icons";

const BEATS = [
  {
    icon: MailIcon,
    title: "A sealed envelope arrives",
    body: "Her name glows above an envelope closed with your wax seal. One tap breaks it.",
  },
  {
    icon: SparkleIcon,
    title: "Light spills out",
    body: "The flap lifts, the envelope glows, and a rosebud rises out of the light.",
  },
  {
    icon: RoseIcon,
    title: "The rose blooms in 3D",
    body: "Petal by petal, it opens in front of her. She can turn it with her finger and see it from every side.",
  },
  {
    icon: PetalSolid,
    title: "Your words float around it",
    body: "Your message drifts around the rose like fireflies, then petals fall and her name lights up.",
  },
];

const PERKS = ["Real-time 3D", "Works on any phone", "No app to download", "She can replay it forever"];

/** Home page feature section for the Digital Rose, our signature gift. */
export default function RoseShowcase() {
  return (
    <section id="digital-rose" className="relative isolate scroll-mt-16 overflow-hidden bg-[#14060a] py-20 text-cream sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_15%_10%,rgb(156_10_34/0.35),transparent_70%),radial-gradient(45%_45%_at_90%_90%,rgb(192_100_118/0.22),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <div className="flex flex-wrap gap-2">
            <Tag>
              <StarSolid className="size-3.5 text-gold" />
              Popular
            </Tag>
            <Tag>Best gift ever</Tag>
          </div>
          <h2 className="mt-5 font-display text-5xl font-medium tracking-tight sm:text-6xl">
            The Digital Rose<span className="text-[#ff6b86]">.</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream/70">
            A card gets read once. A rose that blooms in her hands, with your words floating around it, is a moment she&apos;ll open
            again and again.
          </p>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {BEATS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-4">
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-[#ff8da1]">
                  <Icon className="size-5" />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#9c0a22] text-[0.65rem] font-semibold text-cream">
                    {i + 1}
                  </span>
                </span>
                <span>
                  <span className="block font-display text-xl font-medium">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-cream/60">{body}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/create"
              className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-cream px-7 text-[0.95rem] font-medium text-burgundy-deep shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              <RoseIcon className="size-5" />
              Create her Digital Rose
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <p className="text-sm text-cream/50">Ready in about two minutes</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cream/50">Pick her colour</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {ROSES.map((r) => (
              <Link
                key={r.id}
                href={`/create?rose=${r.id}`}
                className="group flex flex-col items-center rounded-2xl border border-white/10 px-2 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/5"
              >
                <span
                  className="size-14 rounded-full transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `radial-gradient(circle at 38% 32%, ${r.sheen}, ${r.petal} 45%, ${r.deep})`,
                    boxShadow: `0 0 28px -4px ${r.glow}`,
                  }}
                />
                <span className="mt-3 text-xs font-medium text-cream/80">{r.name}</span>
              </Link>
            ))}
          </div>
          <ul className="mt-7 grid grid-cols-2 gap-2 border-t border-white/10 pt-6">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-cream/70">
                <span className="size-1.5 shrink-0 rounded-full bg-[#ff6b86]" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cream">
      {children}
    </span>
  );
}
