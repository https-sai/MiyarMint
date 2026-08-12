import { Router } from "express";
import { getLastQuote } from "../services/massive.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const marketRouter = Router();

marketRouter.get(
  "/quote/:ticker",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const rawTicker = req.params.ticker;
    const ticker = typeof rawTicker === "string" ? rawTicker.toUpperCase() : "";
    if (!ticker) {
      res.status(400).json({ error: "Ticker is required." });
      return;
    }

    try {
      const quote = await getLastQuote(ticker);
      res.json(quote);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Quote failed";
      res.status(502).json({ error: message });
    }
  },
);
