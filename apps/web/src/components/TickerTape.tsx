import { useQuotesQuery, useStocksQuery } from "@/api/hooks"
import { ChangeText } from "@/components/ChangeText"
import { useWatchlist } from "@/lib/desk"
import { formatMoney } from "@/lib/format"
import { isQuoteOk } from "@/lib/numbers"

export function TickerTape() {
  const stocksQuery = useStocksQuery()
  const fallback = (stocksQuery.data?.stocks ?? [])
    .filter((row) => row.status === "compliant")
    .slice(0, 8)
    .map((row) => row.ticker)
  const { tickers } = useWatchlist(fallback)
  const quotesQuery = useQuotesQuery(tickers)
  const quotes = new Map(
    (quotesQuery.data?.quotes ?? [])
      .filter(isQuoteOk)
      .map((row) => [row.ticker, row] as const),
  )
  const items = tickers.length > 0 ? [...tickers, ...tickers] : []

  if (items.length === 0) {
    return (
      <div className="border-b border-sidebar-border bg-sidebar px-4 py-1.5 font-mono text-[11px] text-muted-foreground">
        Tape idle
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden border-b border-sidebar-border bg-sidebar">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-sidebar to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-sidebar to-transparent" />
      <div className="animate-ticker flex w-max gap-8 py-1.5 pr-8">
        {items.map((ticker, index) => {
          const quote = quotes.get(ticker)
          return (
            <span
              key={`${ticker}-${index}`}
              className="flex items-baseline gap-2 font-mono text-[11px] tabular-nums"
            >
              <span className="font-medium tracking-wide">{ticker}</span>
              <span className="text-muted-foreground">
                {quote ? formatMoney(quote.price) : "—"}
              </span>
              {quote?.changePct != null ? (
                <ChangeText value={quote.changePct} className="text-[11px]" />
              ) : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}
