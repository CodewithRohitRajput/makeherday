import Link from "next/link";
import Footer from "@/(components)/Footer";
import GiftCard from "@/(components)/GiftCard";
import Hero from "@/(components)/Hero";
import { ArrowRightIcon, LinkIcon, OccasionIcon, PenIcon, RoseIcon } from "@/(components)/Icons";
import Navbar from "@/(components)/Navbar";
import RoseShowcase from "@/(components)/RoseShowcase";
import { FEATURED_OCCASIONS, OCCASIONS } from "@/lib/gifts";

const STEPS = [
  {
    icon: PenIcon,
    title: "Write",
    body: "Pick the occasion, add her name and yours, and write a message in your own words.",
  },
  {
    icon: RoseIcon,
    title: "Pick her rose",
    body: "Choose the rose colour, your wax seal and typeface, and watch it bloom in the live preview.",
  },
  {
    icon: LinkIcon,
    title: "Share the link",
    body: "Get a private link to send over WhatsApp, text or email. She opens it with a tap.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <RoseShowcase />

        <section id="gifts" className="scroll-mt-16 border-t border-line/70 bg-cream-deep/40 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="The collection"
              title="A gift for every moment"
              body="Each one is designed to feel personal, look elegant on any screen, and be remembered."
            />
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {FEATURED_OCCASIONS.map((gift, i) => (
                <GiftCard key={gift.id} gift={gift} index={i} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-sm text-muted">More moments worth celebrating</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                {OCCASIONS.filter((o) => !o.featured).map((o) => (
                  <Link
                    key={o.id}
                    href={`/create?type=${o.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm font-medium text-burgundy transition-all duration-300 hover:-translate-y-0.5 hover:border-rose/50 hover:bg-white hover:shadow-soft"
                  >
                    <OccasionIcon occasion={o.id} className="size-4" />
                    {o.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-16 border-t border-line/70 bg-cream-deep/40 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="How it works"
              title="Ready in three steps"
              body="No account, no app to download. Just a few thoughtful words."
            />
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="relative text-center md:px-6">
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[calc(50%+2.75rem)] right-[calc(-50%+2.75rem)] top-7 hidden h-px bg-[linear-gradient(90deg,var(--color-line),var(--color-rose),var(--color-line))] opacity-60 md:block"
                    />
                  )}
                  <span className="mx-auto grid size-14 place-items-center rounded-full border border-line bg-white/70 text-burgundy shadow-soft">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-5 font-display text-sm italic text-rose">Step {i + 1}</p>
                  <h3 className="mt-1 font-display text-2xl font-medium text-burgundy-deep">{title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,#6b1d2f,#3a0e19)] px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgb(235_195_168/0.18),transparent_70%)]" />
            <h2 className="relative font-display text-4xl font-medium text-cream sm:text-5xl">
              She&apos;ll remember how you made her feel.
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-cream/70">Take two minutes today and send her a rose that never wilts.</p>
            <Link
              href="/create"
              className="group relative mt-9 inline-flex h-13 items-center gap-2.5 rounded-full bg-cream px-7 text-[0.95rem] font-medium text-burgundy-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              Send her a Digital Rose
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-rose">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-burgundy-deep sm:text-5xl">{title}</h2>
      <p className="mt-4 text-muted sm:text-lg">{body}</p>
    </div>
  );
}
