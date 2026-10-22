import Link from "next/link";
import { RoseIcon } from "./Icons";
import Logo from "./Logo";

const LINKS = [
  { href: "/#digital-rose", label: "Digital Rose" },
  { href: "/#gifts", label: "Gifts" },
  { href: "/#how-it-works", label: "How it works" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-burgundy sm:inline-block"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-burgundy-deep sm:px-5"
          >
            <RoseIcon className="size-4" />
            Send a rose
          </Link>
        </div>
      </nav>
    </header>
  );
}
