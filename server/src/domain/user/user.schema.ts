import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(5),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(5)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username cannot contain spaces or special characters",
    }),
  email: z.string().optional().default(""),
  password: z.string().min(8),
});

export const userUpdateSchema = registerSchema.partial();
