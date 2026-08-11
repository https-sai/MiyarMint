const HALAL_TERMINAL_BASE = "https://api.halalterminal.com"; // confirm actual base URL against their docs

export async function getScreeningStatus(ticker: string) {
  const res = await fetch(`${HALAL_TERMINAL_BASE}/v1/screening/${ticker}`, {
    headers: { Authorization: `Bearer ${process.env.HALAL_TERMINAL_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Halal Terminal request failed: ${res.status}`);
  return res.json();
}