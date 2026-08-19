import { Search } from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"

import type { ScreeningStatus } from "@/api/types"
import {
  usePlaceTradeMutation,
  usePortfolioQuery,
  useQuoteQuery,
  useScreeningQuery,
  useStocksQuery,
} from "@/api/hooks"
import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
import { ComplianceDetails } from "@/components/ComplianceDetails"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/auth/AuthContext"
import { useWatchlist } from "@/lib/desk"
import { formatMoney } from "@/lib/format"
import { formatVolume, formatWhen, toNumber } from "@/lib/numbers"
import { readPreferences } from "@/lib/preferences"
import { tradeSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"

export function TradePage() {
  const { user } = useAuth()
  const [ticker, setTicker] = useState("AAPL")
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [quantity, setQuantity] = useState("1")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [notice, setNotice] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const symbol = ticker.trim().toUpperCase()
  const stocksQuery = useStocksQuery()
  const stocks = useMemo(
    () => stocksQuery.data?.stocks ?? [],
    [stocksQuery.data?.stocks],
  )
  const fallbackWatch = stocks
    .filter((row) => row.status === "compliant")
    .slice(0, 8)
    .map((row) => row.ticker)
  const { tickers: watchTickers, setWatchlist } = useWatchlist(fallbackWatch)
  const portfolioQuery = usePortfolioQuery()
  const quoteQuery = useQuoteQuery(symbol)
  const screeningQuery = useScreeningQuery(symbol)
  const placeTrade = usePlaceTradeMutation()

  const stock = stocks.find((row) => row.ticker === symbol)
  const status: ScreeningStatus | null =
    screeningQuery.data?.status ?? stock?.status ?? null
  const quote = quoteQuery.data
  const cash = toNumber(portfolioQuery.data?.cash_balance)
  const holdings = portfolioQuery.data?.holdings ?? []
  const trades = portfolioQuery.data?.trades ?? []
  const estimated = useMemo(() => {
    const qty = Number(quantity) || 0
    return qty * (quote?.price ?? 0)
  }, [quantity, quote?.price])

  const canTrade = status === "compliant" && Boolean(quote?.price)
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return stocks.filter(
      (row) =>
        row.ticker.toLowerCase().includes(needle) ||
        (row.company_name ?? "").toLowerCase().includes(needle),
    )
  }, [query, stocks])

  function selectTicker(next: string) {
    setTicker(next)
    setQuery("")
    setSearchOpen(false)
    setNotice(null)
    setFormError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = tradeSchema.safeParse({ ticker: symbol, side, quantity })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid order.")
      return
    }
    setFormError(null)
    setNotice(null)
    try {
      const result = await placeTrade.mutateAsync(parsed.data)
      const confirmations = user?.id
        ? readPreferences(user.id).tradeConfirmations
        : true
      if (confirmations) {
        setNotice(
          `${result.trade.side.toUpperCase()} ${result.trade.quantity} ${result.trade.ticker} filled at ${formatMoney(toNumber(result.trade.price))}`,
        )
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Trade failed.")
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Trade"
        description="Orders fill at the Halal Terminal quote. Only compliant tickers can be traded."
        actions={
          <div className="text-right">
            <p className="kicker">Available balance</p>
            <p className="font-mono text-lg font-medium tracking-normal tabular-nums">
              {formatMoney(cash)}
            </p>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Search stocks</CardTitle>
          <CardDescription>
            Look up a ticker or company name, then load it into the ticket
          </CardDescription>
        </CardHeader>
        <CardContent
          className="space-y-3"
          onBlur={(event) => {
            const next = event.relatedTarget
            if (next instanceof Node && event.currentTarget.contains(next)) return
            setSearchOpen(false)
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="stock-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false)
              }}
              placeholder="Search ticker or name — AAPL, Microsoft…"
              className="h-10 pl-9"
              autoComplete="off"
              aria-label="Search stocks"
              aria-expanded={searchOpen && Boolean(query.trim())}
            />
          </div>

          {searchOpen && query.trim() ? (
            <div className="divide-y divide-border border border-border">
              {stocksQuery.isPending ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">Loading names…</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  No names matched “{query.trim()}”.
                </p>
              ) : (
                results.map((row) => (
                  <button
                    key={row.ticker}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectTicker(row.ticker)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60",
                      row.ticker === symbol && "bg-primary/10",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-medium tracking-wide">
                        {row.ticker}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.company_name ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={row.status} />
                  </button>
                ))
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order ticket</CardTitle>
            <CardDescription>Paper buy or sell · no live routing</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(event) => setTicker(event.target.value.toUpperCase())}
                  className="h-10 uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Side</Label>
                <Tabs
                  value={side}
                  onValueChange={(value) => {
                    if (value === "buy" || value === "sell") setSide(value)
                  }}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="buy" className="flex-1">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="flex-1">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available balance</span>
                <span className="tabular-nums">{formatMoney(cash)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated</span>
                <span className="tabular-nums">{formatMoney(estimated)}</span>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!canTrade || placeTrade.isPending}
                variant={side === "sell" ? "destructive" : "default"}
              >
                {status && status !== "compliant"
                  ? "Blocked — not compliant"
                  : `${side === "buy" ? "Buy" : "Sell"} ${symbol || "—"}`}
              </Button>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              {notice ? <p className="text-sm text-primary">{notice}</p> : null}
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {stock?.company_name ?? (symbol || "Select a ticker")}{" "}
                {symbol ? (
                  <span className="text-muted-foreground">({symbol})</span>
                ) : null}
              </CardTitle>
              <CardDescription>Halal Terminal quote</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-mono text-3xl font-medium tracking-normal tabular-nums">
                  {quote ? formatMoney(quote.price) : "—"}
                </p>
                {quote?.changePct != null ? (
                  <ChangeText value={quote.changePct} />
                ) : (
                  <p className="text-sm text-muted-foreground">Change unavailable</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <Row label="Open" value={quote?.open != null ? formatMoney(quote.open) : "—"} />
                <Row label="High" value={quote?.high != null ? formatMoney(quote.high) : "—"} />
                <Row label="Low" value={quote?.low != null ? formatMoney(quote.low) : "—"} />
                <Row label="Volume" value={formatVolume(quote?.volume ?? null)} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                {status ? <StatusBadge status={status} /> : null}
                <p className="text-sm text-muted-foreground">
                  Available balance {formatMoney(cash)}
                </p>
                {symbol ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = watchTickers.includes(symbol)
                        ? watchTickers.filter((item) => item !== symbol)
                        : [...watchTickers, symbol]
                      setWatchlist(next)
                    }}
                  >
                    {watchTickers.includes(symbol) ? "Remove from watchlist" : "Add to watchlist"}
                  </Button>
                ) : null}
              </div>
              {symbol ? (
                <div className="sm:col-span-2 border-t border-border pt-4">
                  <p className="kicker mb-3">Halal Terminal screening</p>
                  <ComplianceDetails
                    status={status}
                    data={screeningQuery.data?.data ?? stock?.screening}
                    loading={screeningQuery.isPending}
                    error={
                      screeningQuery.error instanceof Error
                        ? screeningQuery.error.message
                        : null
                    }
                  />
                </div>
              ) : null}
              {quoteQuery.error instanceof Error ? (
                <p className="sm:col-span-2 text-sm text-destructive">
                  {quoteQuery.error.message}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open lots</CardTitle>
              <CardDescription>From your paper holdings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {holdings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open lots.</p>
              ) : (
                holdings.map((row) => (
                  <Button
                    key={row.ticker}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectTicker(row.ticker)}
                  >
                    {row.ticker} · {row.shares}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Halal screening status is shown per ticker</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchTickers.map((item) => {
                const row = stocks.find((stockRow) => stockRow.ticker === item)
                return (
                  <TableRow
                    key={item}
                    className={cn(
                      "cursor-pointer",
                      item === symbol && "bg-primary/5",
                    )}
                    onClick={() => selectTicker(item)}
                  >
                    <TableCell className="font-mono font-medium tracking-wide">
                      {item}
                    </TableCell>
                    <TableCell>{row?.company_name ?? "—"}</TableCell>
                    <TableCell>
                      {row ? <StatusBadge status={row.status} /> : "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.slice(0, 6).map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="text-muted-foreground">
                    {formatWhen(trade.executed_at)}
                  </TableCell>
                  <TableCell className="font-medium">{trade.ticker}</TableCell>
                  <TableCell
                    className={trade.side === "buy" ? "text-gain" : "text-loss"}
                  >
                    {trade.side.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {toNumber(trade.quantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(toNumber(trade.price))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-xs">
      <span className="tracking-[0.12em] text-muted-foreground uppercase">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
