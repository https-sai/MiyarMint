import type { ReactNode } from "react"

import { ChangeText } from "@/components/ChangeText"
import { PreviewFrame } from "@/components/previews/PreviewFrame"
import { holdings, portfolioSummary } from "@/data/mock"
import { formatMoney } from "@/lib/format"

const previewHoldings = holdings.slice(0, 4).map((row) => {
  const pnl = row.shares * row.price - row.shares * row.avgCost
  const pnlPct = (pnl / (row.shares * row.avgCost)) * 100
  return { ...row, pnl, pnlPct }
})

export function PortfolioPreview() {
  return (
    <PreviewFrame to="/portfolio" label="Portfolio Preview" active="portfolio">
      <div className="space-y-2.5">
        <p className="text-[11px] font-medium tracking-tight">Portfolio</p>
        <div className="grid grid-cols-3 gap-1.5">
          <MiniStat label="Value" value={formatMoney(portfolioSummary.totalValue)} />
          <MiniStat label="Cash" value={formatMoney(portfolioSummary.cash)} />
          <MiniStat
            label="Return"
            value={<ChangeText value={portfolioSummary.totalReturnPct} className="text-[11px]" />}
          />
        </div>
        <div className="space-y-1.5">
          {previewHoldings.map((row) => (
            <div key={row.ticker} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium">{row.ticker}</p>
                <p className="text-[9px] text-muted-foreground">{row.shares} sh</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] tabular-nums">{formatMoney(row.price)}</p>
                <ChangeText value={row.pnlPct} className="text-[9px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  )
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-white/5 px-1.5 py-1 ring-1 ring-white/8">
      <p className="text-[8px] text-muted-foreground">{label}</p>
      <div className="truncate text-[11px] font-medium tabular-nums">{value}</div>
    </div>
  )
}
