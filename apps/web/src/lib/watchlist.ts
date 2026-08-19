const keyFor = (userId: string) => `myrmint:watchlist:${userId}`

export function readWatchlist(userId: string): string[] {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export function writeWatchlist(userId: string, tickers: string[]) {
  localStorage.setItem(
    keyFor(userId),
    JSON.stringify([...new Set(tickers.map((t) => t.toUpperCase()))]),
  )
}

export function toggleWatchlist(userId: string, ticker: string): string[] {
  const current = readWatchlist(userId)
  const symbol = ticker.toUpperCase()
  const next = current.includes(symbol)
    ? current.filter((item) => item !== symbol)
    : [...current, symbol]
  writeWatchlist(userId, next)
  return next
}
