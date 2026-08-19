import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
import { QueryState } from "@/components/QueryState"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePortfolioQuery, useQuotesQuery, useStocksQuery } from "@/api/hooks"
import { formatMoney } from "@/lib/format"
import { formatWhen, isQuoteOk, toNumber } from "@/lib/numbers"
import { markedHoldings, STARTING_CASH } from "@/lib/portfolio"

export function PortfolioPage() {
  const portfolioQuery = usePortfolioQuery()
  const stocksQuery = useStocksQuery()
  const holdings = portfolioQuery.data?.holdings ?? []
  const quotesQuery = useQuotesQuery(holdings.map((row) => row.ticker))
  const stockMap = new Map(
    (stocksQuery.data?.stocks ?? []).map((row) => [row.ticker, row] as const),
  )
  const quoteMap = new Map(
    (quotesQuery.data?.quotes ?? [])
      .filter(isQuoteOk)
      .map((row) => [row.ticker, { price: row.price, changePct: row.changePct }] as const),
  )
  const enriched = markedHoldings(holdings, quoteMap, stockMap)
  const cash = toNumber(portfolioQuery.data?.cash_balance)
  const invested = enriched.reduce((sum, row) => sum + row.marketValue, 0)
  const totalValue = cash + invested
  const trades = portfolioQuery.data?.trades ?? []
  const totalInvested = invested || 1

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Portfolio"
        description="Holdings, cash, and realized paper trades."
      />

      <QueryState
        loading={portfolioQuery.isPending}
        error={portfolioQuery.error instanceof Error ? portfolioQuery.error.message : null}
      >
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total value</CardDescription>
              <CardTitle className="font-mono text-xl font-medium tracking-normal tabular-nums">
                {formatMoney(totalValue)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Invested</CardDescription>
              <CardTitle className="font-mono text-xl font-medium tracking-normal tabular-nums">
                {formatMoney(invested)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Cash</CardDescription>
              <CardTitle className="font-mono text-xl font-medium tracking-normal tabular-nums">
                {formatMoney(cash)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Unrealized P/L</CardDescription>
              <CardTitle className="font-mono text-xl tracking-normal">
                <ChangeText
                  value={enriched.reduce((sum, row) => sum + row.pnl, 0)}
                  asMoney
                />
              </CardTitle>
            </CardHeader>
          </Card>
        </section>
      </QueryState>

      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
          <CardDescription>
            Share of invested capital by ticker · vs {formatMoney(STARTING_CASH)} start
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {enriched.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open lots.</p>
          ) : (
            enriched.map((row) => {
              const pct = (row.marketValue / totalInvested) * 100
              return (
                <div key={row.ticker} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.ticker}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="holdings">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="history">Trade history</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings">
          <Card>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Screening</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg cost</TableHead>
                    <TableHead className="text-right">Last</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enriched.map((row) => (
                    <TableRow key={row.ticker}>
                      <TableCell>
                        <div className="font-medium">{row.ticker}</div>
                        <div className="text-xs text-muted-foreground">{row.name}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.shares}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.avg_cost)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.marketValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <ChangeText value={row.pnl} asMoney />
                        </div>
                        <ChangeText value={row.pnlPct} className="text-xs" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-0">
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
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-muted-foreground">
                        {formatWhen(trade.executed_at)}
                      </TableCell>
                      <TableCell className="font-medium">{trade.ticker}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            trade.side === "buy"
                              ? "bg-gain/15 text-gain border-transparent"
                              : "bg-loss/15 text-loss border-transparent"
                          }
                        >
                          {trade.side}
                        </Badge>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
