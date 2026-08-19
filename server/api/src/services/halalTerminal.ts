const HALAL_TERMINAL_BASE = "https://api.halalterminal.com";

export type MarketQuote = {
  ticker: string;
  price: number;
  changePct: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  prevClose: number | null;
};

type HalalQuotePayload = {
  symbol?: string;
  name?: string;
  price?: number;
  changePercent?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  previousClose?: number;
};

function apiKey(): string {
  const key = process.env.HALAL_TERMINAL_API_KEY;
  if (!key) throw new Error("HALAL_TERMINAL_API_KEY is not set.");
  return key;
}

function headers(): Record<string, string> {
  return {
    "X-API-Key": apiKey(),
    "Content-Type": "application/json",
  };
}

function finiteOrNull(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeQuote(ticker: string, raw: HalalQuotePayload): MarketQuote {
  const price = finiteOrNull(raw.price);
  if (price === null || price <= 0) {
    throw new Error("Could not resolve a trade price.");
  }
  return {
    ticker: (raw.symbol ?? ticker).toUpperCase(),
    price,
    changePct: finiteOrNull(raw.changePercent),
    open: finiteOrNull(raw.open),
    high: finiteOrNull(raw.high),
    low: finiteOrNull(raw.low),
    volume: finiteOrNull(raw.volume),
    prevClose: finiteOrNull(raw.previousClose),
  };
}

export async function getQuote(ticker: string): Promise<MarketQuote> {
  const symbol = ticker.toUpperCase();
  const res = await fetch(
    `${HALAL_TERMINAL_BASE}/api/quote/${encodeURIComponent(symbol)}`,
    { headers: headers() },
  );
  if (!res.ok) throw new Error(`Halal Terminal quote failed: ${res.status}`);
  const raw = (await res.json()) as HalalQuotePayload;
  return normalizeQuote(symbol, raw);
}

export async function getQuotes(
  tickers: string[],
): Promise<Array<MarketQuote | { ticker: string; error: string }>> {
  const symbols = [
    ...new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean)),
  ];
  if (symbols.length === 0) return [];

  if (symbols.length === 1) {
    const ticker = symbols[0]!;
    try {
      return [await getQuote(ticker)];
    } catch (error) {
      return [
        {
          ticker,
          error: error instanceof Error ? error.message : "Quote failed",
        },
      ];
    }
  }

  try {
    const res = await fetch(`${HALAL_TERMINAL_BASE}/api/quotes/batch`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ symbols: symbols.slice(0, 50) }),
    });
    if (!res.ok) throw new Error(`Halal Terminal batch quote failed: ${res.status}`);
    const body = (await res.json()) as Record<string, unknown>;
    return symbols.map((ticker) => {
      const raw = body[ticker];
      if (!raw || typeof raw !== "object" || Array.isArray(raw) || !("price" in raw)) {
        return { ticker, error: "Quote not returned." };
      }
      try {
        return normalizeQuote(ticker, raw as HalalQuotePayload);
      } catch (error) {
        return {
          ticker,
          error: error instanceof Error ? error.message : "Quote failed",
        };
      }
    });
  } catch {
    return Promise.all(
      symbols.map(async (ticker) => {
        try {
          return await getQuote(ticker);
        } catch (error) {
          return {
            ticker,
            error: error instanceof Error ? error.message : "Quote failed",
          };
        }
      }),
    );
  }
}

export type ScreeningStatus = "compliant" | "non_compliant" | "under_review";

export type HalalScreening = {
  symbol?: string;
  name?: string;
  is_compliant?: boolean | null;
  shariah_compliance_status?: string | null;
  disposition?: string | null;
  [key: string]: unknown;
};

export type ScreeningVerdict = {
  ticker: string;
  status: ScreeningStatus;
  company_name: string | null;
  data: HalalScreening;
};

export function mapScreeningStatus(raw: HalalScreening): ScreeningStatus {
  if (raw.is_compliant === true) return "compliant";
  if (raw.is_compliant === false) return "non_compliant";
  return "under_review";
}

export function toVerdict(ticker: string, data: HalalScreening): ScreeningVerdict {
  return {
    ticker: ticker.toUpperCase(),
    status: mapScreeningStatus(data),
    company_name: typeof data.name === "string" ? data.name : null,
    data,
  };
}

async function fetchScreening(path: string): Promise<HalalScreening> {
  const res = await fetch(`${HALAL_TERMINAL_BASE}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`Halal Terminal screening failed: ${res.status}`);
  return (await res.json()) as HalalScreening;
}

/** Cached verdict stored at Halal Terminal. */
export async function getScreeningResult(ticker: string): Promise<ScreeningVerdict> {
  const symbol = ticker.toUpperCase();
  const data = await fetchScreening(`/api/result/${encodeURIComponent(symbol)}`);
  return toVerdict(symbol, data);
}

/** Live screen for a single symbol. Used for trade gating. */
export async function getScreeningStatus(ticker: string): Promise<ScreeningVerdict> {
  const symbol = ticker.toUpperCase();
  const data = await fetchScreening(`/api/screen/${encodeURIComponent(symbol)}`);
  return toVerdict(symbol, data);
}

export async function getScreeningStatuses(
  tickers: string[],
): Promise<ScreeningVerdict[]> {
  const symbols = [
    ...new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean)),
  ];
  return Promise.all(
    symbols.map(async (ticker) => {
      try {
        return await getScreeningResult(ticker);
      } catch {
        try {
          return await getScreeningStatus(ticker);
        } catch {
          return {
            ticker,
            status: "under_review" as const,
            company_name: null,
            data: {},
          };
        }
      }
    }),
  );
}
