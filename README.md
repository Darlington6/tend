# Tend

A habit-rituals tracker. Small morning and evening routines, tracked with one tap, built for [RevenueCat Shipaton 2026](https://www.shipaton.com/).

## What it does

- Add rituals (a name, an icon, a color, a time of day) and check them off with one tap, no forms, no friction.
- Streaks are computed from completion history, a miss today does not break the streak until tomorrow.
- Works fully offline. Local SQLite is the source of truth the app always reads from.
- Optional account (email and password) syncs rituals across devices via Supabase, last write wins on conflicts.
- Free tier caps at a few rituals, Tend+ (RevenueCat) unlocks unlimited rituals and deeper insights.

## Tech stack

- [Expo](https://expo.dev) (React Native, TypeScript, Expo Router)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local storage
- [Supabase](https://supabase.com) (Postgres, Auth) for accounts and cross-device sync
- [RevenueCat](https://www.revenuecat.com) (`react-native-purchases`, `react-native-purchases-ui`) for subscriptions and the paywall
- [Zustand](https://github.com/pmndrs/zustand) for client state
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for the completion animation

See `AGENTS.md` for the fuller technical notes and conventions this project follows.

## Getting started

```bash
npm install
cp .env.example .env   # fill in your own Supabase and RevenueCat keys
npm start
```

Native modules (RevenueCat) mean this app needs a custom dev client, plain Expo Go will not work. Build one with EAS (install the CLI globally, Expo recommends against a local project dependency):

```bash
npm install --global eas-cli
eas login
eas build --profile development --platform android   # or --platform ios
```

Then run `npm start` and open the app from that installed dev client instead of Expo Go.

## Project structure

```
app/            Expo Router screens
components/     Shared UI components and background managers (sync, purchases)
lib/            Data layer, stores, and integrations (SQLite, Supabase, RevenueCat)
constants/      Theme tokens, icon set, RevenueCat entitlement id
supabase/       Database schema (migrations) for the sync backend
```

## License

MIT, see `LICENSE`.
