import { supabase } from "@/api/supabase"
import { getApiUrl } from "@/lib/env"
import type {
  ClassroomSummary,
  HalalStock,
  LeaderboardPeriod,
  LeaderboardResponse,
  MarketQuote,
  PortfolioResponse,
  Profile,
  QuoteResult,
  ScreeningResponse,
  Trade,
  TradeSide,
} from "@/api/types"

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("Not signed in")
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  })
  const body = (await res.json().catch(() => ({}))) as {
    error?: string
  } & T
  if (!res.ok) {
    const message =
      typeof body?.error === "string" ? body.error : `Request failed (${res.status})`
    throw new Error(message)
  }
  return body
}

export function getMe() {
  return apiFetch<{ profile: Profile }>("/profiles/me")
}

export function updateMe(input: {
  display_name?: string
  leaderboard_visible?: boolean
}) {
  return apiFetch<{ profile: Profile }>("/profiles/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function getPortfolio(studentId: string) {
  return apiFetch<PortfolioResponse>(`/portfolios/${studentId}`)
}

export function getHalalStocks() {
  return apiFetch<{ stocks: HalalStock[] }>("/stocks")
}

export function getQuote(ticker: string) {
  return apiFetch<MarketQuote>(`/market/quote/${encodeURIComponent(ticker)}`)
}

export function getQuotes(tickers: string[]) {
  const list = [...new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean))]
  if (list.length === 0) {
    return Promise.resolve({ quotes: [] as QuoteResult[] })
  }
  return apiFetch<{ quotes: QuoteResult[] }>(
    `/market/quotes?tickers=${encodeURIComponent(list.join(","))}`,
  )
}

export function getScreening(ticker: string) {
  return apiFetch<ScreeningResponse>(`/screening/${encodeURIComponent(ticker)}`)
}

export function placeTrade(input: {
  ticker: string
  side: TradeSide
  quantity: number
}) {
  return apiFetch<{
    trade: Trade
    cash_balance: number
  }>("/trades", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function getMyClassrooms() {
  return apiFetch<{ classrooms: ClassroomSummary[] }>("/classrooms/mine")
}

export function joinClassroom(joinCode: string) {
  return apiFetch<{ classroom: { id: string; name: string; join_code: string } }>(
    "/classrooms/join",
    {
      method: "POST",
      body: JSON.stringify({ joinCode }),
    },
  )
}

export function createClassroom(name: string) {
  return apiFetch<{
    id: string
    name: string
    join_code: string
    educator_id: string
    created_at: string
  }>("/classrooms", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export function leaveClassroom(classroomId: string) {
  return apiFetch<{ ok: boolean }>(`/classrooms/${classroomId}/members/me`, {
    method: "DELETE",
  })
}

export function getLeaderboard(classroomId: string, period: LeaderboardPeriod) {
  return apiFetch<LeaderboardResponse>(
    `/classrooms/${classroomId}/leaderboard?period=${period}`,
  )
}
