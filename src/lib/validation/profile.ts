import { z } from "zod";

/** Empty form fields arrive as "" — turn them into null so the DB stores NULL. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((v) => (v === "" ? null : v));

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v), "Enter a full link starting with https://");

export const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "forge", "support", "help", "api", "auth", "login", "signup", "settings",
  "dashboard", "projects", "messages", "u", "root", "moderator", "staff", "official", "team",
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(24, "Use at most 24 characters")
  .regex(/^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$/, "Use lowercase letters, numbers and underscores (not at the start or end)")
  .refine((v) => !RESERVED_USERNAMES.has(v), "That username is reserved");

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  username: usernameSchema,
  intent: z.enum(["client", "freelancer", "both"], { error: "Choose how you want to use FORGE" }),
  college: optionalText(120),
});

export const profileBasicsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  headline: optionalText(120),
  bio: optionalText(2000),
  location: optionalText(80),
  college: optionalText(120),
  websiteUrl: optionalUrl,
  isClient: z.boolean(),
  isFreelancer: z.boolean(),
});

export const MAX_SKILLS = 15;
export const skillsSchema = z
  .array(z.coerce.number().int().positive())
  .max(MAX_SKILLS, `Pick at most ${MAX_SKILLS} skills`);

const year = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 1950 && v <= 2100), "Enter a valid year");

export const educationSchema = z
  .object({
    institution: z.string().trim().min(2, "Enter the institution name").max(120),
    degree: optionalText(120),
    field: optionalText(120),
    startYear: year,
    endYear: year,
  })
  .refine((v) => v.startYear === null || v.endYear === null || v.endYear >= v.startYear, {
    message: "End year can't be before start year",
    path: ["endYear"],
  });

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || /^\d{4}-\d{2}(-\d{2})?$/.test(v), "Enter a valid date");

export const experienceSchema = z
  .object({
    title: z.string().trim().min(2, "Enter your role or title").max(120),
    organization: optionalText(120),
    description: optionalText(1000),
    startDate: optionalDate,
    endDate: optionalDate,
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "End date can't be before start date",
    path: ["endDate"],
  });

export const portfolioSchema = z.object({
  title: z.string().trim().min(2, "Enter a project title").max(120),
  description: optionalText(1000),
  projectUrl: optionalUrl,
});

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
