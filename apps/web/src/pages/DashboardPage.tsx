import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
import { Sparkline } from "@/components/Sparkline"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
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
import {
  currentUser,
  performanceSeries,
  portfolioSummary,
  trades,
  watchlist,
} from "@/data/mock"
import { formatMoney } from "@/lib/format"

export function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Overview"
        description={`${currentUser.name} · ${currentUser.classroom}`}
        actions={
          <Button render={<Link to="/trade" />}>Place a trade</Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Portfolio value"
          value={formatMoney(portfolioSummary.totalValue)}
        />
        <StatCard
          label="Today"
          value={
            <ChangeText value={portfolioSummary.dayChange} asMoney />
          }
          hint={<ChangeText value={portfolioSummary.dayChangePct} />}
        />
        <StatCard label="Cash" value={formatMoney(portfolioSummary.cash)} />
        <StatCard
          label="Total return"
          value={<ChangeText value={portfolioSummary.totalReturn} asMoney />}
          hint={<ChangeText value={portfolioSummary.totalReturnPct} />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Last 14 sessions · starting cash $100,000</CardDescription>
          </CardHeader>
          <CardContent>
            <Sparkline data={performanceSeries} className="h-40 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Halal screening status is shown per ticker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {watchlist.slice(0, 5).map((row) => (
              <div key={row.ticker} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono font-medium tracking-wide">{row.ticker}</p>
                  <p className="text-xs text-muted-foreground">{row.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono tabular-nums">{formatMoney(row.price)}</p>
                  <ChangeText value={row.changePct} className="text-xs" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent trades</CardTitle>
            <CardDescription>Filled against last-trade quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.slice(0, 5).map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.ticker}</TableCell>
                    <TableCell>
                      <span
                        className={
                          trade.side === "buy" ? "text-gain" : "text-loss"
                        }
                      >
                        {trade.side.toUpperCase()}
                      </span>
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

        <Card>
          <CardHeader>
            <CardTitle>Classroom</CardTitle>
            <CardDescription>{currentUser.classroom}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-border bg-muted/60 p-3">
              <p className="kicker">Join code</p>
              <p className="mt-1 font-mono text-sm font-medium tracking-[0.22em]">
                {currentUser.joinCode}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You are ranked #3 of 8 this month. Only compliant tickers can be
              traded in this classroom.
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="compliant" />
              <Button variant="outline" size="sm" render={<Link to="/leaderboard" />}>
                View leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-mono text-xl font-medium tracking-normal tabular-nums">
          {value}
        </CardTitle>
        {hint ? <div className="font-mono text-xs">{hint}</div> : null}
      </CardHeader>
    </Card>
  )
}
