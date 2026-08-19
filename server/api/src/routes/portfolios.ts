import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";
import { aggregateHoldings } from "../lib/holdings.js";
import { STARTING_CASH, toNumber } from "../lib/numbers.js";

export const portfoliosRouter = Router();

type TradeRow = {
  id: string;
  ticker: string;
  side: "buy" | "sell";
  quantity: number | string;
  price: number | string;
  executed_at: string;
};

async function ensureStudentPortfolio(studentId: string) {
  const { data: existing, error: lookupError } = await supabase
    .from("portfolios")
    .select("id, student_id, cash_balance, created_at")
    .eq("student_id", studentId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("portfolios")
    .insert({ student_id: studentId })
    .select("id, student_id, cash_balance, created_at")
    .single();

  if (createError) throw createError;
  return created;
}

portfoliosRouter.get(
  "/:studentId",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const studentId = req.params.studentId;
    if (!studentId) {
      res.status(400).json({ error: "studentId is required." });
      return;
    }

    if (req.userId !== studentId) {
      res.status(403).json({ error: "Forbidden." });
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, display_name")
        .eq("id", studentId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        const { error: insertProfileError } = await supabase
          .from("profiles")
          .insert({ id: studentId, role: "student" });
        if (insertProfileError) throw insertProfileError;
      }

      const portfolio = await ensureStudentPortfolio(studentId);

      const { data: trades, error: tradesError } = await supabase
        .from("trades")
        .select("id, ticker, side, quantity, price, executed_at")
        .eq("portfolio_id", portfolio.id)
        .order("executed_at", { ascending: false });

      if (tradesError) throw tradesError;

      const tradeRows = (trades ?? []) as TradeRow[];
      const holdings = aggregateHoldings(tradeRows);
      const cash = toNumber(portfolio.cash_balance);
      const investedCost = holdings.reduce(
        (sum, row) => sum + row.shares * row.avg_cost,
        0,
      );

      res.json({
        portfolio,
        trades: tradeRows,
        holdings,
        cash_balance: cash,
        invested_cost: investedCost,
        starting_cash: STARTING_CASH,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Portfolio lookup failed";
      res.status(500).json({ error: message });
    }
  },
);
