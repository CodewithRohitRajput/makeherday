import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-burgundy-deep text-cream/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-3">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed">
            Thoughtful digital gifts for the people who make your days brighter.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link href="/#gifts" className="transition-colors hover:text-cream">
            Gifts
          </Link>
          <Link href="/#designs" className="transition-colors hover:text-cream">
            Designs
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-cream">
            How it works
          </Link>
          <Link href="/create" className="transition-colors hover:text-cream">
            Create a surprise
          </Link>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-cream/50 sm:px-6">
          © Make Her Day. Made with care.
        </p>
      </div>
    </footer>
  );
}
