# Tend

Habit-rituals tracker for RevenueCat Shipaton 2026. React Native + Expo (SDK 57, TypeScript, Expo Router).

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code — SDK 57 API surfaces (expo-sqlite, expo-router, reanimated v4) differ meaningfully from older SDKs.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint (`commit-msg` hook + CI). No `Co-Authored-By` trailer.
- **Branching:** trunk-based (GitHub Flow) — short-lived `<type>/<description>` branches, PR into `main`, squash-merge. See `CONTRIBUTING.md`.
- **Icons:** never hardcode emoji glyphs in source. Use `@expo/vector-icons` (`Ionicons`) with names from `RITUAL_ICONS` in `constants/theme.ts`.
- **State/data:** Zustand store (`lib/store.ts`) is the only thing components read from; it wraps the SQLite data layer (`lib/db.ts`). Don't query the DB directly from components.
- **Dates:** ritual completions are stored as local `YYYY-MM-DD` strings (`lib/date.ts`), not timestamps — keeps streak math (`lib/streak.ts`) simple and timezone-stable.
- **Backend:** Supabase (Postgres + Auth) for accounts/cross-device sync — see `supabase/` (schema in `supabase/migrations/`) and `lib/supabase.ts` (client). Local SQLite remains the source of truth for offline use; sync logic is not wired up yet (tracked as a follow-up).

## Before committing

`npm run typecheck && npm run lint` (also enforced by the pre-commit hook and CI).
