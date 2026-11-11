"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, resendVerification, signIn, signUp, updatePassword } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/types";
import { PasswordInput } from "./password-input";

const initial: ActionState = {};
const err = (s: ActionState, k: string) => s.fieldErrors?.[k]?.[0];

function FormError({ state }: { state: ActionState }) {
  if (!state.error) return null;
  return <Alert variant="error" title={state.error} />;
}

export function SignUpForm({ disabled }: { disabled?: boolean }) {
  const [state, action] = useActionState(signUp, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormError state={state} />
      <Field id="fullName" label="Full name" error={err(state, "fullName")}>
        <Input {...fieldAria("fullName", err(state, "fullName"))} autoComplete="name" required defaultValue={state.values?.fullName} />
      </Field>
      <Field id="email" label="Email" error={err(state, "email")}>
        <Input {...fieldAria("email", err(state, "email"))} type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} />
      </Field>
      <Field id="password" label="Password" hint="At least 8 characters, with letters and numbers." error={err(state, "password")}>
        <PasswordInput {...fieldAria("password", err(state, "password"), true)} autoComplete="new-password" required />
      </Field>
      <div className="space-y-1.5">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" name="terms" required className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" aria-invalid={err(state, "terms") ? true : undefined} />
          <span>
            I agree to the <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>, including the academic integrity policy.
          </span>
        </label>
        {err(state, "terms") && <p role="alert" className="text-sm text-destructive">{err(state, "terms")}</p>}
      </div>
      <SubmitButton className="w-full" size="lg" pendingText="Creating account…" disabled={disabled}>
        Create account
      </SubmitButton>
    </form>
  );
}

export function SignInForm({ next, disabled }: { next?: string; disabled?: boolean }) {
  const [state, action] = useActionState(signIn, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && (
        <Alert variant="error" title={state.error}>
          {state.fieldErrors?.unverified && (
            <Link href={`/verify-email?email=${encodeURIComponent(state.values?.email ?? "")}`} className="underline">
              Resend the verification email
            </Link>
          )}
        </Alert>
      )}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="Email" error={err(state, "email")}>
        <Input {...fieldAria("email", err(state, "email"))} type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} />
      </Field>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
        </div>
        <PasswordInput {...fieldAria("password", err(state, "password"))} autoComplete="current-password" required />
        {err(state, "password") && <p id="password-error" role="alert" className="text-sm text-destructive">{err(state, "password")}</p>}
      </div>
      <SubmitButton className="w-full" size="lg" pendingText="Logging in…" disabled={disabled}>
        Log in
      </SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm({ disabled }: { disabled?: boolean }) {
  const [state, action] = useActionState(requestPasswordReset, initial);
  if (state.ok) return <Alert variant="success" title="Check your email">{state.message}</Alert>;
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormError state={state} />
      <Field id="email" label="Email" error={err(state, "email")}>
        <Input {...fieldAria("email", err(state, "email"))} type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Sending…" disabled={disabled}>
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormError state={state} />
      <Field id="password" label="New password" hint="At least 8 characters, with letters and numbers." error={err(state, "password")}>
        <PasswordInput {...fieldAria("password", err(state, "password"), true)} autoComplete="new-password" required />
      </Field>
      <Field id="confirmPassword" label="Confirm new password" error={err(state, "confirmPassword")}>
        <PasswordInput {...fieldAria("confirmPassword", err(state, "confirmPassword"))} autoComplete="new-password" required />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Saving…">
        Update password
      </SubmitButton>
    </form>
  );
}

export function ResendVerificationForm({ email, disabled }: { email?: string; disabled?: boolean }) {
  const [state, action] = useActionState(resendVerification, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      {state.ok && <Alert variant="success" title={state.message} />}
      <FormError state={state} />
      <Field id="email" label="Email address" error={err(state, "email")}>
        <Input {...fieldAria("email", err(state, "email"))} type="email" autoComplete="email" required defaultValue={state.values?.email ?? email} />
      </Field>
      <SubmitButton variant="secondary" className="w-full" pendingText="Sending…" disabled={disabled}>
        Resend verification email
      </SubmitButton>
    </form>
  );
}
