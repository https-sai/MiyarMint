import { useState } from "react"
import { Link } from "react-router-dom"

import type { LeaderboardPeriod } from "@/api/types"
import { useLeaderboardQuery } from "@/api/hooks"
import { ChangeText } from "@/components/ChangeText"
import { PageHeader } from "@/components/PageHeader"
import { QueryState } from "@/components/QueryState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useActiveClassroom } from "@/lib/desk"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function LeaderboardPage() {
  const { active } = useActiveClassroom()
  const [period, setPeriod] = useState<LeaderboardPeriod>("month")
  const query = useLeaderboardQuery(active?.id ?? null, period)
  const rows = query.data?.rows ?? []
  const you = rows.find((row) => row.isYou)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Leaderboard"
        description={active?.name ?? "Join a classroom to rank"}
        actions={
          <Select
            value={period}
            onValueChange={(value) => {
              if (value === "week" || value === "month" || value === "all") {
                setPeriod(value)
              }
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {!active ? (
        <Card>
          <CardHeader>
            <CardTitle>No classroom</CardTitle>
            <CardDescription>
              Join a classroom from Account to see ranks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link to="/account" />}>
              Open account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <QueryState
          loading={query.isPending}
          error={query.error instanceof Error ? query.error.message : null}
          empty={rows.length === 0 ? "No members to rank yet." : null}
        >
          {you ? (
            <Card className="border-primary/30">
              <CardHeader>
                <CardDescription>Your standing</CardDescription>
                <CardTitle className="flex flex-wrap items-baseline gap-3 font-mono tracking-normal">
                  Rank #{you.rank}
                  <ChangeText value={you.returnPct} className="text-base font-normal" />
                </CardTitle>
              </CardHeader>
            </Card>
          ) : null}

          <section className="grid gap-4 md:grid-cols-3">
            {rows.slice(0, 3).map((row) => (
              <Card
                key={row.student_id}
                className={cn(row.rank === 1 && "ring-1 ring-primary/40")}
              >
                <CardHeader>
                  <CardDescription>#{row.rank}</CardDescription>
                  <CardTitle>{row.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <ChangeText value={row.returnPct} />
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatMoney(row.value)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Classroom ranks</CardTitle>
              <CardDescription>Return vs. $100,000 starting cash</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.student_id}
                      className={row.isYou ? "bg-primary/5" : undefined}
                    >
                      <TableCell className="tabular-nums">{row.rank}</TableCell>
                      <TableCell className="font-medium">
                        {row.name}
                        {row.isYou ? (
                          <Badge className="ml-2" variant="secondary">
                            You
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <ChangeText value={row.returnPct} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.trades}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </QueryState>
      )}
    </div>
  )
}
