import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifySupabaseAsymmetricToken } from "../middleware/auth.js";

export const classroomsRouter = Router();

function makeJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

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
