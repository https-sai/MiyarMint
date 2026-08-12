import { Router } from "express";
import { getScreeningStatus } from "../services/halalTerminal.js";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const screeningRouter = Router();

screeningRouter.get(
  "/:ticker",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const rawTicker = req.params.ticker;
    const ticker = typeof rawTicker === "string" ? rawTicker.toUpperCase() : "";
    if (!ticker) {
      res.status(400).json({ error: "Ticker is required." });
      return;
    }

    try {
      const { data: cached } = await supabase
        .from("halal_stock_list")
        .select("ticker, company_name, status, last_screened_at")
        .eq("ticker", ticker)
        .maybeSingle();

      if (cached) {
        res.json({ source: "cache", ...cached });
        return;
      }

      const live = await getScreeningStatus(ticker);
      res.json({ source: "live", ticker, data: live });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Screening failed";
      res.status(502).json({ error: message });
    }
  },
);
