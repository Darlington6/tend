# Tend

Habit-rituals tracker for RevenueCat Shipaton 2026. React Native + Expo (SDK 57, TypeScript, Expo Router).

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code. SDK 57 API surfaces (expo-sqlite, expo-router, reanimated v4) differ meaningfully from older SDKs.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint (`commit-msg` hook + CI). No `Co-Authored-By` trailer, ever, including in old history (check with `git log --format=%B`, not just current commit author identity).
- **Branching:** trunk-based (GitHub Flow), short-lived `<type>/<description>` branches, PR into `main`, squash-merge. See `CONTRIBUTING.md`.
- **Icons:** never hardcode emoji glyphs in source. Use `@expo/vector-icons` (`Ionicons`) with names from `RITUAL_ICONS` in `constants/theme.ts`.
- **State/data:** Zustand store (`lib/store.ts`) is the only thing components read from; it wraps the SQLite data layer (`lib/db.ts`). Don't query the DB directly from components.
- **Dates:** ritual completions are stored as local `YYYY-MM-DD` strings (`lib/date.ts`), not timestamps. Keeps streak math (`lib/streak.ts`) simple and timezone-stable.
- **Backend:** Supabase (Postgres + Auth) for accounts and cross-device sync, see `supabase/` (schema in `supabase/migrations/`) and `lib/supabase.ts` (client). Local SQLite (`lib/db.ts`) is always the source of truth the UI reads from; rows use client-generated UUIDs and a `dirty` flag. `lib/sync.ts` pushes dirty rows up then pulls remote rows down (last-write-wins on `updated_at`), triggered by `components/SyncManager.tsx` on sign-in and app foreground. Signed-out users work entirely offline; nothing calls Supabase until there is a session.
- **Repo/local tool config:** never commit `.claude/` or similar local tool directories. Check `git ls-files` before the first push of any new repo.
- **Writing style for this user:** no em dashes or en dashes anywhere, in commit messages, docs, or comments. Use commas, periods, or plain hyphens instead.

## Before committing

`npm run typecheck && npm run lint` (also enforced by the pre-commit hook and CI).
