import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";
import { aggregateHoldings } from "../lib/holdings.js";
import { STARTING_CASH, toNumber } from "../lib/numbers.js";
import { parsePeriod, periodStart } from "../lib/period.js";
import { getQuotes } from "../services/halalTerminal.js";

export const classroomsRouter = Router();

type ClassroomRow = {
  id: string;
  name: string;
  join_code: string;
  educator_id: string | null;
  created_at: string;
};

type ProfileLite = {
  id: string;
  display_name: string | null;
  role: string;
  leaderboard_visible?: boolean | null;
};

function makeJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function hydrateClassrooms(classroomIds: string[]) {
  if (classroomIds.length === 0) return [];

  const { data: classrooms, error: classroomError } = await supabase
    .from("classrooms")
    .select("id, name, join_code, educator_id, created_at")
    .in("id", classroomIds)
    .order("created_at", { ascending: true });

  if (classroomError) throw classroomError;

  const educatorIds = [
    ...new Set(
      (classrooms ?? [])
        .map((c: ClassroomRow) => c.educator_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];

  const placeholderId = "00000000-0000-0000-0000-000000000000";

  const { data: educators, error: educatorError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .in("id", educatorIds.length > 0 ? educatorIds : [placeholderId]);

  if (educatorError) throw educatorError;

  const { data: members, error: membersError } = await supabase
    .from("classroom_members")
    .select("classroom_id, student_id, joined_at")
    .in("classroom_id", classroomIds);

  if (membersError) throw membersError;

  const studentIds = [...new Set((members ?? []).map((m) => m.student_id))];

  const { data: studentProfiles, error: studentsError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .in("id", studentIds.length > 0 ? studentIds : [placeholderId]);

  if (studentsError) throw studentsError;

  const educatorById = new Map(
    ((educators ?? []) as ProfileLite[]).map((p) => [p.id, p] as const),
  );
  const profileById = new Map(
    ((studentProfiles ?? []) as ProfileLite[]).map((p) => [p.id, p] as const),
  );

  return ((classrooms ?? []) as ClassroomRow[]).map((classroom) => {
    const educator = classroom.educator_id
      ? educatorById.get(classroom.educator_id)
      : undefined;
    const classroomMembers = (members ?? [])
      .filter((m) => m.classroom_id === classroom.id)
      .map((m) => {
        const profile = profileById.get(m.student_id);
        return {
          student_id: m.student_id,
          display_name: profile?.display_name ?? "Student",
          joined_at: m.joined_at,
        };
      });

    return {
      id: classroom.id,
      name: classroom.name,
      join_code: classroom.join_code,
      educator: educator
        ? {
            id: educator.id,
            display_name: educator.display_name ?? "Educator",
          }
        : null,
      members: classroomMembers,
    };
  });
}

async function assertClassroomAccess(userId: string, classroomId: string) {
  const { data: classroom, error } = await supabase
    .from("classrooms")
    .select("id, educator_id")
    .eq("id", classroomId)
    .maybeSingle();
  if (error) throw error;
  if (!classroom) return { classroom: null, allowed: false };

  if (classroom.educator_id === userId) {
    return { classroom, allowed: true };
  }

  const { data: membership, error: memberError } = await supabase
    .from("classroom_members")
    .select("student_id")
    .eq("classroom_id", classroomId)
    .eq("student_id", userId)
    .maybeSingle();
  if (memberError) throw memberError;

  return { classroom, allowed: Boolean(membership) };
}

classroomsRouter.get(
  "/mine",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    try {
      const { data: memberships, error: membershipError } = await supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("student_id", userId);

      if (membershipError) throw membershipError;

      const { data: owned, error: ownedError } = await supabase
        .from("classrooms")
        .select("id")
        .eq("educator_id", userId);

      if (ownedError) throw ownedError;

      const classroomIds = [
        ...new Set([
          ...(memberships ?? []).map((m) => m.classroom_id),
          ...(owned ?? []).map((c) => c.id),
        ]),
      ];

      const payload = await hydrateClassrooms(classroomIds);
      res.json({ classrooms: payload });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Classroom lookup failed";
      res.status(500).json({ error: message });
    }
  },
);

classroomsRouter.post("/", verifySupabaseAsymmetricToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: "name is required." });
    return;
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw profileError;

    if (!profile || (profile.role !== "educator" && profile.role !== "admin")) {
      res.status(403).json({ error: "Only educators can create classrooms." });
      return;
    }

    const joinCode = makeJoinCode();
    const { data, error } = await supabase
      .from("classrooms")
      .insert({ name, join_code: joinCode, educator_id: userId })
      .select("id, name, join_code, educator_id, created_at")
      .single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Classroom create failed";
    res.status(500).json({ error: message });
  }
});

classroomsRouter.post(
  "/join",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const joinCode =
      typeof req.body?.joinCode === "string"
        ? req.body.joinCode.trim().toUpperCase()
        : "";
    if (!joinCode) {
      res.status(400).json({ error: "joinCode is required." });
      return;
    }

    try {
      const { data: classroom, error: classroomError } = await supabase
        .from("classrooms")
        .select("id, name, join_code, educator_id")
        .eq("join_code", joinCode)
        .maybeSingle();
      if (classroomError) throw classroomError;
      if (!classroom) {
        res.status(404).json({ error: "Classroom not found." });
        return;
      }

      const { error: memberError } = await supabase
        .from("classroom_members")
        .upsert(
          { classroom_id: classroom.id, student_id: userId },
          { onConflict: "classroom_id,student_id" },
        );
      if (memberError) throw memberError;

      res.json({ classroom });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Classroom join failed";
      res.status(500).json({ error: message });
    }
  },
);

classroomsRouter.delete(
  "/:classroomId/members/me",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const userId = req.userId;
    const rawId = req.params.classroomId;
    const classroomId = typeof rawId === "string" ? rawId : "";
    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }
    if (!classroomId) {
      res.status(400).json({ error: "classroomId is required." });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("classroom_members")
        .delete()
        .eq("classroom_id", classroomId)
        .eq("student_id", userId)
        .select("student_id")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: "You are not a member of this classroom." });
        return;
      }
      res.json({ ok: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Leave classroom failed";
      res.status(500).json({ error: message });
    }
  },
);

classroomsRouter.get(
  "/:classroomId/leaderboard",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const userId = req.userId;
    const rawId = req.params.classroomId;
    const classroomId = typeof rawId === "string" ? rawId : "";
    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }
    if (!classroomId) {
      res.status(400).json({ error: "classroomId is required." });
      return;
    }

    const period = parsePeriod(req.query.period);
    const start = periodStart(period);

    try {
      const access = await assertClassroomAccess(userId, classroomId);
      if (!access.allowed) {
        res.status(403).json({ error: "Forbidden." });
        return;
      }

      const { data: classroom, error: classroomError } = await supabase
        .from("classrooms")
        .select("id, name, join_code")
        .eq("id", classroomId)
        .maybeSingle();
      if (classroomError) throw classroomError;
      if (!classroom) {
        res.status(404).json({ error: "Classroom not found." });
        return;
      }

      const { data: members, error: membersError } = await supabase
        .from("classroom_members")
        .select("student_id, joined_at")
        .eq("classroom_id", classroomId);
      if (membersError) throw membersError;

      const studentIds = [...new Set((members ?? []).map((m) => m.student_id))];
      if (studentIds.length === 0) {
        res.json({ classroom, period, rows: [] });
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, leaderboard_visible")
        .in("id", studentIds);
      if (profilesError) throw profilesError;

      const { data: portfolios, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("id, student_id, cash_balance")
        .in("student_id", studentIds);
      if (portfoliosError) throw portfoliosError;

      const portfolioIds = (portfolios ?? []).map((p) => p.id);
      const { data: trades, error: tradesError } =
        portfolioIds.length === 0
          ? { data: [], error: null }
          : await supabase
              .from("trades")
              .select("portfolio_id, ticker, side, quantity, price, executed_at")
              .in("portfolio_id", portfolioIds)
              .order("executed_at", { ascending: true });
      if (tradesError) throw tradesError;

      type TradeRow = {
        portfolio_id: string;
        ticker: string;
        side: "buy" | "sell";
        quantity: number | string;
        price: number | string;
        executed_at: string;
      };

      const tradesByPortfolio = new Map<string, TradeRow[]>();
      for (const trade of (trades ?? []) as TradeRow[]) {
        const list = tradesByPortfolio.get(trade.portfolio_id) ?? [];
        list.push(trade);
        tradesByPortfolio.set(trade.portfolio_id, list);
      }

      const uniqueTickers = [
        ...new Set(((trades ?? []) as TradeRow[]).map((t) => t.ticker)),
      ];
      const priceByTicker = new Map<string, number>();
      const quotes = await getQuotes(uniqueTickers);
      for (const quote of quotes) {
        if ("price" in quote && Number.isFinite(quote.price)) {
          priceByTicker.set(quote.ticker, quote.price);
        }
      }

      const profileById = new Map(
        ((profiles ?? []) as ProfileLite[]).map((p) => [p.id, p] as const),
      );
      const portfolioByStudent = new Map(
        (portfolios ?? []).map((p) => [p.student_id, p] as const),
      );

      const rows = studentIds.map((studentId) => {
        const profile = profileById.get(studentId);
        const portfolio = portfolioByStudent.get(studentId);
        const allTrades = portfolio
          ? (tradesByPortfolio.get(portfolio.id) ?? [])
          : [];
        const cash = portfolio ? toNumber(portfolio.cash_balance) : STARTING_CASH;
        const holdings = aggregateHoldings(allTrades);
        const invested = holdings.reduce((sum, lot) => {
          const mark = priceByTicker.get(lot.ticker) ?? lot.avg_cost;
          return sum + lot.shares * mark;
        }, 0);
        const totalValue = cash + invested;

        const priorTrades = start
          ? allTrades.filter((t) => new Date(t.executed_at) < start)
          : [];
        const periodTrades = start
          ? allTrades.filter((t) => new Date(t.executed_at) >= start)
          : allTrades;

        let valueAtStart = STARTING_CASH;
        if (start) {
          const cashflow = periodTrades.reduce((sum, t) => {
            const notional = toNumber(t.quantity) * toNumber(t.price);
            return sum + (t.side === "buy" ? -notional : notional);
          }, 0);
          const priorHoldings = aggregateHoldings(priorTrades);
          const priorMark = priorHoldings.reduce((sum, lot) => {
            const mark = priceByTicker.get(lot.ticker) ?? lot.avg_cost;
            return sum + lot.shares * mark;
          }, 0);
          valueAtStart = cash - cashflow + priorMark;
        }

        const baseline = valueAtStart === 0 ? STARTING_CASH : valueAtStart;
        const returnPct = ((totalValue - baseline) / baseline) * 100;
        const visible = profile?.leaderboard_visible !== false || studentId === userId;

        return {
          student_id: studentId,
          name: visible ? (profile?.display_name ?? "Student") : "Hidden",
          hidden: !visible,
          isYou: studentId === userId,
          value: totalValue,
          returnPct,
          trades: periodTrades.length,
        };
      });

      rows.sort((a, b) => b.value - a.value);
      const ranked = rows.map((row, index) => ({
        rank: index + 1,
        ...row,
      }));

      res.json({ classroom, period, rows: ranked });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Leaderboard failed";
      res.status(500).json({ error: message });
    }
  },
);
