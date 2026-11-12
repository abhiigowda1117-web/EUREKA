-- =============================================================================
-- Milestone 1 security tests.
-- Each block acts as a specific user (or anonymous visitor) and asserts that
-- the database allows what it should and REFUSES what it should.
-- Run with: npm run test:db
-- =============================================================================
\set ON_ERROR_STOP 1
\set QUIET 1

-- Helper: become a user (empty string = anonymous visitor)
create or replace function pg_temp.act_as(p_role text, p_uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_uid, false);
  execute format('set role %I', p_role);
end $$;

-- Two users sign up. The trigger must create their profiles.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'asha@example.com',  '{"full_name":"Asha Rao"}'),
  ('22222222-2222-2222-2222-222222222222', 'vikram@example.com','{"full_name":"Vikram S"}');

do $$ begin
  assert (select count(*) from public.profiles) = 2, 'signup trigger should create 2 profiles';
  assert (select full_name from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'Asha Rao',
    'full_name should be copied from signup metadata';
  assert (select count(*) from public.categories) = 15, 'expected 15 categories';
  assert (select count(*) from public.skills) >= 40, 'expected starter skills';
  assert (select count(*) from storage.buckets) = 4, 'expected 4 storage buckets';
  raise notice 'PASS  signup trigger, reference data and buckets';
end $$;

-- ---------------------------------------------------------------------------
-- Asha (user 1)
-- ---------------------------------------------------------------------------
select pg_temp.act_as('authenticated', '11111111-1111-1111-1111-111111111111') \gset

do $$ begin
  update public.profiles set username = 'asha_rao', headline = 'Full-stack dev', is_freelancer = true,
         onboarded_at = now()
   where id = auth.uid();
  assert (select username::text from public.profiles where id = auth.uid()) = 'asha_rao', 'own profile update failed';
  raise notice 'PASS  user can edit allowed fields on own profile';
end $$;

do $$ begin
  begin
    update public.profiles set role = 'admin' where id = auth.uid();
    raise exception 'FAIL  user was able to make themselves admin';
  exception when insufficient_privilege then
    raise notice 'PASS  user cannot change own role (privilege escalation blocked)';
  end;
  begin
    update public.profiles set identity_verified_at = now() where id = auth.uid();
    raise exception 'FAIL  user was able to self-verify identity';
  exception when insufficient_privilege then
    raise notice 'PASS  user cannot mark themselves identity-verified';
  end;
  begin
    update public.profiles set status = 'active' where id = auth.uid();
    raise exception 'FAIL  user was able to change account status';
  exception when insufficient_privilege then
    raise notice 'PASS  user cannot change own account status';
  end;
end $$;

do $$
declare n int;
begin
  update public.profiles set headline = 'hacked' where id = '22222222-2222-2222-2222-222222222222';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL  user modified someone else''s profile';
  raise notice 'PASS  user cannot edit another user''s profile';
end $$;

do $$ begin
  begin
    update public.profiles set username = 'Bad Name!' where id = auth.uid();
    raise exception 'FAIL  invalid username accepted';
  exception when check_violation then
    raise notice 'PASS  invalid usernames are rejected by the database';
  end;
end $$;

do $$ begin
  insert into public.profile_skills (profile_id, skill_id)
    select auth.uid(), id from public.skills where slug in ('react', 'nextjs');
  assert (select count(*) from public.profile_skills where profile_id = auth.uid()) = 2, 'own skills insert failed';
  begin
    insert into public.profile_skills (profile_id, skill_id)
      select '22222222-2222-2222-2222-222222222222', id from public.skills where slug = 'python';
    raise exception 'FAIL  user added a skill to someone else''s profile';
  exception when insufficient_privilege then
    raise notice 'PASS  skills: own insert works, foreign insert blocked';
  end;
end $$;

do $$ begin
  insert into public.portfolio_items (profile_id, title, project_url)
    values (auth.uid(), 'College fest website', 'https://example.com');
  begin
    insert into public.portfolio_items (profile_id, title)
      values ('22222222-2222-2222-2222-222222222222', 'Fake item');
    raise exception 'FAIL  user added portfolio item to someone else';
  exception when insufficient_privilege then
    raise notice 'PASS  portfolio: own insert works, foreign insert blocked';
  end;
end $$;

do $$ begin
  begin
    insert into public.categories (slug, name) values ('hacked', 'Hacked');
    raise exception 'FAIL  normal user created a category';
  exception when insufficient_privilege then
    raise notice 'PASS  normal users cannot manage categories';
  end;
end $$;

do $$ begin
  insert into public.projects (client_id, category_id, title, description, budget_min, budget_max, deadline)
  values (auth.uid(), 1, 'Build a landing page for my startup',
          repeat('Need a responsive landing page with a contact form. ', 3), 2000, 5000, current_date + 14);
  begin
    insert into public.projects (client_id, category_id, title, description, budget_min, budget_max, deadline)
    values ('22222222-2222-2222-2222-222222222222', 1, 'Impersonated project post',
            repeat('This should never be allowed to be inserted at all. ', 2), 2000, 5000, current_date + 14);
    raise exception 'FAIL  user posted a project as someone else';
  exception when insufficient_privilege then
    raise notice 'PASS  projects: own insert works, impersonation blocked';
  end;
  begin
    update public.projects set proposal_count = 999 where client_id = auth.uid();
    raise exception 'FAIL  user edited proposal_count';
  exception when insufficient_privilege then
    raise notice 'PASS  server-managed proposal_count is not client-writable';
  end;
  begin
    insert into public.projects (client_id, category_id, title, description, budget_min, budget_max, deadline)
    values (auth.uid(), 1, 'Budget range is upside down',
            repeat('Max budget lower than min must be rejected outright. ', 2), 9000, 1000, current_date + 14);
    raise exception 'FAIL  invalid budget range accepted';
  exception when check_violation then
    raise notice 'PASS  budget_max < budget_min rejected';
  end;
end $$;

do $$ begin
  begin
    insert into public.notifications (user_id, type, title)
    values ('22222222-2222-2222-2222-222222222222', 'spam', 'You won a prize');
    raise exception 'FAIL  user created a notification for someone else';
  exception when insufficient_privilege then
    raise notice 'PASS  users cannot create notifications';
  end;
end $$;

do $$ begin
  -- Locked tables (later milestones) must be completely unreadable/unwritable.
  assert (select count(*) from public.messages) = 0;
  begin
    insert into public.messages (conversation_id, sender_id, body)
    values (gen_random_uuid(), auth.uid(), 'hello');
    raise exception 'FAIL  messages table is writable before Milestone 4';
  exception when insufficient_privilege or foreign_key_violation then
    raise notice 'PASS  messages locked until Milestone 4';
  end;
end $$;

do $$ begin
  assert public.consume_rate_limit('test_action', 2, 60) = true;
  assert public.consume_rate_limit('test_action', 2, 60) = true;
  assert public.consume_rate_limit('test_action', 2, 60) = false, 'third call should be rate limited';
  raise notice 'PASS  rate limiter allows 2 then blocks';
end $$;

-- Storage: own folder ok, other user's folder blocked
do $$ begin
  insert into storage.objects (bucket_id, name) values ('avatars', '11111111-1111-1111-1111-111111111111/a.webp');
  begin
    insert into storage.objects (bucket_id, name) values ('avatars', '22222222-2222-2222-2222-222222222222/a.webp');
    raise exception 'FAIL  user uploaded into another user''s avatar folder';
  exception when insufficient_privilege then
    raise notice 'PASS  storage: avatar upload restricted to own folder';
  end;
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Suspended user cannot create content; hidden from the public
-- ---------------------------------------------------------------------------
update public.profiles set status = 'suspended' where id = '22222222-2222-2222-2222-222222222222';
select pg_temp.act_as('authenticated', '22222222-2222-2222-2222-222222222222') \gset
do $$ begin
  begin
    insert into public.portfolio_items (profile_id, title) values (auth.uid(), 'Should fail');
    raise exception 'FAIL  suspended user created content';
  exception when insufficient_privilege then
    raise notice 'PASS  suspended users cannot create content';
  end;
end $$;
reset role;

-- ---------------------------------------------------------------------------
-- Anonymous visitor
-- ---------------------------------------------------------------------------
select pg_temp.act_as('anon', '') \gset
do $$ begin
  assert (select count(*) from public.profiles) = 1, 'anon should only see the 1 active profile';
  assert (select count(*) from public.projects where status = 'open') = 1, 'anon should see open projects';
  assert (select count(*) from public.categories) = 15, 'anon should see categories';
  raise notice 'PASS  anonymous visitors see active profiles, open projects, categories';
  begin
    update public.profiles set headline = 'anon edit' where true;
    raise exception 'FAIL  anonymous visitor edited a profile';
  exception when insufficient_privilege then
    raise notice 'PASS  anonymous visitors cannot edit profiles';
  end;
end $$;
reset role;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';
select pg_temp.act_as('authenticated', '11111111-1111-1111-1111-111111111111') \gset
do $$ begin
  assert (select count(*) from public.profiles) = 2, 'admin should see suspended profiles too';
  insert into public.categories (slug, name) values ('admin-added', 'Admin Added');
  raise notice 'PASS  admins see suspended users and can manage categories';
end $$;
reset role;

\echo 'All Milestone 1 database security tests passed.'
