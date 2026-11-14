import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label="FlameSight home"
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg"
        >
          <Logo size={32} />
        </Link>
        <nav aria-label="Primary" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <Badge variant="preliminary" className="hidden xl:inline-flex">
            v0.1 · preliminary / unverified
          </Badge>
          {/* Below xl: short form so the header never overflows; full text for screen readers (Hard rule 5). */}
          <Badge
            variant="preliminary"
            className="px-2.5 xl:hidden"
            aria-label="v0.1, preliminary / unverified"
          >
            v0.1 preliminary
          </Badge>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export { Header };
