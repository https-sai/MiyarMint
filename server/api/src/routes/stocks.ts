import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const stocksRouter = Router();

stocksRouter.get("/", verifySupabaseAsymmetricToken, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("halal_stock_list")
      .select("ticker, company_name, status, last_screened_at")
      .order("ticker", { ascending: true });

    if (error) throw error;
    res.json({ stocks: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load stock list";
    res.status(500).json({ error: message });
  }
});
