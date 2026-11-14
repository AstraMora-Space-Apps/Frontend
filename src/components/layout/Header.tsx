import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="FlameSight home" className="shrink-0 rounded-lg">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <Badge variant="preliminary" className="hidden sm:inline-flex">
            v0.1 · preliminary / unverified
          </Badge>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export { Header };
