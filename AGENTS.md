# Agent Instructions — hakuto

## Instruction Loading

1. Read this file before changing the repository.
2. Read the exact Expo SDK 57 documentation for the API being changed:
   <https://docs.expo.dev/versions/v57.0.0/>.
3. Inspect the affected screen, service, and tests before editing.
4. If `CLAUDE.md` exists, Claude Code may additionally read it for
   harness-specific tools and workflow; other agents do not require it.
5. This file owns repository behavior and validation. If instructions conflict,
   stop and ask for resolution.

## Working Agreement

- Measure the current behavior before changing code and prefer a root-cause
  fix. Document a temporary workaround with its removal condition.
- Never expose or commit credentials, tokens, private keys, or secrets.
- Confirm before destructive, irreversible, production, or externally visible
  operations. Use an isolated worktree for shared or multi-file changes.
- Run the relevant checks below. Final reports state the root cause, changed
  files, verification, and remaining limits.
- Record a decision before changing an external API, persisted data schema,
  security model, or application boundary.

## Overview

Hakuto is a private Expo Router application built with React Native,
TypeScript, Expo SDK 57, and local state managed by Zustand.

## File Map

| Change | Location |
|---|---|
| Application routing and screens | `app/` |
| Reusable UI | `components/` |
| Application state and services | `stores/`, `services/`, and adjacent modules |
| Tests | `__tests__/` and source-adjacent tests |
| Expo configuration | `app.json`, `package.json` |

Confirm the actual layout before extending a new area; this table is a routing
hint, not permission to create duplicate layers.

## Build & Test

- Test: `npm test`
- Start development server: `npm start`
- iOS build/run: `npm run ios`
- Android build/run: `npm run android`
- Web development: `npm run web`
- Type check: `npx tsc --noEmit`

## Commit Rules

- Use Conventional Commits.
- Use an isolated feature branch or worktree for multi-file work.
- Stage named files only. Never use `git add -A` or `git add .`.
- Do not add AI attribution to commit messages.
- Include regression coverage for behavior changes when the test surface
  permits it.

## Constraints

- Keep Expo, React Native, and Expo Router APIs compatible with SDK 57.
- Use the existing dependency versions; do not add or upgrade dependencies
  without explicit approval.
- Do not alter local persistence, authentication, or device-permission behavior
  without explicit approval and a rollback plan.
- Keep secrets out of Expo configuration and source control.

## Dependencies

Expo SDK 57, Expo Router, React 19, React Native, TypeScript, Jest, and
Zustand.

## Repository References

- `package.json` for the authoritative scripts and pinned dependency versions.
- Expo SDK 57 documentation for framework and platform API behavior.
