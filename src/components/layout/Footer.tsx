import { Logo } from "./Logo";

function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-start md:justify-between">
        <Logo size={28} />
        <p className="max-w-2xl text-base text-muted-foreground">
          <span className="font-semibold text-ember-glow">v0.1, preliminary / unverified.</span>{" "}
          Built from public NASA PSI data. Not for operational safety decisions.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
