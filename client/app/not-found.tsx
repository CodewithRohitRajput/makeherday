import Link from "next/link";
import { HeartIcon } from "@/(components)/Icons";
import Logo from "@/(components)/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Logo />
      <span className="mt-14 grid size-16 place-items-center rounded-full border border-line bg-white/60 text-rose">
        <HeartIcon className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">This page couldn&apos;t be found</h1>
      <p className="mt-3 max-w-md text-muted">
        The link may be incomplete, or the gift may no longer be available. Check with the person who sent it.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-burgundy px-7 text-sm font-medium text-cream shadow-lift transition-colors hover:bg-burgundy-deep"
      >
        Back to home
      </Link>
    </main>
  );
}
