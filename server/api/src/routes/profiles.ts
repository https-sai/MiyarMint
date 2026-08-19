import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const profilesRouter = Router();

type ProfileRow = {
  id: string;
  role: "student" | "educator" | "admin";
  display_name: string | null;
  leaderboard_visible: boolean | null;
  created_at: string;
};

async function ensureProfile(userId: string): Promise<ProfileRow> {
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id, role, display_name, leaderboard_visible, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) {
    return {
      ...existing,
      leaderboard_visible: existing.leaderboard_visible !== false,
    } as ProfileRow;
  }

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ id: userId, role: "student" })
    .select("id, role, display_name, leaderboard_visible, created_at")
    .single();
  if (createError) throw createError;

  return {
    ...created,
    leaderboard_visible: created.leaderboard_visible !== false,
  } as ProfileRow;
}

profilesRouter.get("/me", verifySupabaseAsymmetricToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  try {
    const profile = await ensureProfile(userId);
    res.json({ profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile";
    res.status(500).json({ error: message });
  }
});

profilesRouter.patch("/me", verifySupabaseAsymmetricToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const updates: {
    display_name?: string;
    leaderboard_visible?: boolean;
  } = {};

  if (typeof req.body?.display_name === "string") {
    const name = req.body.display_name.trim();
    if (!name) {
      res.status(400).json({ error: "display_name cannot be empty." });
      return;
    }
    updates.display_name = name;
  }

  if (typeof req.body?.leaderboard_visible === "boolean") {
    updates.leaderboard_visible = req.body.leaderboard_visible;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No profile fields to update." });
    return;
  }

  try {
    await ensureProfile(userId);
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("id, role, display_name, leaderboard_visible, created_at")
      .single();
    if (error) throw error;

    res.json({
      profile: {
        ...data,
        leaderboard_visible: data.leaderboard_visible !== false,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    res.status(500).json({ error: message });
  }
});

profilesRouter.patch(
  "/me/push-token",
  verifySupabaseAsymmetricToken,
  async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const pushToken = req.body?.pushToken;
    if (typeof pushToken !== "string" || pushToken.length === 0) {
      res.status(400).json({ error: "pushToken is required." });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ push_token: pushToken })
        .eq("id", userId)
        .select("id, push_token")
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save push token";
      res.status(500).json({ error: message });
    }
  },
);
