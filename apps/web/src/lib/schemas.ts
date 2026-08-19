import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Enter a valid school email."),
  password: z.string().min(1, "Password is required."),
})

export const createAccountSchema = z.object({
  displayName: z.string().min(1, "Display name is required."),
  email: z.string().email("Enter a valid school email."),
  role: z.enum(["student", "educator"]),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

export const tradeSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Ticker is required.")
    .transform((value) => value.toUpperCase()),
  side: z.enum(["buy", "sell"]),
  quantity: z.coerce.number().positive("Quantity must be greater than 0."),
})

export const joinClassroomSchema = z.object({
  joinCode: z
    .string()
    .trim()
    .min(4, "Join code is required.")
    .transform((value) => value.toUpperCase()),
})

export const createClassroomSchema = z.object({
  name: z.string().trim().min(2, "Classroom name is required."),
})

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required."),
})
