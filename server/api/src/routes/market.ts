import { Router } from "express";
import { getQuote, getQuotes } from "../services/halalTerminal.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const marketRouter = Router();

marketRouter.get(
  "/quotes",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const raw = typeof req.query.tickers === "string" ? req.query.tickers : "";
    const tickers = [
      ...new Set(
        raw
          .split(",")
          .map((ticker) => ticker.trim().toUpperCase())
          .filter(Boolean),
      ),
    ].slice(0, 50);

    if (tickers.length === 0) {
      res.status(400).json({ error: "tickers query is required." });
      return;
    }

    const quotes = await getQuotes(tickers);
    res.json({ quotes });
  },
);

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
      const quote = await getQuote(ticker);
      res.json(quote);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Quote failed";
      res.status(502).json({ error: message });
    }
  },
);
