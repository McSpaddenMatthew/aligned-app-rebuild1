-- Run these statements in your Supabase SQL editor
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  candidate_name text not null,
  role_title text not null,
  company_name text not null,
  status text default 'draft',
  hm_name text,
  share_token text unique,
  report jsonb,
  raw_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table summaries enable row level security;

create policy "Users can manage their profile" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their summaries" on summaries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can read their summaries" on summaries
  for select using (auth.uid() = user_id);

create policy "Users can update their summaries" on summaries
  for update using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated, service_role;
