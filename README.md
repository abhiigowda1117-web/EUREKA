# FORGE — Where Talent Meets Opportunity

A student-focused freelance marketplace for India. Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).

**Status: Milestone 1 (Foundation)** — landing page, design system, auth (sign up, verify email, log in/out, forgot/reset password), onboarding, editable profiles (photo, skills, portfolio, experience, education), public profiles, and the full database schema with Row Level Security.

## 1. Set up Supabase (one time, ~10 min)
1. Create a free project at https://supabase.com (region: Mumbai).
2. **SQL Editor** → run each file in `supabase/migrations/` **in filename order** (or `npx supabase link` + `npx supabase db push`).
3. **Authentication → Sign In / Providers → Email**: keep **Confirm email ON**.
4. **Authentication → URL Configuration**: Site URL `http://localhost:3000`; add redirect URL `http://localhost:3000/auth/confirm` (later also your production URL).
5. *(Recommended)* **Authentication → Emails**: in "Confirm signup" and "Reset password" templates, replace the link with
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding` (signup) and
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery` (reset). This makes links work even when opened on a different device.
6. Built-in email is limited to a few emails/hour — fine for testing; set up custom SMTP (e.g. Resend) before launch.

## 2. Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values from Supabase → Project Settings → API
npm run dev                  # http://localhost:3000
```

## 3. Tests
| Command | What it checks |
|---|---|
| `npm run lint` / `npm run typecheck` | Code quality and types |
| `npm run test:unit` | Validation rules (passwords, usernames, links, redirects) |
| `npm run test:db` | Applies migrations to a throwaway local Postgres and tries to break the security rules (needs PostgreSQL 15+ installed) |
| `npm run test:e2e` | Browser smoke test on phone + laptop sizes (run `npm run build && npm start` first) |
| `npm run check` | All of the above except e2e |

## 4. Make yourself admin
After signing up, in Supabase SQL Editor: `update profiles set role = 'admin' where username = 'your_username';`

## Project layout
```
src/app/            pages & routes (App Router)  — (auth)/ login, signup...; auth/confirm email links
src/components/     ui/ (design system), site/ (header/footer), landing/, profile/, projects/
src/lib/            auth.ts (who is logged in), supabase/ clients, validation/ (zod), queries/
src/proxy.ts        runs before each request: refreshes session, redirects guests from private pages
supabase/migrations SQL schema + RLS + storage + categories   supabase/tests  DB security tests
docs/               ARCHITECTURE.md, ROADMAP.md
```
