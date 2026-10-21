import type { Metadata } from "next";
import { Suspense } from "react";
import CreateFlow from "@/(components)/CreateFlow";
import Navbar from "@/(components)/Navbar";

export const metadata: Metadata = {
  title: "Create your surprise",
};

export default function CreatePage() {
  return (
    <>
      <Navbar />
      <main className="relative flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(243_219_214/0.7),transparent_70%)]"
        />
        <Suspense fallback={<div className="mx-auto h-[70vh] max-w-6xl" />}>
          <CreateFlow />
        </Suspense>
      </main>
    </>
  );
}
