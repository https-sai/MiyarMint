import { useMemo, useState } from "react"

import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
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
import { holdings, portfolioSummary, quotes, trades } from "@/data/mock"
import { formatMoney } from "@/lib/format"

export function TradePage() {
  const [ticker, setTicker] = useState("AAPL")
  const [quantity, setQuantity] = useState("1")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [notice, setNotice] = useState<string | null>(null)

  const quote = quotes[ticker.toUpperCase()] ?? quotes.AAPL
  const estimated = useMemo(() => {
    const qty = Number(quantity) || 0
    return qty * quote.price
  }, [quantity, quote.price])

  const canTrade = quote.status === "compliant"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Trade"
        description="Orders fill at the last-trade quote. Only compliant tickers can be traded."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order ticket</CardTitle>
            <CardDescription>Paper buy or sell · no live routing</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                setNotice(
                  `${side.toUpperCase()} ${quantity} ${ticker.toUpperCase()} queued at ${formatMoney(quote.price)}`,
                )
              }}
            >
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
                  onValueChange={(value) => setSide(value as "buy" | "sell")}
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
                <span className="text-muted-foreground">Estimated</span>
                <span className="tabular-nums">{formatMoney(estimated)}</span>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!canTrade}
                variant={side === "sell" ? "destructive" : "default"}
              >
                {canTrade
                  ? `${side === "buy" ? "Buy" : "Sell"} ${ticker.toUpperCase()}`
                  : "Blocked — not compliant"}
              </Button>
              {notice ? (
                <p className="text-sm text-primary">{notice}</p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {quote.name}{" "}
                <span className="text-muted-foreground">({ticker.toUpperCase() || "AAPL"})</span>
              </CardTitle>
              <CardDescription>Last trade quote</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-3xl font-medium tabular-nums">
                  {formatMoney(quote.price)}
                </p>
                <ChangeText value={quote.changePct} />
              </div>
              <div className="space-y-1 text-sm">
                <Row label="Open" value={formatMoney(quote.open)} />
                <Row label="High" value={formatMoney(quote.high)} />
                <Row label="Low" value={formatMoney(quote.low)} />
                <Row label="Volume" value={quote.volume} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <StatusBadge status={quote.status} />
                <p className="text-sm text-muted-foreground">
                  Buying power {formatMoney(portfolioSummary.cash)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open lots</CardTitle>
              <CardDescription>From your paper holdings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {holdings.map((row) => (
                <Button
                  key={row.ticker}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTicker(row.ticker)}
                >
                  {row.ticker} · {row.shares}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

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
                    {trade.executedAt}
                  </TableCell>
                  <TableCell className="font-medium">{trade.ticker}</TableCell>
                  <TableCell
                    className={trade.side === "buy" ? "text-gain" : "text-loss"}
                  >
                    {trade.side.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {trade.quantity}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(trade.price)}
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
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
