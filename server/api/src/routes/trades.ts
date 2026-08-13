import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { getLastQuote } from "../services/massive.js";
import { sendExpoPush } from "../services/notifications.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const tradesRouter = Router();

tradesRouter.post("/", verifySupabaseAsymmetricToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const ticker =
    typeof req.body?.ticker === "string" ? req.body.ticker.toUpperCase() : "";
  const side = req.body?.side === "sell" ? "sell" : req.body?.side === "buy" ? "buy" : null;
  const quantity = Number(req.body?.quantity);

  if (!ticker || !side || !Number.isFinite(quantity) || quantity <= 0) {
    res.status(400).json({
      error: "ticker, side (buy|sell), and positive quantity are required.",
    });
    return;
  }

  try {
    const { data: screening, error: screeningError } = await supabase
      .from("halal_stock_list")
      .select("ticker, status")
      .eq("ticker", ticker)
      .maybeSingle();
    if (screeningError) throw screeningError;

    if (!screening || screening.status !== "compliant") {
      res.status(400).json({
        error: "Ticker is not marked compliant in halal_stock_list.",
      });
      return;
    }

    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .select("id, cash_balance")
      .eq("student_id", userId)
      .maybeSingle();
    if (portfolioError) throw portfolioError;
    if (!portfolio) {
      res.status(404).json({ error: "Portfolio not found." });
      return;
    }

    const quote = (await getLastQuote(ticker)) as {
      results?: { p?: number };
      price?: number;
    };
    const price = Number(quote.results?.p ?? quote.price);
    if (!Number.isFinite(price) || price <= 0) {
      res.status(502).json({ error: "Could not resolve a trade price." });
      return;
    }

    const notional = price * quantity;
    const cash = Number(portfolio.cash_balance);

    if (side === "buy" && cash < notional) {
      res.status(400).json({ error: "Insufficient cash balance." });
      return;
    }

    const nextCash = side === "buy" ? cash - notional : cash + notional;

    const { data: trade, error: tradeError } = await supabase
      .from("trades")
      .insert({
        portfolio_id: portfolio.id,
        ticker,
        side,
        quantity,
        price,
      })
      .select("id, ticker, side, quantity, price, executed_at")
      .single();
    if (tradeError) throw tradeError;

    const { error: cashError } = await supabase
      .from("portfolios")
      .update({ cash_balance: nextCash })
      .eq("id", portfolio.id);
    if (cashError) throw cashError;

    const { data: profile } = await supabase
      .from("profiles")
      .select("push_token")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.push_token) {
      try {
        await sendExpoPush([
          {
            to: profile.push_token,
            title: "Trade confirmed",
            body: `${side.toUpperCase()} ${quantity} ${ticker} @ ${price}`,
            data: { tradeId: trade.id },
          },
        ]);
      } catch {
        // Push is best-effort at skeleton stage.
      }
    }

    res.status(201).json({
      trade,
      cash_balance: nextCash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trade failed";
    res.status(500).json({ error: message });
  }
});
