export type NavItem = { href: string; label: string };

/** Single source of truth for primary navigation (Header, MobileNav). */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/ask", label: "Ask" },
  { href: "/explore", label: "Explore" },
  { href: "/coverage", label: "Coverage Map" },
  { href: "/insights", label: "Insights" },
  { href: "/safety-margin", label: "Safety Margin" },
  { href: "/about", label: "About" },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
