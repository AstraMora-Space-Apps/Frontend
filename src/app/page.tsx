import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  MessageSquareText,
  ShieldAlert,
  Wind,
} from "lucide-react";
import { EmberSphere } from "@/components/layout/EmberSphere";
import { FadeUp } from "@/components/layout/FadeUp";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ENTRY_CARDS = [
  {
    step: 1,
    title: "Ask",
    body: "Ask a question in plain language. Every answer cites the paper and page it came from.",
    href: "/ask",
    cta: "Ask FlameSight",
    icon: MessageSquareText,
  },
  {
    step: 2,
    title: "Explore",
    body: "Browse investigations, filter by fuel, oxygen and pressure, and compare experiments side by side.",
    href: "/explore",
    cta: "Explore research",
    icon: Compass,
  },
  {
    step: 3,
    title: "Act",
    body: "See ranked fire-safety insights, scored by safety impact, evidence strength and mission relevance.",
    href: "/insights",
    cta: "View insights",
    icon: ShieldAlert,
  },
] as const;

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <FadeUp>
              <h1 className="max-w-[16ch]">
                Fire behaves <span className="text-ember">differently</span> in space.
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                FlameSight turns NASA&apos;s microgravity combustion research into fire-safety
                insight for Moon and Mars habitats.
              </p>
            </FadeUp>
            <FadeUp delay={0.2} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/ask" className={buttonVariants({ size: "xl" })}>
                Ask FlameSight
                <ArrowRight aria-hidden />
              </Link>
              <Link
                href="/explore"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xl" }),
                  "border-cyan/50 bg-transparent text-cyan hover:bg-cyan/10 hover:text-cyan",
                )}
              >
                Explore research
              </Link>
            </FadeUp>
          </div>
          <EmberSphere className="mx-auto w-[min(70vw,22rem)] lg:w-full lg:max-w-md" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-center gap-3 rounded-card border border-border bg-surface px-5 py-4">
              <Wind className="size-6 shrink-0 text-cyan" aria-hidden />
              <span className="text-base">
                <strong className="font-bold text-foreground">30% O₂ at 10.2 psi:</strong>{" "}
                <span className="text-muted-foreground">planned Moon Base atmosphere</span>
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-card border border-border bg-surface px-5 py-4">
              <BookOpenCheck className="size-6 shrink-0 text-cyan" aria-hidden />
              <span className="text-base font-bold text-foreground">
                Every claim cites its source
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="entry-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 id="entry-heading" className="text-2xl sm:text-3xl">
          Three steps from question to action
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {ENTRY_CARDS.map(({ step, title, body, href, cta, icon: Icon }) => (
            <li key={href}>
              <Card
                variant={step === 1 ? "glow" : "default"}
                className="group relative flex h-full flex-col transition-colors hover:border-ember/60"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-pill bg-ember/15 text-lg font-extrabold text-ember"
                    aria-hidden
                  >
                    {step}
                  </span>
                  <Icon className="size-6 text-cyan" aria-hidden />
                </div>
                <h3 className="mt-4 text-2xl">
                  <span className="sr-only">Step {step}: </span>
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-base text-muted-foreground">{body}</p>
                <Link
                  href={href}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-lg font-semibold text-ember after:absolute after:inset-0 after:rounded-card"
                >
                  {cta}
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
