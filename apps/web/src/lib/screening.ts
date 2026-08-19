import type { ScreeningData, ScreeningStatus } from "@/api/types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function asScreeningData(value: unknown): ScreeningData {
  return isRecord(value) ? (value as ScreeningData) : {}
}

export function screeningStatusLabel(data: ScreeningData): string | null {
  const raw =
    data.compliance_status ??
    data.shariah_compliance_status ??
    data.overall_status
  return typeof raw === "string" && raw.trim() ? raw.trim() : null
}

export function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function isRatioKey(key: string) {
  const k = key.toLowerCase()
  return (
    k.includes("ratio") ||
    k.includes("to_market") ||
    k.includes("to-market") ||
    k.includes("pct") ||
    k.includes("percent")
  )
}

export function formatScreeningValue(key: string, value: unknown): string | null {
  if (value == null || value === "") return null
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number" && Number.isFinite(value)) {
    const k = key.toLowerCase()
    if (k.includes("purification")) {
      return `${value.toFixed(2)}%`
    }
    if (isRatioKey(key)) {
      const pct = Math.abs(value) <= 1 ? value * 100 : value
      return `${pct.toFixed(2)}%`
    }
    return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }
  if (typeof value === "string") return value
  return null
}

export function ratioPercent(key: string, value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  if (!isRatioKey(key) && !key.toLowerCase().includes("purification")) return null
  if (key.toLowerCase().includes("purification")) return value
  return Math.abs(value) <= 1 ? value * 100 : value
}

export function ratioThreshold(key: string): number | null {
  const k = key.toLowerCase()
  if (k.includes("impure") || k.includes("non_permissible") || k.includes("haram")) {
    return 5
  }
  if (k.includes("debt") || k.includes("cash") || k.includes("liquidity")) {
    return 33
  }
  return null
}

export function entriesOf(value: unknown): Array<[string, unknown]> {
  if (!isRecord(value)) return []
  return Object.entries(value).filter(([key]) => !key.startsWith("_"))
}

export function financialRatios(data: ScreeningData): Record<string, unknown> {
  if (isRecord(data.financial_ratios)) return data.financial_ratios
  const picked: Record<string, unknown> = {}
  for (const key of [
    "debt_to_market_cap",
    "debt_to_market_cap_ratio",
    "cash_to_market_cap",
    "cash_to_market_cap_ratio",
    "impure_revenue_ratio",
  ] as const) {
    if (data[key] != null) picked[key] = data[key]
  }
  return picked
}

export function revenueBreakdown(data: ScreeningData): unknown {
  return data.revenue_breakdown ?? data.business_income ?? null
}

export function compliantHint(status: ScreeningStatus, data: ScreeningData) {
  if (data.is_compliant === true) return "Compliant"
  if (data.is_compliant === false) return "Non-compliant"
  return status.replace("_", " ")
}
