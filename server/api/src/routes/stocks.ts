import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { getScreeningStatuses } from "../services/halalTerminal.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const stocksRouter = Router();

stocksRouter.get("/", verifySupabaseAsymmetricToken, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("halal_stock_list")
      .select("ticker, company_name")
      .order("ticker", { ascending: true });

    if (error) throw error;

    const book = data ?? [];
    const verdicts = await getScreeningStatuses(book.map((row) => row.ticker));
    const byTicker = new Map(verdicts.map((row) => [row.ticker, row] as const));

    const stocks = book.map((row) => {
      const verdict = byTicker.get(row.ticker);
      return {
        ticker: row.ticker,
        company_name: verdict?.company_name ?? row.company_name,
        status: verdict?.status ?? "under_review",
        last_screened_at: new Date().toISOString(),
        source: "halal_terminal" as const,
        screening: verdict?.data ?? null,
      };
    });

    res.json({ stocks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load stock list";
    res.status(500).json({ error: message });
  }
});
