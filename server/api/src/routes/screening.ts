import { Router } from "express";
import { getScreeningStatus } from "../services/halalTerminal.js";
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
      const verdict = await getScreeningStatus(ticker);
      res.json({
        source: "halal_terminal",
        ticker: verdict.ticker,
        company_name: verdict.company_name,
        status: verdict.status,
        data: verdict.data,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Screening failed";
      res.status(502).json({ error: message });
    }
  },
);
