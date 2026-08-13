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
        .select("classroom_id, joined_at")
        .eq("student_id", userId);

      if (membershipError) throw membershipError;

      const classroomIds = (memberships ?? []).map((m) => m.classroom_id);
      if (classroomIds.length === 0) {
        res.json({ classrooms: [] });
        return;
      }

      const { data: classrooms, error: classroomError } = await supabase
        .from("classrooms")
        .select("id, name, join_code, educator_id, created_at")
        .in("id", classroomIds)
        .order("created_at", { ascending: true });

      if (classroomError) throw classroomError;

      const educatorIds = [
        ...new Set(
          (classrooms ?? [])
            .map((c) => c.educator_id)
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

      const studentIds = [
        ...new Set((members ?? []).map((m) => m.student_id)),
      ];

      const { data: studentProfiles, error: studentsError } = await supabase
        .from("profiles")
        .select("id, display_name, role")
        .in("id", studentIds.length > 0 ? studentIds : [placeholderId]);

      if (studentsError) throw studentsError;

      const educatorById = new Map(
        (educators ?? []).map((p) => [p.id, p] as const),
      );
      const profileById = new Map(
        (studentProfiles ?? []).map((p) => [p.id, p] as const),
      );

      const payload = (classrooms ?? []).map((classroom) => {
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
