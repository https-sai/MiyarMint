import type { HalalStock, Holding, MarketQuote, Trade } from "@/api/types"
import { toNumber } from "@/lib/numbers"

export const STARTING_CASH = 100_000

export function equityCurve(trades: Trade[], startingCash = STARTING_CASH): number[] {
  const sorted = [...trades].sort((a, b) =>
    a.executed_at.localeCompare(b.executed_at),
  )
  let cash = startingCash
  const lots = new Map<string, { shares: number; cost: number }>()
  const last = new Map<string, number>()
  const points = [startingCash]

  for (const trade of sorted) {
    const qty = toNumber(trade.quantity)
    const price = toNumber(trade.price)
    last.set(trade.ticker, price)
    const lot = lots.get(trade.ticker) ?? { shares: 0, cost: 0 }
    if (trade.side === "buy") {
      cash -= qty * price
      lot.shares += qty
      lot.cost += qty * price
    } else {
      cash += qty * price
      const avg = lot.shares > 0 ? lot.cost / lot.shares : 0
      lot.shares = Math.max(0, lot.shares - qty)
      lot.cost = lot.shares * avg
    }
    lots.set(trade.ticker, lot)

    let invested = 0
    for (const [ticker, row] of lots) {
      invested += row.shares * (last.get(ticker) ?? 0)
    }
    points.push(cash + invested)
  }

  return points
}

export function markedHoldings(
  holdings: Holding[],
  quotes: Map<string, Pick<MarketQuote, "price" | "changePct">>,
  stocks: Map<string, Pick<HalalStock, "company_name" | "status">>,
) {
  return holdings.map((row) => {
    const quote = quotes.get(row.ticker)
    const stock = stocks.get(row.ticker)
    const price = quote?.price ?? row.avg_cost
    const marketValue = row.shares * price
    const cost = row.shares * row.avg_cost
    const pnl = marketValue - cost
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
    return {
      ...row,
      name: stock?.company_name ?? row.ticker,
      status: stock?.status ?? "under_review",
      price,
      changePct: quote?.changePct ?? null,
      marketValue,
      cost,
      pnl,
      pnlPct,
    }
  })
}
