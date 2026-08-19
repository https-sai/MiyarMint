import type { ScreeningData, ScreeningStatus } from "@/api/types"
import { StatusBadge } from "@/components/StatusBadge"
import { cn } from "@/lib/utils"
import {
  asScreeningData,
  compliantHint,
  entriesOf,
  financialRatios,
  formatScreeningValue,
  humanizeKey,
  ratioPercent,
  ratioThreshold,
  revenueBreakdown,
  screeningStatusLabel,
} from "@/lib/screening"

function RatioBar({
  label,
  value,
  formatted,
  threshold,
}: {
  label: string
  value: number | null
  formatted: string
  threshold: number | null
}) {
  const width = value == null ? 0 : Math.min(100, Math.max(0, value))
  const over = threshold != null && value != null && value > threshold
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatted}
          {threshold != null ? ` · max ${threshold}%` : ""}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden bg-muted">
        <div
          className={cn("h-full", over ? "bg-loss" : "bg-primary")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function NestedValue({ label, value }: { label: string; value: unknown }) {
  const formatted = formatScreeningValue(label, value)
  if (formatted) {
    return (
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{humanizeKey(label)}</span>
        <span className="font-mono tabular-nums">{formatted}</span>
      </div>
    )
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <p className="kicker">{humanizeKey(label)}</p>
        <div className="space-y-3 border border-border bg-muted/40 p-3">
          {value.map((item, index) => (
            <div key={`${label}-${index}`} className="space-y-1">
              {typeof item === "object" && item ? (
                entriesOf(item).map(([k, v]) => (
                  <NestedValue key={k} label={k} value={v} />
                ))
              ) : (
                <p className="font-mono text-xs">{String(item)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const nested = entriesOf(value)
  if (nested.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="kicker">{humanizeKey(label)}</p>
      <div className="space-y-1.5">
        {nested.map(([k, v]) => (
          <NestedValue key={k} label={k} value={v} />
        ))}
      </div>
    </div>
  )
}

export function ComplianceDetails({
  status,
  data,
  loading,
  error,
}: {
  status: ScreeningStatus | null
  data?: ScreeningData | unknown | null
  loading?: boolean
  error?: string | null
}) {
  const screening = asScreeningData(data)
  const ratios = entriesOf(financialRatios(screening))
  const revenue = revenueBreakdown(screening)
  const revenueEntries = entriesOf(revenue)
  const methods = entriesOf(screening.methodologies ?? screening.methodology_summary)
  const label = screeningStatusLabel(screening)
  const purification =
    typeof screening.purification_rate === "number"
      ? screening.purification_rate
      : null

  if (loading) {
    return (
      <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
        Loading screening
      </p>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!status && ratios.length === 0 && revenueEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No screening data for this ticker.</p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {typeof screening.symbol === "string" ? (
          <p className="font-mono text-sm font-medium tracking-wide">{screening.symbol}</p>
        ) : null}
        {status ? <StatusBadge status={status} /> : null}
        {label ? (
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {label}
          </p>
        ) : status ? (
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {compliantHint(status, screening)}
          </p>
        ) : null}
        {screening.is_compliant != null ? (
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            is_compliant {screening.is_compliant ? "true" : "false"}
          </p>
        ) : null}
        {purification != null ? (
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase">
            Purification {purification.toFixed(2)}%
          </p>
        ) : null}
      </div>

      {ratios.length > 0 ? (
        <div className="space-y-3">
          <p className="kicker">Financial ratios</p>
          {ratios.map(([key, value]) => {
            const formatted = formatScreeningValue(key, value)
            if (!formatted) return <NestedValue key={key} label={key} value={value} />
            return (
              <RatioBar
                key={key}
                label={humanizeKey(key)}
                value={ratioPercent(key, value)}
                formatted={formatted}
                threshold={ratioThreshold(key)}
              />
            )
          })}
        </div>
      ) : null}

      {revenue != null ? (
        <div className="space-y-3">
          <p className="kicker">Revenue breakdown</p>
          {revenueEntries.length > 0 ? (
            revenueEntries.map(([key, value]) => (
              <NestedValue key={key} label={key} value={value} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No segment detail returned.</p>
          )}
        </div>
      ) : null}

      {methods.length > 0 ? (
        <div className="space-y-2">
          <p className="kicker">Methodologies</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {methods.map(([key, value]) => (
              <div
                key={key}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{humanizeKey(key)}</span>
                <span className="font-mono tabular-nums">
                  {formatScreeningValue(key, value) ?? String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
