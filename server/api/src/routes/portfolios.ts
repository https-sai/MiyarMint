import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const portfoliosRouter = Router();

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

      const { data: holdings, error: holdingsError } = await supabase
        .from("trades")
        .select("id, ticker, side, quantity, price, executed_at")
        .eq("portfolio_id", portfolio.id)
        .order("executed_at", { ascending: false })
        .limit(25);

      if (holdingsError) throw holdingsError;

      res.json({
        portfolio,
        trades: holdings ?? [],
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Portfolio lookup failed";
      res.status(500).json({ error: message });
    }
  },
);
