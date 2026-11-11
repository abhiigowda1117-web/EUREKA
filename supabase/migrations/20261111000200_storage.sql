-- =============================================================================
-- FORGE — storage buckets
-- =============================================================================
-- Files live in Supabase Storage. Every object path starts with the uploader's
-- user id, e.g. "avatars/<user-id>/avatar-1731312000.webp". Policies compare
-- that first folder with auth.uid(), so nobody can overwrite someone else's file.
--
-- Bucket limits (size + MIME type) are enforced by Supabase itself, on top of
-- the checks our server code performs before uploading.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- Avatars and portfolio images are shown publicly on profiles.
  ('avatars', 'avatars', true, 2097152,                               -- 2 MB
     array['image/jpeg', 'image/png', 'image/webp']),
  ('portfolio', 'portfolio', true, 5242880,                           -- 5 MB
     array['image/jpeg', 'image/png', 'image/webp']),
  -- Project files and deliverables are PRIVATE: served via short-lived signed
  -- URLs to authorised users only (policies added in Milestones 2 and 4).
  ('project-attachments', 'project-attachments', false, 10485760,     -- 10 MB
     array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain',
           'application/zip',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
           'application/vnd.openxmlformats-officedocument.presentationml.presentation',
           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('deliverables', 'deliverables', false, 26214400,                   -- 25 MB
     array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain',
           'application/zip',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
           'application/vnd.openxmlformats-officedocument.presentationml.presentation',
           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do nothing;

-- ---- avatars & portfolio: public read, owner-only write -----------------------
create policy "avatars: owner upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "portfolio: owner upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portfolio: owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portfolio: owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
