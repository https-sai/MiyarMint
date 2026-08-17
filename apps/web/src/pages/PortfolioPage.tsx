import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
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
import { holdings, portfolioSummary, trades } from "@/data/mock"
import { formatMoney } from "@/lib/format"

const enrichedHoldings = holdings.map((row) => {
  const marketValue = row.shares * row.price
  const cost = row.shares * row.avgCost
  const pnl = marketValue - cost
  const pnlPct = (pnl / cost) * 100
  return { ...row, marketValue, pnl, pnlPct }
})

const totalInvested = enrichedHoldings.reduce((sum, row) => sum + row.marketValue, 0)

export function PortfolioPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Portfolio"
        description="Holdings, cash, and realized paper trades."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total value</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatMoney(portfolioSummary.totalValue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Invested</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatMoney(portfolioSummary.invested)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cash</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatMoney(portfolioSummary.cash)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unrealized P/L</CardDescription>
            <CardTitle className="text-xl">
              <ChangeText
                value={enrichedHoldings.reduce((sum, row) => sum + row.pnl, 0)}
                asMoney
              />
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
          <CardDescription>Share of invested capital by ticker</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {enrichedHoldings.map((row) => {
            const pct = (row.marketValue / totalInvested) * 100
            return (
              <div key={row.ticker} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.ticker}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
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
                  {enrichedHoldings.map((row) => (
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
                        {formatMoney(row.avgCost)}
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
                        {trade.executedAt}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
