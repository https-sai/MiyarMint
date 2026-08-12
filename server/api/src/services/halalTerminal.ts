const HALAL_TERMINAL_BASE = "https://api.halalterminal.com";

export async function getScreeningStatus(ticker: string) {
  const res = await fetch(`${HALAL_TERMINAL_BASE}/api/quote/${ticker}`, {
    headers: { "X-API-Key": process.env.HALAL_TERMINAL_API_KEY! },
  });
  if (!res.ok) throw new Error(`Halal Terminal request failed: ${res.status}`);
  return res.json();
}
