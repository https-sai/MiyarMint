import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof body?.error === "string" ? body.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export type PortfolioResponse = {
  portfolio: {
    id: string;
    student_id: string;
    cash_balance: number | string;
    created_at: string;
  };
  trades: Array<{
    id: string;
    ticker: string;
    side: "buy" | "sell";
    quantity: number | string;
    price: number | string;
    executed_at: string;
  }>;
};

export function getPortfolio(studentId: string) {
  return apiFetch<PortfolioResponse>(`/portfolios/${studentId}`);
}

export function getMarketQuote(ticker: string) {
  return apiFetch(`/market/quote/${encodeURIComponent(ticker)}`);
}

export function getScreening(ticker: string) {
  return apiFetch(`/screening/${encodeURIComponent(ticker)}`);
}

export function savePushToken(pushToken: string) {
  return apiFetch("/profiles/me/push-token", {
    method: "PATCH",
    body: JSON.stringify({ pushToken }),
  });
}

export function joinClassroom(joinCode: string) {
  return apiFetch<{ classroom: { id: string; name: string; join_code: string } }>(
    "/classrooms/join",
    {
      method: "POST",
      body: JSON.stringify({ joinCode }),
    },
  );
}

export function placeTrade(input: {
  ticker: string;
  side: "buy" | "sell";
  quantity: number;
}) {
  return apiFetch<{
    trade: PortfolioResponse["trades"][number];
    cash_balance: number;
  }>("/trades", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
