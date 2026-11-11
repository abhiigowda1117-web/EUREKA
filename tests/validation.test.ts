// Unit tests for server-side validation rules. Run: npm run test:unit
import assert from "node:assert/strict";
import { test } from "node:test";
import { resetPasswordSchema, signUpSchema } from "../src/lib/validation/auth.ts";
import { educationSchema, onboardingSchema, portfolioSchema, profileBasicsSchema, usernameSchema } from "../src/lib/validation/profile.ts";
import { safeNextPath } from "../src/lib/utils.ts";

test("sign-up requires name, valid email, strong password and accepted terms", () => {
  const ok = signUpSchema.safeParse({ fullName: "Asha Rao", email: " Asha@Example.com ", password: "forge2026", terms: "on" });
  assert.ok(ok.success);
  assert.equal(ok.data.email, "asha@example.com", "email is trimmed and lower-cased");
  assert.ok(!signUpSchema.safeParse({ fullName: "Asha", email: "asha@example.com", password: "short1", terms: "on" }).success);
  assert.ok(!signUpSchema.safeParse({ fullName: "Asha", email: "asha@example.com", password: "lettersonly", terms: "on" }).success);
  assert.ok(!signUpSchema.safeParse({ fullName: "Asha", email: "not-an-email", password: "forge2026", terms: "on" }).success);
  assert.ok(!signUpSchema.safeParse({ fullName: "Asha", email: "asha@example.com", password: "forge2026" }).success, "terms required");
});

test("reset password must match confirmation", () => {
  assert.ok(resetPasswordSchema.safeParse({ password: "forge2026", confirmPassword: "forge2026" }).success);
  const bad = resetPasswordSchema.safeParse({ password: "forge2026", confirmPassword: "forge2027" });
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues[0]!.path, ["confirmPassword"]);
});

test("usernames: format, length and reserved words (matches the DB check constraint)", () => {
  for (const good of ["asha", "asha_rao", "dev123", "a1b"]) assert.ok(usernameSchema.safeParse(good).success, good);
  for (const bad of ["ab", "_asha", "asha_", "Asha Rao", "asha-rao", "a".repeat(25), "admin", "forge"]) {
    assert.ok(!usernameSchema.safeParse(bad).success, bad);
  }
  assert.equal(usernameSchema.parse("  ASHA_RAO "), "asha_rao");
});

test("onboarding requires an intent", () => {
  assert.ok(onboardingSchema.safeParse({ fullName: "Asha Rao", username: "asha", intent: "both", college: "" }).success);
  assert.ok(!onboardingSchema.safeParse({ fullName: "Asha Rao", username: "asha", intent: "hacker", college: "" }).success);
});

test("profile basics turn empty optional fields into null and validate links", () => {
  const base = { fullName: "Asha Rao", headline: "", bio: "", location: "", college: "", isClient: true, isFreelancer: false };
  const ok = profileBasicsSchema.parse({ ...base, websiteUrl: "" });
  assert.equal(ok.headline, null);
  assert.equal(ok.websiteUrl, null);
  assert.ok(profileBasicsSchema.safeParse({ ...base, websiteUrl: "https://github.com/asha" }).success);
  assert.ok(!profileBasicsSchema.safeParse({ ...base, websiteUrl: "javascript:alert(1)" }).success, "blocks javascript: links");
  assert.ok(!profileBasicsSchema.safeParse({ ...base, headline: "x".repeat(121), websiteUrl: "" }).success);
});

test("education years must be in order", () => {
  assert.ok(educationSchema.safeParse({ institution: "RVCE", degree: "", field: "", startYear: "2023", endYear: "2027" }).success);
  assert.ok(!educationSchema.safeParse({ institution: "RVCE", degree: "", field: "", startYear: "2027", endYear: "2023" }).success);
  assert.ok(!educationSchema.safeParse({ institution: "RVCE", degree: "", field: "", startYear: "20x3", endYear: "" }).success);
});

test("portfolio links must be http(s)", () => {
  assert.ok(!portfolioSchema.safeParse({ title: "Site", description: "", projectUrl: "ftp://x.com" }).success);
  assert.ok(portfolioSchema.safeParse({ title: "Site", description: "", projectUrl: "https://x.com" }).success);
});

test("safeNextPath blocks open redirects", () => {
  assert.equal(safeNextPath("/settings/profile"), "/settings/profile");
  assert.equal(safeNextPath("https://evil.com"), "/dashboard");
  assert.equal(safeNextPath("//evil.com"), "/dashboard");
  assert.equal(safeNextPath("/\\evil.com"), "/dashboard");
  assert.equal(safeNextPath(null), "/dashboard");
});
