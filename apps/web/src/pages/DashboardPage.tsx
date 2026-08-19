import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { useLeaderboardQuery, usePortfolioQuery, useQuotesQuery, useStocksQuery } from "@/api/hooks"
import { useAuth } from "@/auth/AuthContext"
import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
import { QueryState } from "@/components/QueryState"
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
import { useActiveClassroom, useWatchlist } from "@/lib/desk"
import { formatMoney } from "@/lib/format"
import { getLearningProgress } from "@/lib/learn"
import { formatWhen, isQuoteOk, toNumber } from "@/lib/numbers"
import { equityCurve, markedHoldings, STARTING_CASH } from "@/lib/portfolio"

export function DashboardPage() {
  const { user, profile } = useAuth()
  const { active } = useActiveClassroom()
  const leaderboardQuery = useLeaderboardQuery(active?.id ?? null, "month")
  const ranks = leaderboardQuery.data?.rows ?? []
  const you = ranks.find((row) => row.isYou)
  const learn = getLearningProgress()
  const portfolioQuery = usePortfolioQuery()
  const stocksQuery = useStocksQuery()
  const stocks = stocksQuery.data?.stocks ?? []
  const fallbackWatch = stocks
    .filter((row) => row.status === "compliant")
    .slice(0, 6)
    .map((row) => row.ticker)
  const { tickers: watchTickers } = useWatchlist(fallbackWatch)
  const quotesQuery = useQuotesQuery(watchTickers)
  const holdingTickers = (portfolioQuery.data?.holdings ?? []).map((row) => row.ticker)
  const holdingQuotesQuery = useQuotesQuery(holdingTickers)

  const quotes = new Map(
    (quotesQuery.data?.quotes ?? [])
      .filter(isQuoteOk)
      .map((row) => [row.ticker, row] as const),
  )
  const holdingQuotes = new Map(
    (holdingQuotesQuery.data?.quotes ?? [])
      .filter(isQuoteOk)
      .map((row) => [row.ticker, { price: row.price, changePct: row.changePct }] as const),
  )
  const stockMap = new Map(stocks.map((row) => [row.ticker, row] as const))
  const holdings = markedHoldings(
    portfolioQuery.data?.holdings ?? [],
    holdingQuotes,
    stockMap,
  )
  const cash = toNumber(portfolioQuery.data?.cash_balance)
  const invested = holdings.reduce((sum, row) => sum + row.marketValue, 0)
  const totalValue = cash + invested
  const totalReturn = totalValue - STARTING_CASH
  const totalReturnPct = (totalReturn / STARTING_CASH) * 100
  const series = equityCurve(portfolioQuery.data?.trades ?? [])
  const name = profile?.display_name ?? user?.email ?? "Desk"
  const trades = portfolioQuery.data?.trades ?? []

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Overview"
        description={`${name}${active ? ` · ${active.name}` : ""}`}
        actions={
          <Button render={<Link to="/trade" />}>Place a trade</Button>
        }
      />

      <QueryState
        loading={portfolioQuery.isPending}
        error={portfolioQuery.error instanceof Error ? portfolioQuery.error.message : null}
      >
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Portfolio value" value={formatMoney(totalValue)} />
          <StatCard
            label="Unrealized P/L"
            value={
              <ChangeText
                value={holdings.reduce((sum, row) => sum + row.pnl, 0)}
                asMoney
              />
            }
          />
          <StatCard label="Cash" value={formatMoney(cash)} />
          <StatCard
            label="Total return"
            value={<ChangeText value={totalReturn} asMoney />}
            hint={<ChangeText value={totalReturnPct} />}
          />
        </section>
      </QueryState>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Classroom rank</CardTitle>
            <CardDescription>{active?.name ?? "No classroom joined"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!active ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Join a classroom from Account to appear on the board.
                </p>
                <Button variant="outline" size="sm" render={<Link to="/account" />}>
                  Join classroom
                </Button>
              </div>
            ) : leaderboardQuery.isPending ? (
              <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Loading rank
              </p>
            ) : you ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-3xl font-medium tracking-normal tabular-nums">
                      #{you.rank}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {ranks.length} this month
                    </p>
                  </div>
                  <ChangeText value={you.returnPct} className="text-base" />
                </div>
                <div className="space-y-2">
                  {ranks.slice(0, 3).map((row) => (
                    <div
                      key={row.student_id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className={row.isYou ? "font-medium" : "text-muted-foreground"}>
                        #{row.rank} {row.name}
                        {row.isYou ? " (you)" : ""}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatMoney(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" render={<Link to="/leaderboard" />}>
                  View leaderboard
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No ranks yet for this classroom.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learn</CardTitle>
            <CardDescription>
              {learn.currentUnit
                ? `Unit ${learn.currentUnit.number} · ${learn.currentUnit.title}`
                : "Follow the path"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-950 uppercase shadow-[0_3px_0_#b45309]">
                {learn.earnedXp} XP
              </span>
              <span className="rounded-full bg-teal-400 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-teal-950 uppercase shadow-[0_3px_0_#0f766e]">
                {learn.completed}/{learn.total}
              </span>
            </div>
            {learn.currentNode ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{learn.currentNode.title}</p>
                <div className="h-1.5 overflow-hidden bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${learn.currentNode.progress ?? learn.pct}%` }}
                  />
                </div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {learn.currentNode.progress ?? 0}% of this step · {learn.pct}% of path
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Path complete.</p>
            )}
            <Button size="sm" render={<Link to="/learn" />}>
              Continue learning
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>
              Book value after each fill · starting cash {formatMoney(STARTING_CASH)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {series.length > 1 ? (
              <Sparkline data={series} className="h-40 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                Place a trade to start the tape.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Halal screening status is shown per ticker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QueryState
              loading={stocksQuery.isPending || quotesQuery.isPending}
              empty={watchTickers.length === 0 ? "No watchlist names yet." : null}
            >
              {watchTickers.slice(0, 5).map((ticker) => {
                const stock = stockMap.get(ticker)
                const quote = quotes.get(ticker)
                return (
                  <div key={ticker} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono font-medium tracking-wide">{ticker}</p>
                      <p className="text-xs text-muted-foreground">
                        {stock?.company_name ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono tabular-nums">
                        {quote ? formatMoney(quote.price) : "—"}
                      </p>
                      {quote?.changePct != null ? (
                        <ChangeText value={quote.changePct} className="text-xs" />
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </QueryState>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent trades</CardTitle>
            <CardDescription>Filled against Halal Terminal quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <QueryState empty={trades.length === 0 ? "No fills yet." : null}>
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
                  {trades.slice(0, 5).map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-muted-foreground">
                        {formatWhen(trade.executed_at)}
                      </TableCell>
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
                        {toNumber(trade.quantity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(toNumber(trade.price))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classroom</CardTitle>
            <CardDescription>{active?.name ?? "No classroom joined"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {active ? (
              <>
                <div className="border border-border bg-muted/60 p-3">
                  <p className="kicker">Join code</p>
                  <p className="mt-1 font-mono text-sm font-medium tracking-[0.22em]">
                    {active.join_code}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {active.members.length} member{active.members.length === 1 ? "" : "s"}.
                  Only compliant tickers can be traded.
                </p>
                <StatusBadge status="compliant" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Join a classroom from Account to trade with classmates.
              </p>
            )}
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
