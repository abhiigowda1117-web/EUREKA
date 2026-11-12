import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email,
  password: passwordSchema,
  terms: z.literal("on", { error: "You must accept the terms and community guidelines" }),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const emailOnlySchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
