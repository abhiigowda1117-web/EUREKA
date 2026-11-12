"use client";

import { Camera, ExternalLink, Trash2 } from "lucide-react";
import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import {
  addEducation, addExperience, addPortfolioItem, deleteProfileItem, removeAvatar, updateBasics, updateSkills, uploadAvatar,
} from "@/app/settings/profile/actions";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { SkillGroup } from "@/lib/queries/profiles";
import type { ActionState, Education, Experience, PortfolioItem, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AVATAR_MAX_BYTES, MAX_SKILLS } from "@/lib/validation/profile";

const initial: ActionState = {};

function Status({ state }: { state: ActionState }) {
  if (state.error) return <Alert variant="error" title={state.error} />;
  if (state.ok && state.message) return <Alert variant="success" title={state.message} />;
  return null;
}

// ---------------------------------------------------------------------------
// Photo
// ---------------------------------------------------------------------------
export function AvatarForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(uploadAvatar, initial);
  const [removeState, setRemoveState] = useState<ActionState>(initial);
  const [removing, startRemove] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="space-y-4">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
          <img src={preview} alt="Selected photo preview" className="size-20 rounded-full object-cover ring-1 ring-white/10" />
        ) : (
          <Avatar src={profile.avatar_url} name={profile.full_name} size={80} />
        )}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              <Camera aria-hidden /> Choose photo
            </Button>
            {preview && <SubmitButton size="sm" pendingText="Uploading…">Save photo</SubmitButton>}
            {!preview && profile.avatar_url && (
              <Button
                variant="ghost"
                size="sm"
                disabled={removing}
                onClick={() => startRemove(async () => setRemoveState(await removeAvatar()))}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 2 MB. A clear photo of your face builds trust.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Profile photo"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setClientError(null);
          if (!file) return setPreview(null);
          if (file.size > AVATAR_MAX_BYTES) {
            setClientError("That image is larger than 2 MB.");
            e.target.value = "";
            return setPreview(null);
          }
          setPreview(URL.createObjectURL(file));
        }}
      />
      {clientError && <Alert variant="error" title={clientError} />}
      <Status state={state} />
      <Status state={removeState} />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Basics
// ---------------------------------------------------------------------------
export function BasicsForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateBasics, initial);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const v = (k: string, fallback: string | null) => state.values?.[k] ?? fallback ?? "";

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label="Full name" error={err("fullName")}>
          <Input {...fieldAria("fullName", err("fullName"))} autoComplete="name" defaultValue={v("fullName", profile.full_name)} required />
        </Field>
        <Field id="headline" label="Professional headline" optional error={err("headline")}>
          <Input {...fieldAria("headline", err("headline"))} maxLength={120} placeholder="e.g. React developer & UI designer" defaultValue={v("headline", profile.headline)} />
        </Field>
      </div>
      <Field id="bio" label="About you" optional hint="What do you do well? What have you built? 50+ characters recommended." error={err("bio")}>
        <Textarea {...fieldAria("bio", err("bio"), true)} rows={5} maxLength={2000} defaultValue={v("bio", profile.bio)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="college" label="College or organisation" optional error={err("college")}>
          <Input {...fieldAria("college", err("college"))} defaultValue={v("college", profile.college)} />
        </Field>
        <Field id="location" label="City" optional error={err("location")}>
          <Input {...fieldAria("location", err("location"))} autoComplete="address-level2" placeholder="e.g. Bengaluru" defaultValue={v("location", profile.location)} />
        </Field>
      </div>
      <Field id="websiteUrl" label="Website, GitHub or LinkedIn" optional error={err("websiteUrl")}>
        <Input {...fieldAria("websiteUrl", err("websiteUrl"))} type="url" inputMode="url" placeholder="https://" defaultValue={v("websiteUrl", profile.website_url)} />
      </Field>
      <fieldset>
        <legend className="text-sm font-medium">I want to</legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isClient" defaultChecked={profile.is_client} className="size-4 accent-[var(--primary)]" /> Hire talent (client)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFreelancer" defaultChecked={profile.is_freelancer} className="size-4 accent-[var(--primary)]" /> Find work (freelancer)
          </label>
        </div>
        {err("roles") && <p role="alert" className="mt-2 text-sm text-destructive">{err("roles")}</p>}
      </fieldset>
      <Status state={state} />
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export function SkillsForm({ groups, selected }: { groups: SkillGroup[]; selected: number[] }) {
  const [state, action] = useActionState(updateSkills, initial);
  const [picked, setPicked] = useState(() => new Set(selected));
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, skills: g.skills.filter((s) => s.name.toLowerCase().includes(q)) }))
      .filter((g) => g.skills.length > 0);
  }, [groups, query]);

  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SKILLS) next.add(id);
      return next;
    });

  return (
    <form action={action} className="space-y-4">
      {[...picked].map((id) => <input key={id} type="hidden" name="skills" value={id} />)}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input type="search" placeholder="Search skills…" aria-label="Search skills" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
        <p className="text-sm text-muted-foreground" aria-live="polite">{picked.size} / {MAX_SKILLS} selected</p>
      </div>
      <div className="max-h-96 space-y-5 overflow-y-auto rounded-lg border border-border p-4">
        {filtered.map((g) => (
          <div key={g.category.id}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle-foreground">{g.category.name}</p>
            <div className="flex flex-wrap gap-2">
              {g.skills.map((s) => {
                const on = picked.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    disabled={!on && picked.size >= MAX_SKILLS}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40",
                      on ? "border-primary bg-primary/15 text-blue-200" : "border-border-strong text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No skills match “{query}”.</p>}
      </div>
      <Status state={state} />
      <SubmitButton pendingText="Saving…">Save skills</SubmitButton>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Education / experience / portfolio — list + add form
// ---------------------------------------------------------------------------
function DeleteButton({ kind, id, label }: { kind: "education" | "experience" | "portfolio"; id: string; label: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove ${label}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Remove “${label}”?`)) return;
          start(async () => {
            const res = await deleteProfileItem(kind, id);
            setError(res.error ?? null);
          });
        }}
      >
        <Trash2 aria-hidden />
      </Button>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ItemRow({ title, meta, body, link, children }: { title: string; meta?: string; body?: string | null; link?: string | null; children: React.ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-border bg-white/[0.02] p-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
        {body && <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{body}</p>}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer nofollow" className="mt-1.5 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            {link.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" aria-hidden />
          </a>
        )}
      </div>
      {children}
    </li>
  );
}

/**
 * Shared logic for "add item" forms. React resets a form after its action
 * finishes; on error we refill the fields from state.values, on success we
 * leave them empty so the next item can be typed.
 */
function useAddForm(action: (prev: ActionState, fd: FormData) => Promise<ActionState>) {
  const [state, formAction] = useActionState(action, initial);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  return { state, formAction, err };
}

export function EducationSection({ items }: { items: Education[] }) {
  const { state, formAction, err } = useAddForm(addEducation);
  const years = (e: Education) => [e.start_year, e.end_year ?? (e.start_year ? "Present" : null)].filter(Boolean).join(" – ");
  return (
    <div className="space-y-5">
      {items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((e) => (
            <ItemRow key={e.id} title={e.institution} meta={[[e.degree, e.field].filter(Boolean).join(", "), years(e)].filter(Boolean).join(" · ")}>
              <DeleteButton kind="education" id={e.id} label={e.institution} />
            </ItemRow>
          ))}
        </ul>
      )}
      <form action={formAction} className="space-y-4 rounded-lg border border-dashed border-border-strong p-4" noValidate>
        <p className="text-sm font-medium">Add education</p>
        <Field id="institution" label="Institution" error={err("institution")}>
          <Input {...fieldAria("institution", err("institution"))} defaultValue={state.ok ? "" : state.values?.institution} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="degree" label="Degree" optional error={err("degree")}>
            <Input {...fieldAria("degree", err("degree"))} placeholder="e.g. B.E." defaultValue={state.ok ? "" : state.values?.degree} />
          </Field>
          <Field id="field" label="Field of study" optional error={err("field")}>
            <Input {...fieldAria("field", err("field"))} placeholder="e.g. Computer Science" defaultValue={state.ok ? "" : state.values?.field} />
          </Field>
          <Field id="startYear" label="Start year" optional error={err("startYear")}>
            <Input {...fieldAria("startYear", err("startYear"))} type="number" inputMode="numeric" min={1950} max={2100} defaultValue={state.ok ? "" : state.values?.startYear} />
          </Field>
          <Field id="endYear" label="End year (or expected)" optional error={err("endYear")}>
            <Input {...fieldAria("endYear", err("endYear"))} type="number" inputMode="numeric" min={1950} max={2100} defaultValue={state.ok ? "" : state.values?.endYear} />
          </Field>
        </div>
        <Status state={state} />
        <SubmitButton variant="secondary" size="sm" pendingText="Adding…">Add education</SubmitButton>
      </form>
    </div>
  );
}

export function ExperienceSection({ items }: { items: Experience[] }) {
  const { state, formAction, err } = useAddForm(addExperience);
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null);
  return (
    <div className="space-y-5">
      {items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((e) => (
            <ItemRow
              key={e.id}
              title={e.title}
              meta={[e.organization, [fmt(e.start_date), e.start_date ? (fmt(e.end_date) ?? "Present") : null].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
              body={e.description}
            >
              <DeleteButton kind="experience" id={e.id} label={e.title} />
            </ItemRow>
          ))}
        </ul>
      )}
      <form action={formAction} className="space-y-4 rounded-lg border border-dashed border-border-strong p-4" noValidate>
        <p className="text-sm font-medium">Add experience</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="title" label="Role / title" error={err("title")}>
            <Input {...fieldAria("title", err("title"))} placeholder="e.g. Web Development Intern" defaultValue={state.ok ? "" : state.values?.title} required />
          </Field>
          <Field id="organization" label="Organisation" optional error={err("organization")}>
            <Input {...fieldAria("organization", err("organization"))} defaultValue={state.ok ? "" : state.values?.organization} />
          </Field>
          <Field id="startDate" label="Start" optional error={err("startDate")}>
            <Input {...fieldAria("startDate", err("startDate"))} type="month" defaultValue={state.ok ? "" : state.values?.startDate} />
          </Field>
          <Field id="endDate" label="End (leave empty if current)" optional error={err("endDate")}>
            <Input {...fieldAria("endDate", err("endDate"))} type="month" defaultValue={state.ok ? "" : state.values?.endDate} />
          </Field>
        </div>
        <Field id="description" label="What did you do?" optional error={err("description")}>
          <Textarea {...fieldAria("description", err("description"))} rows={3} maxLength={1000} defaultValue={state.ok ? "" : state.values?.description} />
        </Field>
        <Status state={state} />
        <SubmitButton variant="secondary" size="sm" pendingText="Adding…">Add experience</SubmitButton>
      </form>
    </div>
  );
}

export function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  const { state, formAction, err } = useAddForm(addPortfolioItem);
  return (
    <div className="space-y-5">
      {items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((p) => (
            <ItemRow key={p.id} title={p.title} body={p.description} link={p.project_url}>
              <DeleteButton kind="portfolio" id={p.id} label={p.title} />
            </ItemRow>
          ))}
        </ul>
      )}
      <form action={formAction} className="space-y-4 rounded-lg border border-dashed border-border-strong p-4" noValidate>
        <p className="text-sm font-medium">Add a portfolio project</p>
        <Field id="ptitle" label="Project title" error={err("title")}>
          <Input {...fieldAria("ptitle", err("title"))} name="title" defaultValue={state.ok ? "" : state.values?.title} required />
        </Field>
        <Field id="projectUrl" label="Link (live site, GitHub, Behance…)" optional error={err("projectUrl")}>
          <Input {...fieldAria("projectUrl", err("projectUrl"))} type="url" inputMode="url" placeholder="https://" defaultValue={state.ok ? "" : state.values?.projectUrl} />
        </Field>
        <Field id="pdescription" label="Short description" optional error={err("description")}>
          <Textarea {...fieldAria("pdescription", err("description"))} name="description" rows={3} maxLength={1000} defaultValue={state.ok ? "" : state.values?.description} />
        </Field>
        <Status state={state} />
        <SubmitButton variant="secondary" size="sm" pendingText="Adding…">Add project</SubmitButton>
      </form>
    </div>
  );
}
