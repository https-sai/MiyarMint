import { toNumber } from "./numbers.js";

export type TradeLot = {
  ticker: string;
  side: "buy" | "sell";
  quantity: number | string;
  price: number | string;
};

export type Holding = {
  ticker: string;
  shares: number;
  avg_cost: number;
};

export function aggregateHoldings(trades: TradeLot[]): Holding[] {
  const lots = new Map<string, { shares: number; cost: number }>();

  for (const trade of trades) {
    const qty = toNumber(trade.quantity);
    const price = toNumber(trade.price);
    if (!trade.ticker || qty <= 0) continue;

    const current = lots.get(trade.ticker) ?? { shares: 0, cost: 0 };
    if (trade.side === "buy") {
      current.shares += qty;
      current.cost += qty * price;
    } else {
      const avg = current.shares > 0 ? current.cost / current.shares : 0;
      current.shares = Math.max(0, current.shares - qty);
      current.cost = current.shares * avg;
    }
    lots.set(trade.ticker, current);
  }

  return [...lots.entries()]
    .filter(([, lot]) => lot.shares > 1e-8)
    .map(([ticker, lot]) => ({
      ticker,
      shares: lot.shares,
      avg_cost: lot.shares > 0 ? lot.cost / lot.shares : 0,
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function sharesForTicker(holdings: Holding[], ticker: string): number {
  const lot = holdings.find((row) => row.ticker === ticker);
  return lot?.shares ?? 0;
}
