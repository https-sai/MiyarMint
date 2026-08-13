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

export type Trade = {
  id: string;
  ticker: string;
  side: "buy" | "sell";
  quantity: number | string;
  price: number | string;
  executed_at: string;
};

export type PortfolioResponse = {
  portfolio: {
    id: string;
    student_id: string;
    cash_balance: number | string;
    created_at: string;
  };
  trades: Trade[];
};

export type HalalStock = {
  ticker: string;
  company_name: string | null;
  status: "compliant" | "non_compliant" | "under_review";
  last_screened_at: string | null;
};

export type ClassroomSummary = {
  id: string;
  name: string;
  join_code: string;
  educator: { id: string; display_name: string } | null;
  members: Array<{
    student_id: string;
    display_name: string;
    joined_at: string;
  }>;
};

export function getPortfolio(studentId: string) {
  return apiFetch<PortfolioResponse>(`/portfolios/${studentId}`);
}

export function getHalalStocks() {
  return apiFetch<{ stocks: HalalStock[] }>("/stocks");
}

export function getMyClassrooms() {
  return apiFetch<{ classrooms: ClassroomSummary[] }>("/classrooms/mine");
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
    trade: Trade;
    cash_balance: number;
  }>("/trades", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function savePushToken(pushToken: string) {
  return apiFetch("/profiles/me/push-token", {
    method: "PATCH",
    body: JSON.stringify({ pushToken }),
  });
}
