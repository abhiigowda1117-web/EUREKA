-- =============================================================================
-- FORGE — initial schema
-- =============================================================================
-- This migration creates every core table the marketplace needs, even ones we
-- only start using in later milestones. Designing the whole data model up
-- front lets us get relationships and constraints right once.
--
-- SECURITY MODEL (read this before touching policies)
--   * Every table has Row Level Security (RLS) enabled.
--   * With RLS on and no policy, a table is DENY-ALL for normal users.
--   * We only add policies for features that exist. Tables used by later
--     milestones (proposals, messages, reviews, ...) stay locked until the
--     milestone that ships them adds policies or SECURITY DEFINER functions.
--   * Privileged fields (role, account status, identity verification) can
--     never be written by the user themselves — enforced with column grants.
-- =============================================================================

create extension if not exists citext;
create extension if not exists pg_trgm;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role         as enum ('user', 'admin');
create type public.account_status    as enum ('active', 'suspended');
create type public.budget_type       as enum ('fixed', 'negotiable');
create type public.project_status    as enum ('draft', 'open', 'in_progress', 'completed', 'cancelled', 'removed');
create type public.proposal_status   as enum ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn');
create type public.assignment_status as enum ('active', 'submitted', 'revision_requested', 'completed', 'cancelled');
-- Payments are NOT processed by FORGE in the MVP. This only tracks what the two
-- parties tell us about a payment they arranged themselves.
create type public.payment_status    as enum ('not_started', 'client_marked_paid', 'freelancer_confirmed', 'disputed');
create type public.report_reason     as enum ('spam', 'scam_or_fraud', 'academic_dishonesty', 'harassment', 'inappropriate_content', 'impersonation', 'other');
create type public.report_status     as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users — Supabase Auth owns the "users" table)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  username             citext unique
                         check (username ~ '^[a-z0-9](?:[a-z0-9_]{1,22}[a-z0-9])$'),
  full_name            text not null default ''
                         check (char_length(full_name) <= 80),
  headline             text check (char_length(headline) <= 120),
  bio                  text check (char_length(bio) <= 2000),
  avatar_url           text check (char_length(avatar_url) <= 500),
  location             text check (char_length(location) <= 80),
  college              text check (char_length(college) <= 120),
  website_url          text check (website_url ~* '^https?://' and char_length(website_url) <= 300),
  -- One account can be both. These are "intents", not permissions.
  is_client            boolean not null default false,
  is_freelancer        boolean not null default false,
  onboarded_at         timestamptz,
  -- Privileged columns: NOT writable by the user (see grants below).
  role                 public.user_role not null default 'user',
  status               public.account_status not null default 'active',
  identity_verified_at timestamptz,  -- set only by an admin after a real check
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper functions used inside policies. SECURITY DEFINER lets them read
-- profiles without recursively triggering profiles' own RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- -----------------------------------------------------------------------------
-- Profile details: education, experience, portfolio
-- -----------------------------------------------------------------------------
create table public.profile_education (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  institution text not null check (char_length(institution) between 2 and 120),
  degree      text check (char_length(degree) <= 120),
  field       text check (char_length(field) <= 120),
  start_year  smallint check (start_year between 1950 and 2100),
  end_year    smallint check (end_year between 1950 and 2100),
  created_at  timestamptz not null default now(),
  check (end_year is null or start_year is null or end_year >= start_year)
);
create index profile_education_profile_idx on public.profile_education (profile_id);

create table public.profile_experience (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 2 and 120),
  organization text check (char_length(organization) <= 120),
  description text check (char_length(description) <= 1000),
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index profile_experience_profile_idx on public.profile_experience (profile_id);

create table public.portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 2 and 120),
  description text check (char_length(description) <= 1000),
  project_url text check (project_url ~* '^https?://' and char_length(project_url) <= 300),
  image_path  text check (char_length(image_path) <= 500),
  created_at  timestamptz not null default now()
);
create index portfolio_items_profile_idx on public.portfolio_items (profile_id);

-- -----------------------------------------------------------------------------
-- Taxonomy: categories and skills (managed by admins)
-- -----------------------------------------------------------------------------
create table public.categories (
  id          smallint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null unique,
  description text,
  icon        text,          -- lucide icon name, rendered by the frontend
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.skills (
  id          integer generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null unique,
  category_id smallint references public.categories (id) on delete set null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.profile_skills (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  skill_id   integer not null references public.skills (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, skill_id)
);
create index profile_skills_skill_idx on public.profile_skills (skill_id);

-- -----------------------------------------------------------------------------
-- Projects
-- -----------------------------------------------------------------------------
create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.profiles (id) on delete cascade,
  category_id    smallint not null references public.categories (id),
  title          text not null check (char_length(title) between 10 and 120),
  description    text not null check (char_length(description) between 50 and 5000),
  deliverables   text check (char_length(deliverables) <= 2000),
  budget_type    public.budget_type not null default 'fixed',
  budget_min     integer not null check (budget_min >= 100),          -- whole rupees
  budget_max     integer not null check (budget_max <= 10000000),
  deadline       date not null,
  status         public.project_status not null default 'open',
  proposal_count integer not null default 0 check (proposal_count >= 0),
  search         tsvector generated always as (
                   setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                   setweight(to_tsvector('english', coalesce(description, '')), 'B')
                 ) stored,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (budget_max >= budget_min)
);
create index projects_status_created_idx on public.projects (status, created_at desc);
create index projects_client_idx         on public.projects (client_id);
create index projects_category_idx       on public.projects (category_id);
create index projects_search_idx         on public.projects using gin (search);

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_skills (
  project_id uuid not null references public.projects (id) on delete cascade,
  skill_id   integer not null references public.skills (id) on delete cascade,
  primary key (project_id, skill_id)
);
create index project_skills_skill_idx on public.project_skills (skill_id);

create table public.project_attachments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  uploaded_by  uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  file_name    text not null check (char_length(file_name) <= 200),
  mime_type    text not null,
  size_bytes   integer not null check (size_bytes > 0 and size_bytes <= 10485760), -- 10 MB
  created_at   timestamptz not null default now()
);
create index project_attachments_project_idx on public.project_attachments (project_id);

-- -----------------------------------------------------------------------------
-- Proposals and assignments
-- -----------------------------------------------------------------------------
create table public.proposals (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  freelancer_id   uuid not null references public.profiles (id) on delete cascade,
  cover_letter    text not null check (char_length(cover_letter) between 50 and 3000),
  proposed_amount integer not null check (proposed_amount between 100 and 10000000),
  estimated_days  smallint not null check (estimated_days between 1 and 365),
  status          public.proposal_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (project_id, freelancer_id)   -- one proposal per freelancer per project
);
create index proposals_freelancer_idx on public.proposals (freelancer_id, created_at desc);
create index proposals_project_idx    on public.proposals (project_id, created_at desc);

create trigger proposals_updated_at before update on public.proposals
  for each row execute function public.set_updated_at();

-- A client must never be able to bid on their own project.
create or replace function public.prevent_self_proposal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.projects where id = new.project_id and client_id = new.freelancer_id) then
    raise exception 'You cannot submit a proposal to your own project';
  end if;
  return new;
end;
$$;
create trigger proposals_no_self before insert on public.proposals
  for each row execute function public.prevent_self_proposal();

-- Keep projects.proposal_count accurate without the client being able to edit it.
create or replace function public.sync_proposal_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.projects set proposal_count = proposal_count + 1 where id = new.project_id;
  elsif tg_op = 'DELETE' then
    update public.projects set proposal_count = greatest(proposal_count - 1, 0) where id = old.project_id;
  end if;
  return null;
end;
$$;
create trigger proposals_count after insert or delete on public.proposals
  for each row execute function public.sync_proposal_count();

create table public.project_assignments (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null unique references public.projects (id) on delete cascade,
  proposal_id    uuid not null unique references public.proposals (id) on delete restrict,
  client_id      uuid not null references public.profiles (id) on delete cascade,
  freelancer_id  uuid not null references public.profiles (id) on delete cascade,
  agreed_amount  integer not null check (agreed_amount >= 100),
  agreed_terms   text check (char_length(agreed_terms) <= 3000),
  status         public.assignment_status not null default 'active',
  payment_status public.payment_status not null default 'not_started',
  started_at     timestamptz not null default now(),
  submitted_at   timestamptz,
  completed_at   timestamptz,
  updated_at     timestamptz not null default now(),
  check (client_id <> freelancer_id)
);
create index project_assignments_client_idx     on public.project_assignments (client_id);
create index project_assignments_freelancer_idx on public.project_assignments (freelancer_id);

create trigger project_assignments_updated_at before update on public.project_assignments
  for each row execute function public.set_updated_at();

create table public.deliverables (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.project_assignments (id) on delete cascade,
  submitted_by  uuid not null references public.profiles (id) on delete cascade,
  note          text not null check (char_length(note) between 1 and 3000),
  link_url      text check (link_url ~* '^https?://' and char_length(link_url) <= 500),
  storage_path  text check (char_length(storage_path) <= 500),
  created_at    timestamptz not null default now()
);
create index deliverables_assignment_idx on public.deliverables (assignment_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Messaging
-- -----------------------------------------------------------------------------
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references public.projects (id) on delete set null,
  assignment_id   uuid unique references public.project_assignments (id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  last_read_at    timestamptz,
  joined_at       timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);
create index conversation_participants_profile_idx on public.conversation_participants (profile_id);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 5000),
  created_at      timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Notifications
-- -----------------------------------------------------------------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null check (char_length(type) <= 50),
  title      text not null check (char_length(title) <= 200),
  body       text check (char_length(body) <= 1000),
  link       text check (link ~ '^/' and char_length(link) <= 300),   -- internal links only
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Reviews
-- -----------------------------------------------------------------------------
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.project_assignments (id) on delete cascade,
  reviewer_id   uuid not null references public.profiles (id) on delete cascade,
  reviewee_id   uuid not null references public.profiles (id) on delete cascade,
  rating        smallint not null check (rating between 1 and 5),
  comment       text check (char_length(comment) <= 2000),
  created_at    timestamptz not null default now(),
  unique (assignment_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);
create index reviews_reviewee_idx on public.reviews (reviewee_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Trust & safety: reports and admin audit log
-- -----------------------------------------------------------------------------
create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles (id) on delete cascade,
  target_user_id    uuid references public.profiles (id) on delete cascade,
  target_project_id uuid references public.projects (id) on delete cascade,
  target_message_id uuid references public.messages (id) on delete cascade,
  reason            public.report_reason not null,
  details           text check (char_length(details) <= 2000),
  status            public.report_status not null default 'open',
  resolved_by       uuid references public.profiles (id) on delete set null,
  resolved_at       timestamptz,
  created_at        timestamptz not null default now(),
  -- A report points at exactly one thing.
  check (num_nonnulls(target_user_id, target_project_id, target_message_id) = 1)
);
create index reports_status_idx on public.reports (status, created_at desc);

create table public.admin_actions (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles (id) on delete set null,
  action      text not null check (char_length(action) <= 60),
  target_type text not null check (char_length(target_type) <= 40),
  target_id   uuid,
  notes       text check (char_length(notes) <= 2000),
  created_at  timestamptz not null default now()
);
create index admin_actions_created_idx on public.admin_actions (created_at desc);

-- -----------------------------------------------------------------------------
-- Rate limiting for sensitive app actions (posting, proposing, reporting)
-- -----------------------------------------------------------------------------
create table public.rate_limit_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  action     text not null check (char_length(action) <= 40),
  created_at timestamptz not null default now()
);
create index rate_limit_events_lookup_idx on public.rate_limit_events (user_id, action, created_at desc);

-- Returns true and records the event if the user is under the limit.
-- Called from server code: select public.consume_rate_limit('post_project', 5, 3600);
create or replace function public.consume_rate_limit(p_action text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    return false;
  end if;
  select count(*) into v_count
  from public.rate_limit_events
  where user_id = v_uid
    and action = p_action
    and created_at > now() - make_interval(secs => p_window_seconds);
  if v_count >= p_max then
    return false;
  end if;
  insert into public.rate_limit_events (user_id, action) values (v_uid, p_action);
  return true;
end;
$$;

-- =============================================================================
-- PRIVILEGES
-- =============================================================================
-- Supabase grants broad table privileges to the `anon` and `authenticated`
-- roles by default; RLS then filters rows. We tighten profiles further with
-- COLUMN-level grants so a user can never promote themselves to admin,
-- un-suspend themselves or mark themselves as identity-verified.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, full_name, headline, bio, avatar_url, location, college,
              website_url, is_client, is_freelancer, onboarded_at)
  on public.profiles to authenticated;

-- Server-maintained counters/columns on projects are also not client-writable.
revoke insert, update on public.projects from anon, authenticated;
grant insert (client_id, category_id, title, description, deliverables, budget_type,
              budget_min, budget_max, deadline, status)
  on public.projects to authenticated;
grant update (category_id, title, description, deliverables, budget_type,
              budget_min, budget_max, deadline, status)
  on public.projects to authenticated;

revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles                  enable row level security;
alter table public.profile_education         enable row level security;
alter table public.profile_experience        enable row level security;
alter table public.portfolio_items           enable row level security;
alter table public.categories                enable row level security;
alter table public.skills                    enable row level security;
alter table public.profile_skills            enable row level security;
alter table public.projects                  enable row level security;
alter table public.project_skills            enable row level security;
alter table public.project_attachments       enable row level security;
alter table public.proposals                 enable row level security;
alter table public.project_assignments       enable row level security;
alter table public.deliverables              enable row level security;
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;
alter table public.notifications             enable row level security;
alter table public.reviews                   enable row level security;
alter table public.reports                   enable row level security;
alter table public.admin_actions             enable row level security;
alter table public.rate_limit_events         enable row level security;

-- ---- profiles ---------------------------------------------------------------
-- Public profiles are visible to everyone (that is the point of a marketplace)
-- except suspended accounts. You can always see your own row.
create policy "profiles: public read of active profiles"
  on public.profiles for select
  using (status = 'active' or id = auth.uid() or public.is_admin());

create policy "profiles: users update their own row"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- education / experience / portfolio / profile_skills ---------------------
-- Same rule for all four: anyone can read, only the owner (if active) can write.
create policy "education: public read"  on public.profile_education for select using (true);
create policy "education: owner insert" on public.profile_education for insert to authenticated
  with check (profile_id = auth.uid() and public.is_active_user());
create policy "education: owner update" on public.profile_education for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "education: owner delete" on public.profile_education for delete to authenticated
  using (profile_id = auth.uid());

create policy "experience: public read"  on public.profile_experience for select using (true);
create policy "experience: owner insert" on public.profile_experience for insert to authenticated
  with check (profile_id = auth.uid() and public.is_active_user());
create policy "experience: owner update" on public.profile_experience for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "experience: owner delete" on public.profile_experience for delete to authenticated
  using (profile_id = auth.uid());

create policy "portfolio: public read"  on public.portfolio_items for select using (true);
create policy "portfolio: owner insert" on public.portfolio_items for insert to authenticated
  with check (profile_id = auth.uid() and public.is_active_user());
create policy "portfolio: owner update" on public.portfolio_items for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "portfolio: owner delete" on public.portfolio_items for delete to authenticated
  using (profile_id = auth.uid());

create policy "profile_skills: public read"  on public.profile_skills for select using (true);
create policy "profile_skills: owner insert" on public.profile_skills for insert to authenticated
  with check (profile_id = auth.uid() and public.is_active_user());
create policy "profile_skills: owner delete" on public.profile_skills for delete to authenticated
  using (profile_id = auth.uid());

-- ---- categories / skills -----------------------------------------------------
create policy "categories: public read" on public.categories for select using (is_active or public.is_admin());
create policy "categories: admin write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "skills: public read" on public.skills for select using (is_active or public.is_admin());
create policy "skills: admin write" on public.skills for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- projects ----------------------------------------------------------------
-- Visible to everyone once published (not draft/removed). Owners and admins
-- always see their own. Creation/editing rules are finalised in Milestone 2.
create policy "projects: public read of published"
  on public.projects for select
  using (
    status in ('open', 'in_progress', 'completed')
    or client_id = auth.uid()
    or public.is_admin()
  );

create policy "projects: owner insert"
  on public.projects for insert to authenticated
  with check (
    client_id = auth.uid()
    and status in ('draft', 'open')
    and public.is_active_user()
  );

create policy "projects: owner update"
  on public.projects for update to authenticated
  using (client_id = auth.uid() and status in ('draft', 'open'))
  with check (client_id = auth.uid() and status in ('draft', 'open', 'cancelled'));

create policy "projects: admin moderate"
  on public.projects for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "project_skills: public read"
  on public.project_skills for select
  using (exists (select 1 from public.projects p where p.id = project_id));  -- inherits project visibility
create policy "project_skills: owner write"
  on public.project_skills for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid()));
create policy "project_skills: owner delete"
  on public.project_skills for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid()));

-- ---- notifications -----------------------------------------------------------
-- Users read their own notifications and may only mark them as read.
-- Notifications are created by SECURITY DEFINER functions, never by clients.
create policy "notifications: owner read"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy "notifications: owner mark read"
  on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke insert, update, delete on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- ---- admin-only tables ---------------------------------------------------------
create policy "admin_actions: admin read" on public.admin_actions for select to authenticated
  using (public.is_admin());

-- Tables intentionally left with NO policies yet (deny-all until their milestone):
--   project_attachments, proposals, project_assignments, deliverables,
--   conversations, conversation_participants, messages, reviews, reports,
--   rate_limit_events (only touched through consume_rate_limit()).
