export type ScreeningStatus = "compliant" | "non_compliant" | "under_review"
export type UserRole = "student" | "educator" | "admin"
export type TradeSide = "buy" | "sell"
export type LeaderboardPeriod = "week" | "month" | "all"

export type Profile = {
  id: string
  role: UserRole
  display_name: string | null
  leaderboard_visible: boolean
  created_at: string
}

export type Trade = {
  id: string
  ticker: string
  side: TradeSide
  quantity: number | string
  price: number | string
  executed_at: string
}

export type Holding = {
  ticker: string
  shares: number
  avg_cost: number
}

export type Portfolio = {
  id: string
  student_id: string
  cash_balance: number | string
  created_at: string
}

export type PortfolioResponse = {
  portfolio: Portfolio
  trades: Trade[]
  holdings: Holding[]
  cash_balance: number
  invested_cost: number
  starting_cash: number
}

export type ScreeningData = {
  symbol?: string
  name?: string
  is_compliant?: boolean | null
  compliance_status?: string | null
  shariah_compliance_status?: string | null
  overall_status?: string | null
  revenue_breakdown?: Record<string, unknown>
  business_income?: Record<string, unknown>
  financial_ratios?: Record<string, unknown>
  purification_rate?: number | null
  methodologies?: Record<string, unknown>
  methodology_summary?: Record<string, unknown>
  [key: string]: unknown
}

export type HalalStock = {
  ticker: string
  company_name: string | null
  status: ScreeningStatus
  last_screened_at: string | null
  source?: "halal_terminal"
  screening?: ScreeningData | null
}

export type MarketQuote = {
  ticker: string
  price: number
  changePct: number | null
  open: number | null
  high: number | null
  low: number | null
  volume: number | null
  prevClose: number | null
}

export type QuoteResult =
  | MarketQuote
  | { ticker: string; error: string }

export type ScreeningResponse = {
  source: "halal_terminal"
  ticker: string
  company_name: string | null
  status: ScreeningStatus
  data: ScreeningData
}

export type ClassroomSummary = {
  id: string
  name: string
  join_code: string
  educator: { id: string; display_name: string } | null
  members: Array<{
    student_id: string
    display_name: string
    joined_at: string
  }>
}

export type LeaderboardRow = {
  rank: number
  student_id: string
  name: string
  hidden: boolean
  isYou: boolean
  value: number
  returnPct: number
  trades: number
}

export type LeaderboardResponse = {
  classroom: { id: string; name: string; join_code: string }
  period: LeaderboardPeriod
  rows: LeaderboardRow[]
}
