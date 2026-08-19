import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createClassroom,
  getHalalStocks,
  getLeaderboard,
  getMyClassrooms,
  getPortfolio,
  getQuote,
  getQuotes,
  getScreening,
  joinClassroom,
  leaveClassroom,
  placeTrade,
  updateMe,
} from "@/api/client"
import type { LeaderboardPeriod, TradeSide } from "@/api/types"
import { useAuth } from "@/auth/AuthContext"

export const queryKeys = {
  portfolio: (studentId: string) => ["portfolio", studentId] as const,
  stocks: ["stocks"] as const,
  quote: (ticker: string) => ["quote", ticker] as const,
  quotes: (tickers: string[]) => ["quotes", ...tickers] as const,
  screening: (ticker: string) => ["screening", ticker] as const,
  classrooms: ["classrooms"] as const,
  leaderboard: (classroomId: string, period: LeaderboardPeriod) =>
    ["leaderboard", classroomId, period] as const,
}

export function usePortfolioQuery() {
  const { user } = useAuth()
  return useQuery({
    queryKey: queryKeys.portfolio(user?.id ?? ""),
    queryFn: () => getPortfolio(user!.id),
    enabled: Boolean(user?.id),
  })
}

export function useStocksQuery() {
  return useQuery({
    queryKey: queryKeys.stocks,
    queryFn: getHalalStocks,
  })
}

export function useQuoteQuery(ticker: string) {
  const symbol = ticker.trim().toUpperCase()
  return useQuery({
    queryKey: queryKeys.quote(symbol),
    queryFn: () => getQuote(symbol),
    enabled: symbol.length > 0,
  })
}

export function useQuotesQuery(tickers: string[]) {
  const list = [...new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean))]
  return useQuery({
    queryKey: queryKeys.quotes(list),
    queryFn: () => getQuotes(list),
    enabled: list.length > 0,
  })
}

export function useScreeningQuery(ticker: string) {
  const symbol = ticker.trim().toUpperCase()
  return useQuery({
    queryKey: queryKeys.screening(symbol),
    queryFn: () => getScreening(symbol),
    enabled: symbol.length > 0,
  })
}

export function useClassroomsQuery() {
  return useQuery({
    queryKey: queryKeys.classrooms,
    queryFn: getMyClassrooms,
  })
}

export function useLeaderboardQuery(
  classroomId: string | null,
  period: LeaderboardPeriod,
) {
  return useQuery({
    queryKey: queryKeys.leaderboard(classroomId ?? "", period),
    queryFn: () => getLeaderboard(classroomId!, period),
    enabled: Boolean(classroomId),
  })
}

export function usePlaceTradeMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: { ticker: string; side: TradeSide; quantity: number }) =>
      placeTrade(input),
    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(user.id) })
      }
    },
  })
}

export function useJoinClassroomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (joinCode: string) => joinClassroom(joinCode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.classrooms })
    },
  })
}

export function useCreateClassroomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createClassroom(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.classrooms })
    },
  })
}

export function useLeaveClassroomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (classroomId: string) => leaveClassroom(classroomId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.classrooms })
    },
  })
}

export function useUpdateProfileMutation() {
  const { refreshProfile } = useAuth()
  return useMutation({
    mutationFn: updateMe,
    onSuccess: async () => {
      await refreshProfile()
    },
  })
}
