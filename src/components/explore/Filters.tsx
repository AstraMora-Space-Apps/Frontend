"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";
import { Search } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  FUEL_CLASSES,
  FUEL_LABEL,
  O2_BOUNDS,
  PILLARS,
  PILLAR_LABEL,
  PLATFORMS,
  PLATFORM_LABEL,
  type ExploreFilters,
  type NumRange,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

type FiltersProps = {
  value: ExploreFilters;
  onChange: (next: ExploreFilters) => void;
  hardwareOptions: readonly string[];
  pressureBounds: NumRange;
  /** Debounce text search (desktop, live-applying). Mobile drawer applies on "Apply". */
  debounceSearch?: boolean;
};

function toggle<T>(list: readonly T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function ToggleChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-medium transition-colors",
        pressed
          ? "border-ember/70 bg-ember/15 text-ember"
          : "border-border bg-surface-raised text-foreground hover:border-ember/40",
      )}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} className="space-y-2">
      <legend id={id} className="text-sm font-semibold text-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function RangeField({
  label,
  unit,
  bounds,
  value,
  step,
  onCommit,
}: {
  label: string;
  unit: string;
  bounds: NumRange;
  value: NumRange | null;
  step: number;
  onCommit: (r: NumRange | null) => void;
}) {
  const id = useId();
  const current: NumRange = value ?? bounds;
  const [draft, setDraft] = useState<NumRange>(current);
  // Follow external changes (reset, URL navigation): "adjust state on prop change" pattern.
  const sourceKey = `${current[0]}-${current[1]}`;
  const [prevKey, setPrevKey] = useState(sourceKey);
  if (sourceKey !== prevKey) {
    setPrevKey(sourceKey);
    setDraft(current);
  }

  const commit = (v: number | readonly number[]) => {
    if (!Array.isArray(v) || v.length !== 2) return;
    const r: NumRange = [v[0], v[1]];
    onCommit(r[0] <= bounds[0] && r[1] >= bounds[1] ? null : r);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span id={id} className="text-sm font-semibold text-foreground">
          {label}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums" aria-hidden>
          {draft[0]}–{draft[1]} {unit}
        </span>
      </div>
      <div className="px-2 py-3">
        <Slider
          aria-labelledby={id}
          min={bounds[0]}
          max={bounds[1]}
          step={step}
          value={[draft[0], draft[1]]}
          thumbLabels={[`Minimum ${label.toLowerCase()}`, `Maximum ${label.toLowerCase()}`]}
          onValueChange={(v) => {
            if (Array.isArray(v) && v.length === 2) setDraft([v[0], v[1]]);
          }}
          onValueCommitted={commit}
        />
      </div>
    </div>
  );
}

/** Controlled filter form. Used in the desktop sidebar and inside the mobile drawer. */
function Filters({
  value,
  onChange,
  hardwareOptions,
  pressureBounds,
  debounceSearch = false,
}: FiltersProps) {
  const searchId = useId();
  const hwId = useId();
  const [q, setQ] = useState(value.q);
  const [prevQ, setPrevQ] = useState(value.q);
  if (value.q !== prevQ) {
    // External change (reset, back/forward): show it in the box.
    setPrevQ(value.q);
    setQ(value.q);
  }

  // Reads the latest filters when the debounce fires, without re-arming the timer.
  const commitSearch = useEffectEvent((next: string) => onChange({ ...value, q: next }));
  useEffect(() => {
    if (!debounceSearch || q === value.q) return;
    const t = setTimeout(() => commitSearch(q), 300);
    return () => clearTimeout(t);
  }, [q, value.q, debounceSearch]);

  const set = (patch: Partial<ExploreFilters>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor={searchId} className="text-sm font-semibold text-foreground">
          Search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!debounceSearch) set({ q: e.target.value });
            }}
            placeholder="Name, fuel, objective…"
            className="min-h-11 w-full rounded-lg border border-border bg-surface-raised py-2 pr-3 pl-10 text-base text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <Group label="Pillar">
        {PILLARS.map((p) => (
          <ToggleChip
            key={p}
            pressed={value.pillars.includes(p)}
            onClick={() => set({ pillars: toggle(value.pillars, p) })}
          >
            {PILLAR_LABEL[p]}
          </ToggleChip>
        ))}
      </Group>

      <Group label="Fuel class">
        {FUEL_CLASSES.map((f) => (
          <ToggleChip
            key={f}
            pressed={value.fuels.includes(f)}
            onClick={() => set({ fuels: toggle(value.fuels, f) })}
          >
            {FUEL_LABEL[f]}
          </ToggleChip>
        ))}
      </Group>

      <div className="space-y-2">
        <label htmlFor={hwId} className="text-sm font-semibold text-foreground">
          Hardware
        </label>
        <select
          id={hwId}
          value={value.hardware}
          onChange={(e) => set({ hardware: e.target.value })}
          className="min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-foreground"
        >
          <option value="">Any hardware</option>
          {hardwareOptions.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <RangeField
        label="Oxygen"
        unit="%"
        bounds={O2_BOUNDS}
        step={1}
        value={value.o2}
        onCommit={(o2) => set({ o2 })}
      />
      <RangeField
        label="Pressure"
        unit="psi"
        bounds={pressureBounds}
        step={0.5}
        value={value.pressure}
        onCommit={(pressure) => set({ pressure })}
      />

      <Group label="Platform">
        {PLATFORMS.map((p) => (
          <ToggleChip
            key={p}
            pressed={value.platforms.includes(p)}
            onClick={() => set({ platforms: toggle(value.platforms, p) })}
          >
            {PLATFORM_LABEL[p]}
          </ToggleChip>
        ))}
      </Group>
    </div>
  );
}

export { Filters };
