import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/(components)/Navbar";
import PaymentReturn from "@/(components)/PaymentReturn";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false },
};

export default function PaymentReturnPage() {
  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(243_219_214/0.7),transparent_70%)]"
        />
        <Suspense fallback={<div className="mx-auto h-[60vh] max-w-xl" />}>
          <PaymentReturn />
        </Suspense>
      </main>
    </>
  );
}
