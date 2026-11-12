/**
 * Hand-written row types for the tables the app reads today.
 * Once your Supabase project exists you can generate exact types with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */
export type Profile = {
  id: string;
  username: string | null;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  college: string | null;
  website_url: string | null;
  is_client: boolean;
  is_freelancer: boolean;
  onboarded_at: string | null;
  role: "user" | "admin";
  status: "active" | "suspended";
  identity_verified_at: string | null;
  created_at: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export type Skill = { id: number; slug: string; name: string; category_id: number | null };

export type Education = {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  start_year: number | null;
  end_year: number | null;
};

export type Experience = {
  id: string;
  title: string;
  organization: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  image_path: string | null;
};

export type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled" | "removed";

export type ProjectCard = {
  id: string;
  title: string;
  description: string;
  budget_type: "fixed" | "negotiable";
  budget_min: number;
  budget_max: number;
  deadline: string;
  status: ProjectStatus;
  proposal_count: number;
  created_at: string;
  category: Pick<Category, "name" | "slug"> | null;
  client: Pick<Profile, "full_name" | "username" | "avatar_url" | "identity_verified_at"> | null;
  skills: { skill: Pick<Skill, "name"> | null }[];
};

/** Standard shape returned by every Server Action to its form. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Echo of submitted text fields so the form can refill them after an error (React resets forms on submit). */
  values?: Record<string, string>;
};
