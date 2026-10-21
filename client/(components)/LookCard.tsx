import Link from "next/link";
import { defaultDesign, designStyle, getFont, LAYOUTS, REVEALS, type Look } from "@/lib/design";
import { getTheme } from "@/lib/themes";
import { ArrowRightIcon, HeartSolid } from "./Icons";

/** A miniature of a curated look for the home page showcase. */
export default function LookCard({ look }: { look: Look }) {
  const design = { ...defaultDesign(), ...look.design };
  const font = getFont(design.font);
  const theme = getTheme(design.theme);
  const center = design.align === "center";

  return (
    <Link
      href={`/create?look=${look.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white/60 p-3 shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
    >
      <div
        style={designStyle(design)}
        className={`relative flex aspect-[4/3] flex-col justify-center overflow-hidden rounded-2xl px-7 ${center ? "items-center text-center" : ""}`}
      >
        <div aria-hidden className="absolute inset-2.5 rounded-xl border border-(--g-line)" />
        <p className="relative text-[0.6rem] font-medium uppercase tracking-[0.24em] text-(--g-accent)">{look.name}</p>
        <p
          className="g-heading relative mt-2 leading-tight transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{ fontSize: `${2.1 * font.headingScale}rem` }}
        >
          Dearest Meera,
        </p>
        <span className={`relative mt-3 block h-1 w-3/4 rounded-full bg-(--g-ink)/15 ${center ? "mx-auto" : ""}`} />
        <span className={`relative mt-1.5 block h-1 w-2/3 rounded-full bg-(--g-ink)/15 ${center ? "mx-auto" : ""}`} />
        <HeartSolid className="absolute bottom-5 right-6 size-4 text-(--g-accent)" />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <h3 className="font-display text-2xl font-medium text-burgundy-deep">{look.name}</h3>
        <p className="mt-1 text-sm text-muted">{look.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[0.7rem] text-muted">
          {[theme.name, LAYOUTS.find((l) => l.id === design.layout)?.name, font.name, REVEALS.find((r) => r.id === design.reveal)?.name].map(
            (tag) => (
              <span key={tag} className="rounded-full border border-line bg-cream/70 px-2.5 py-1">
                {tag}
              </span>
            ),
          )}
        </div>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-burgundy">
          Use this look
          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
