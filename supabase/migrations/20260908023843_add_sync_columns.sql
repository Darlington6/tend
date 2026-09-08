-- Adds updated_at (needed for last-write-wins conflict resolution during
-- device sync) and a soft-delete column for completions, matching the
-- on-device SQLite schema (lib/db.ts).

alter table public.rituals
  add column if not exists updated_at timestamptz not null default now();

alter table public.completions
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

-- The original unique (ritual_id, completed_at) constraint doesn't account
-- for soft deletes, replace it with a partial unique index.
alter table public.completions drop constraint if exists completions_ritual_id_completed_at_key;
drop index if exists completions_ritual_id_completed_at_key;
create unique index if not exists idx_completions_ritual_day
  on public.completions (ritual_id, completed_at)
  where deleted_at is null;
