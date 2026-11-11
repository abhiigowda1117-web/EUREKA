import { Alert } from "@/components/ui/alert";

/** Shown wherever a feature needs Supabase but .env.local hasn't been filled in yet. */
export function SetupNotice({ className }: { className?: string }) {
  return (
    <Alert variant="warning" title="Supabase is not connected yet" className={className}>
      Accounts and data need a Supabase project. Copy <code>.env.example</code> to <code>.env.local</code>, add your
      project URL and publishable key, then restart <code>npm run dev</code>. See the README for step-by-step setup.
    </Alert>
  );
}
