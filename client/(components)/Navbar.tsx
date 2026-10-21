import Link from "next/link";
import Logo from "./Logo";

const LINKS = [
  { href: "/#gifts", label: "Gifts" },
  { href: "/#designs", label: "Designs" },
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
            className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-burgundy-deep sm:px-5"
          >
            Create a surprise
          </Link>
        </div>
      </nav>
    </header>
  );
}
