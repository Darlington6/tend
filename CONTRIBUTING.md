# Contributing

## Branching

This repo uses **trunk-based development (GitHub Flow)**:

- `main` is always releasable.
- Work happens on short-lived branches named `<type>/<short-description>`, e.g. `feat/insights-screen`, `fix/streak-off-by-one`.
- Open a PR into `main`. CI (typecheck, lint, `expo-doctor`) must pass before merging.
- Prefer squash-merge so `main` history stays one commit per PR.

## Commit messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/), enforced locally via a `commit-msg` hook (commitlint) and in CI on every PR.

```
<type>(<optional scope>): <description>

[optional body]
```

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `perf`.

Examples:
```
feat(rituals): add streak-protection for Tend+ subscribers
fix(store): correct off-by-one in computeStreak for UTC midnight
chore(deps): bump expo-router to 57.0.20
```

## Local checks

```
npm run typecheck
npm run lint
```

Both also run in CI and as a pre-commit hook.

## Running the app

```
npm run start      # Metro + Expo Go / dev client
npm run ios         # opens iOS Simulator (requires Xcode)
npm run android     # opens Android emulator (requires Android Studio)
```
