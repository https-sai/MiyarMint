const MASSIVE_BASE = "https://api.massive.io";

export async function getLastQuote(ticker: string) {
  const url = `${MASSIVE_BASE}/v2/last/trade/${ticker}?apiKey=${process.env.MASSIVE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Massive request failed: ${res.status}`);
  return res.json();
}