-- Cross-device sync schema for Tend.
-- Mirrors the on-device SQLite schema (lib/db.ts) but keyed by auth.uid()
-- instead of per-device autoincrement ids, so rows can merge across devices.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  time_of_day text not null default 'anytime' check (time_of_day in ('morning', 'evening', 'anytime')),
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ritual_id uuid not null references public.rituals (id) on delete cascade,
  completed_at date not null,
  created_at timestamptz not null default now(),
  unique (ritual_id, completed_at)
);

create index if not exists idx_rituals_user on public.rituals (user_id) where archived_at is null;
create index if not exists idx_completions_user_date on public.completions (user_id, completed_at);

alter table public.profiles enable row level security;
alter table public.rituals enable row level security;
alter table public.completions enable row level security;

create policy "profiles are self-accessible" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "rituals are self-accessible" on public.rituals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "completions are self-accessible" on public.completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
