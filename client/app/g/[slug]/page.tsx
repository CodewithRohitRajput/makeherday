import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HeartIcon } from "@/(components)/Icons";
import Logo from "@/(components)/Logo";
import RoseGift from "@/(components)/rose/RoseGift";
import { getGift } from "@/lib/api";

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
  if (gift.isPaid === false) return <Unpaid />;

  // Every gift opens as a Digital Rose, including ones made before cards were retired.
  return <RoseGift gift={gift} fullscreen />;
}

function Unpaid() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Logo />
      <span className="mt-14 grid size-16 place-items-center rounded-full border border-line bg-white/60 text-rose">
        <HeartIcon className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">This gift isn&apos;t ready yet</h1>
      <p className="mt-3 max-w-md text-muted">It&apos;s still being finished. Check back soon, or ask the person who sent it.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-burgundy px-7 text-sm font-medium text-cream shadow-lift transition-colors hover:bg-burgundy-deep"
      >
        Back to home
      </Link>
    </div>
  );
}

function GiftSkeleton() {
  return (
    <div aria-label="Loading your gift" className="fixed inset-0 grid h-dvh place-items-center bg-[#0d0507]">
      <span className="size-10 animate-ping rounded-full bg-[#ff4d6d]/40" />
    </div>
  );
}
