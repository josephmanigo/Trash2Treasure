create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  avatar_url text,
  method text not null default 'email' check (method in ('email', 'google', 'guest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null and email <> '';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are readable by owner'
  ) then
    execute 'create policy "Profiles are readable by owner" on public.profiles for select using (auth.uid() = id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are insertable by owner'
  ) then
    execute 'create policy "Profiles are insertable by owner" on public.profiles for insert with check (auth.uid() = id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are updatable by owner'
  ) then
    execute 'create policy "Profiles are updatable by owner" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Avatar images are publicly readable'
  ) then
    execute 'create policy "Avatar images are publicly readable" on storage.objects for select using (bucket_id = ''avatars'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own avatars'
  ) then
    execute 'create policy "Users can upload their own avatars" on storage.objects for insert with check (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own avatars'
  ) then
    execute 'create policy "Users can update their own avatars" on storage.objects for update using (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their own avatars'
  ) then
    execute 'create policy "Users can delete their own avatars" on storage.objects for delete using (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end;
$$;
