"use client";

import { useEffect } from "react";

export default function GiftError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-medium text-burgundy-deep">We couldn&apos;t open this gift</h1>
      <p className="mt-3 max-w-md text-muted">Something went wrong while loading it. Please try again in a moment.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex h-12 items-center rounded-full bg-burgundy px-7 text-sm font-medium text-cream shadow-lift transition-colors hover:bg-burgundy-deep"
      >
        Try again
      </button>
    </main>
  );
}
