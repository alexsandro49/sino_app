const FLAT_THRESHOLD = 0.005;

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const compactNumberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  timeZone: "America/Sao_Paulo",
});

const COMPACT_UNITS = [
  { value: 1e12, label: "tri" },
  { value: 1e9, label: "bi" },
  { value: 1e6, label: "mi" },
  { value: 1e3, label: "mil" },
];

export type Trend = "up" | "down" | "flat";

export function trendOf(changePercent: number): Trend {
  if (Math.abs(changePercent) < FLAT_THRESHOLD) return "flat";
  return changePercent > 0 ? "up" : "down";
}

export function formatChange(changePercent: number): string {
  const trend = trendOf(changePercent);
  if (trend === "flat") return "0,00%";
  return `${trend === "up" ? "+" : "−"}${percentFormatter.format(Math.abs(changePercent))}%`;
}

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatCompact(value: number): string {
  const unit = COMPACT_UNITS.find((candidate) => Math.abs(value) >= candidate.value);
  if (!unit) return compactNumberFormatter.format(value);
  return `${compactNumberFormatter.format(value / unit.value)} ${unit.label}`;
}

export function formatUpdatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  const isToday = dayFormatter.format(date) === dayFormatter.format(new Date());
  return isToday ? `hoje às ${timeFormatter.format(date)}` : `${dayFormatter.format(date)}, ${timeFormatter.format(date)}`;
}
