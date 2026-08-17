export type ScreeningStatus = "compliant" | "non_compliant" | "under_review"

export const currentUser = {
  name: "Amina Rahman",
  email: "amina@lincoln.edu",
  role: "Student",
  classroom: "AP Economics — Lincoln High",
  joinCode: "LXN-4K2P",
  initials: "AR",
  startedWith: 100_000,
}

export const portfolioSummary = {
  totalValue: 112_430.18,
  cash: 41_280.5,
  invested: 71_149.68,
  dayChange: 1_842.22,
  dayChangePct: 1.67,
  totalReturn: 12_430.18,
  totalReturnPct: 12.43,
}

export const performanceSeries = [
  100_000, 100_420, 99_810, 101_200, 102_640, 101_980, 104_110, 105_430,
  106_220, 108_040, 107_610, 109_880, 111_240, 112_430,
]

export const holdings = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    shares: 18,
    avgCost: 189.4,
    price: 214.62,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    shares: 8,
    avgCost: 412.1,
    price: 428.55,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    shares: 6,
    avgCost: 118.4,
    price: 131.22,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 10,
    avgCost: 168.2,
    price: 176.48,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "COST",
    name: "Costco Wholesale Corp.",
    shares: 4,
    avgCost: 872.0,
    price: 901.15,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "ADBE",
    name: "Adobe Inc.",
    shares: 5,
    avgCost: 498.3,
    price: 471.9,
    status: "compliant" as ScreeningStatus,
  },
]

export const trades = [
  {
    id: "t1",
    ticker: "AAPL",
    side: "buy" as const,
    quantity: 12,
    price: 189.4,
    executedAt: "Aug 11, 1:00 AM",
  },
  {
    id: "t2",
    ticker: "MSFT",
    side: "buy" as const,
    quantity: 8,
    price: 412.1,
    executedAt: "Aug 11, 1:05 AM",
  },
  {
    id: "t3",
    ticker: "AAPL",
    side: "sell" as const,
    quantity: 2,
    price: 191.25,
    executedAt: "Aug 11, 1:20 AM",
  },
  {
    id: "t4",
    ticker: "NVDA",
    side: "buy" as const,
    quantity: 6,
    price: 118.4,
    executedAt: "Aug 12, 10:14 AM",
  },
  {
    id: "t5",
    ticker: "GOOGL",
    side: "buy" as const,
    quantity: 10,
    price: 168.2,
    executedAt: "Aug 13, 9:02 AM",
  },
  {
    id: "t6",
    ticker: "ADBE",
    side: "buy" as const,
    quantity: 5,
    price: 498.3,
    executedAt: "Aug 14, 2:41 PM",
  },
  {
    id: "t7",
    ticker: "COST",
    side: "buy" as const,
    quantity: 4,
    price: 872.0,
    executedAt: "Aug 15, 11:18 AM",
  },
  {
    id: "t8",
    ticker: "AAPL",
    side: "buy" as const,
    quantity: 8,
    price: 208.9,
    executedAt: "Aug 16, 3:27 PM",
  },
]

export const watchlist = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 214.62,
    changePct: 1.24,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    price: 428.55,
    changePct: 0.62,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 131.22,
    changePct: -0.84,
    status: "compliant" as ScreeningStatus,
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 248.0,
    changePct: 2.11,
    status: "under_review" as ScreeningStatus,
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 186.4,
    changePct: 0.33,
    status: "under_review" as ScreeningStatus,
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 198.2,
    changePct: -0.41,
    status: "non_compliant" as ScreeningStatus,
  },
]

export const quotes: Record<
  string,
  {
    name: string
    price: number
    changePct: number
    open: number
    high: number
    low: number
    volume: string
    status: ScreeningStatus
  }
> = {
  AAPL: {
    name: "Apple Inc.",
    price: 214.62,
    changePct: 1.24,
    open: 211.4,
    high: 215.9,
    low: 210.8,
    volume: "48.2M",
    status: "compliant",
  },
  MSFT: {
    name: "Microsoft Corporation",
    price: 428.55,
    changePct: 0.62,
    open: 425.1,
    high: 430.0,
    low: 423.6,
    volume: "21.4M",
    status: "compliant",
  },
  NVDA: {
    name: "NVIDIA Corporation",
    price: 131.22,
    changePct: -0.84,
    open: 132.8,
    high: 133.4,
    low: 129.9,
    volume: "162.1M",
    status: "compliant",
  },
}

export const leaderboard = [
  { rank: 1, name: "Noah Patel", returnPct: 18.42, trades: 24, value: 118_420 },
  { rank: 2, name: "Sofia Alvarez", returnPct: 15.1, trades: 19, value: 115_100 },
  { rank: 3, name: "Amina Rahman", returnPct: 12.43, trades: 8, value: 112_430, isYou: true },
  { rank: 4, name: "Liam Chen", returnPct: 9.88, trades: 31, value: 109_880 },
  { rank: 5, name: "Maya Okonkwo", returnPct: 6.21, trades: 14, value: 106_210 },
  { rank: 6, name: "Jonas Berg", returnPct: 3.04, trades: 11, value: 103_040 },
  { rank: 7, name: "Priya Shah", returnPct: -1.12, trades: 22, value: 98_880 },
  { rank: 8, name: "Eli Ward", returnPct: -4.6, trades: 9, value: 95_400 },
]

export const lessons = [
  {
    id: "l1",
    title: "What makes an equity halal-screened?",
    track: "Foundations",
    minutes: 12,
    progress: 100,
  },
  {
    id: "l2",
    title: "Paper portfolios and buying power",
    track: "Trading",
    minutes: 8,
    progress: 100,
  },
  {
    id: "l3",
    title: "Reading a quote: last trade vs. close",
    track: "Trading",
    minutes: 10,
    progress: 40,
  },
  {
    id: "l4",
    title: "Diversification without haram sectors",
    track: "Strategy",
    minutes: 14,
    progress: 0,
  },
  {
    id: "l5",
    title: "Classroom contests and leaderboard rules",
    track: "Classroom",
    minutes: 6,
    progress: 0,
  },
  {
    id: "l6",
    title: "When a ticker is under review",
    track: "Foundations",
    minutes: 9,
    progress: 0,
  },
]

export const articles = [
  {
    title: "Why banks often fail screening",
    source: "MyrMint Learn",
    read: "4 min",
  },
  {
    title: "A simple checklist before you buy",
    source: "Educator notes",
    read: "3 min",
  },
  {
    title: "How join codes keep classrooms private",
    source: "Classroom guide",
    read: "2 min",
  },
]
