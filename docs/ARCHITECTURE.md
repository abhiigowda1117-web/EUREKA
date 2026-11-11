# Architecture decisions (read this before changing things)

**Three layers of security.** 1) `src/proxy.ts` redirects guests away from private pages (convenience only). 2) Every private page and Server Action calls `requireUser()/requireProfile()` in `src/lib/auth.ts` and validates input with zod. 3) **The database enforces Row Level Security** — even if the app has a bug, Postgres refuses to let a user edit someone else's data. Layer 3 is the real boundary; `npm run test:db` proves it.

**No service-role key in the app.** All queries run *as the logged-in user*, so RLS always applies. Privileged columns (`role`, `status`, `identity_verified_at`, `proposal_count`) are protected with column-level grants; future privileged operations (accepting a proposal, notifications) will be `SECURITY DEFINER` SQL functions that check permissions themselves.

**Deny by default.** Tables for later milestones (proposals, messages, reviews, reports…) already exist but have no policies, so nobody can touch them until that milestone adds rules + tests.

**Server Actions over API routes.** Forms post to `"use server"` functions (`actions.ts` next to each page). They return `ActionState` (`{ok, message, error, fieldErrors, values}`) which forms render with `useActionState`.

**Rendering model.** Next.js 16 "Cache Components" is OFF and the root layout is `force-dynamic`: every page renders per request. Simple and correct; optimise later.

**Reference data in migrations.** Categories/skills are needed in production, so they're a migration, not seed data.

**Payments.** Not processed. `project_assignments.payment_status` only records what the two users report. No escrow claims until a compliant Razorpay setup + legal review.

**Verification honesty.** "Email verified" is shown because sign-in requires a confirmed email. "Identity verified" appears only when an admin sets `identity_verified_at` after a real check.
