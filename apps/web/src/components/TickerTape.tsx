import { ChangeText } from "@/components/ChangeText"
import { watchlist } from "@/data/mock"
import { formatMoney } from "@/lib/format"

export function TickerTape() {
  const items = [...watchlist, ...watchlist]

  return (
    <div className="relative overflow-hidden border-b border-sidebar-border bg-sidebar">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-sidebar to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-sidebar to-transparent" />
      <div className="animate-ticker flex w-max gap-8 py-1.5 pr-8">
        {items.map((row, index) => (
          <span
            key={`${row.ticker}-${index}`}
            className="flex items-baseline gap-2 font-mono text-[11px] tabular-nums"
          >
            <span className="font-medium tracking-wide">{row.ticker}</span>
            <span className="text-muted-foreground">{formatMoney(row.price)}</span>
            <ChangeText value={row.changePct} className="text-[11px]" />
          </span>
        ))}
      </div>
    </div>
  )
}
