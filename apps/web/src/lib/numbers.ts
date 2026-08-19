import type { MarketQuote, QuoteResult } from "@/api/types"

export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN
  return Number.isFinite(n) ? n : 0
}

export function initials(name: string | null | undefined, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "?"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatVolume(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return new Intl.NumberFormat("en-US").format(value)
}

export function isQuoteOk(row: QuoteResult): row is MarketQuote {
  return "price" in row && typeof row.price === "number" && Number.isFinite(row.price)
}
