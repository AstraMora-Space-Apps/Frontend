"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { NAV_ITEMS, isActive } from "./nav";

/** Mobile drawer (below lg). Base UI Dialog provides focus trap, Esc to close, focus return. */
function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="touch"
            aria-label="Open navigation menu"
            className="lg:hidden"
          />
        }
      >
        <Menu aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(22rem,88vw)] border-border bg-surface p-0 text-base [&>[data-slot=sheet-close]]:top-3 [&>[data-slot=sheet-close]]:right-3 [&>[data-slot=sheet-close]]:size-11"
      >
        <div className="flex items-center border-b border-border px-5 py-4 pr-16">
          <SheetTitle render={<span />}>
            <Logo size={32} />
          </SheetTitle>
        </div>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-lg px-4 text-lg font-medium transition-colors",
                      active ? "bg-ember/15 text-ember" : "text-foreground hover:bg-surface-raised",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border px-5 py-4">
          <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileNav };
