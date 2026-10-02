import { cn } from "@/lib/utils/cn";

// Class names are written out in full so Tailwind can find them.
const colors = [
  { name: "canvas", value: "#FFFCFA", className: "bg-canvas" },
  { name: "surface", value: "#FFFEFE", className: "bg-surface" },
  { name: "surface-alt", value: "#F7F2ED", className: "bg-surface-alt" },
  { name: "paper", value: "#FFFFFF", className: "bg-paper" },
  { name: "ink / foreground", value: "#252522", className: "bg-ink" },
  { name: "muted (text)", value: "#706F6C", className: "bg-muted" },
  { name: "muted-soft", value: "#858481", className: "bg-muted-soft" },
  { name: "border", value: "#EFE6DC", className: "bg-border" },
  { name: "border-strong", value: "#E6DBD1", className: "bg-border-strong" },
  { name: "accent", value: "#F2805D", className: "bg-accent" },
  { name: "accent-hover", value: "#E97452", className: "bg-accent-hover" },
  { name: "accent-pressed", value: "#D96544", className: "bg-accent-pressed" },
  { name: "success", value: "#22C55E", className: "bg-success" },
  { name: "warning", value: "#C8B828", className: "bg-warning" },
  { name: "error", value: "#EF4343", className: "bg-error" },
  { name: "error-strong (text)", value: "#D12A2A", className: "bg-error-strong" },
];

export function ColorTokens() {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
      {colors.map((color) => (
        <li key={color.name} className="flex flex-col gap-2">
          <span className={cn("h-16 rounded-md border border-border", color.className)} />
          <span className="text-label text-ink">{color.name}</span>
          <span className="text-caption text-muted uppercase">{color.value}</span>
        </li>
      ))}
    </ul>
  );
}

const typeScale = [
  { name: "display", className: "text-display", spec: "56 / 500 / 1.1 (fluid from 40)" },
  { name: "h1", className: "text-h1", spec: "40 / 500 / 1.15 (fluid from 32)" },
  { name: "h2", className: "text-h2", spec: "28 / 500 / 1.25 (fluid from 24)" },
  { name: "h3", className: "text-h3", spec: "20 / 500 / 1.35" },
  { name: "body-lg", className: "text-body-lg", spec: "18 / 400 / 1.5" },
  { name: "body", className: "text-body", spec: "16 / 400 / 1.5" },
  { name: "label", className: "text-label", spec: "14 / 500 / 1.4" },
  { name: "caption", className: "text-caption", spec: "13 / 400 / 1.4" },
  { name: "button", className: "text-button", spec: "15 / 500 / 1.4" },
];

export function TypeScale() {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {typeScale.map((item) => (
        <li
          key={item.name}
          className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-8"
        >
          <span className="w-40 shrink-0 text-caption text-muted">
            {item.name} · {item.spec}
          </span>
          <span className={cn("min-w-0 break-words text-ink", item.className)}>
            Professional invoices
          </span>
        </li>
      ))}
    </ul>
  );
}

const radii = [
  { name: "xs · 6", className: "rounded-xs" },
  { name: "sm · 8", className: "rounded-sm" },
  { name: "md · 12", className: "rounded-md" },
  { name: "lg · 16", className: "rounded-lg" },
  { name: "xl · 24", className: "rounded-xl" },
  { name: "pill", className: "rounded-pill" },
];

export function RadiusAndShadow() {
  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {radii.map((radius) => (
          <li key={radius.name} className="flex flex-col gap-2">
            <span
              className={cn("h-16 border border-border-strong bg-surface-alt", radius.className)}
            />
            <span className="text-caption text-muted">{radius.name}</span>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-card text-label">
          Flat (default card)
        </div>
        <div className="rounded-lg bg-surface p-card text-label shadow-control">shadow-control</div>
        <div className="rounded-lg bg-surface p-card text-label shadow-elevated">
          shadow-elevated
        </div>
      </div>
    </div>
  );
}
