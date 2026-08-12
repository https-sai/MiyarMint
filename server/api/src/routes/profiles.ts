import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const profilesRouter = Router();

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
