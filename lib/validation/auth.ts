import { z } from "zod";

// Admin accounts are provisioned manually — public signup is shipper/forwarder only.
export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200)
    .refine((p) => /[a-zA-Z]/.test(p) && /[0-9]/.test(p), {
      message: "Password must contain a letter and a number",
    }),
  role: z.enum(["shipper", "forwarder"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
