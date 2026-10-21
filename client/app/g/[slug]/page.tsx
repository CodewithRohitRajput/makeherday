import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FloatingEffect from "@/(components)/FloatingEffect";
import GiftView from "@/(components)/GiftView";
import Logo from "@/(components)/Logo";
import { getGift } from "@/lib/api";
import { designColors, pageBackdrop, parseDesign } from "@/lib/design";

export const metadata: Metadata = {
  title: "A surprise for you",
  description: "Someone made something special for you.",
};

export default function GiftPage({ params }: PageProps<"/g/[slug]">) {
  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <Suspense fallback={<GiftSkeleton />}>
        <Gift params={params} />
      </Suspense>
    </main>
  );
}

async function Gift({ params }: { params: PageProps<"/g/[slug]">["params"] }) {
  const { slug } = await params;
  const gift = await getGift(slug);
  if (!gift) notFound();

  const design = parseDesign(gift.theme, gift.giftType);
  const { theme, accent } = designColors(design);

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: pageBackdrop(design) }} />
      <FloatingEffect effect={design.effect} color={accent} className="-z-10" />

      <header className="flex justify-center px-4 pt-8">
        <Logo light={theme.dark} />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <GiftView gift={gift} sealed />
      </div>

      <footer className={`px-4 pb-10 text-center text-sm ${theme.dark ? "text-white/60" : "text-muted"}`}>
        Want to make someone&apos;s day?{" "}
        <Link
          href="/create"
          className={`font-medium underline-offset-4 hover:underline ${theme.dark ? "text-white" : "text-burgundy"}`}
        >
          Create your own surprise
        </Link>
      </footer>
    </>
  );
}

function GiftSkeleton() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgb(243_219_214/0.85),transparent_70%)]"
      />
      <header className="flex justify-center px-4 pt-8">
        <Logo />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div
          className="mx-auto aspect-[4/5] w-full max-w-md animate-pulse rounded-[2rem] bg-blush/60"
          aria-label="Loading your gift"
        />
      </div>
    </>
  );
}
