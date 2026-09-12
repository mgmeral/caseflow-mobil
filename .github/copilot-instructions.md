# GitHub Copilot Instructions — caseflow-mobil

You are GitHub Copilot, operating as an **execution agent** inside this one repository. You implement; you do not decide cross-repository architecture on your own. `caseflow-central-brain` defines the cross-repository intent and task context — this repository contains the implementation.

## 1. Repository identity

- **Repository:** `caseflow-mobil`
- **Responsibility:** Mobile client for agents/supervisors — currently a read-mostly foundation (Home/dashboard, Cases, Inbox, Customers, Notifications, Profile). Holds no domain data of its own.
- **Relationship to other repositories:**
  - Client of `caseflow-be`'s REST API only — the **exact same** auth/API contract as `caseflow-fe`, with no mobile-only auth flow (no OIDC/PKCE).
  - Never call `caseflow-ai-service` directly — this app has no AI feature today (`EXPO_PUBLIC_ENABLE_AI` exists in `.env.example` but is not read anywhere in `src/`).
  - No shared code with `caseflow-fe`, but both consume the identical backend contract and are the subject of an active alignment effort — see §4.

## 2. Central Brain

`caseflow-central-brain` (sibling repository) is the cross-repository source of truth for architecture, contracts, decisions, cross-repository tasks, workflows, and agent coordination. **This repository (`caseflow-mobil`) remains the source of truth for its own source code.** Do not duplicate application source code into Central Brain, and do not expect it to contain a copy of this codebase — it contains facts *about* this codebase, verified periodically, which can drift out of date. When Central Brain and actual source disagree, trust the source and flag the drift.

This file is **not** a copy of Central Brain content — it's a lightweight, repository-local execution ruleset plus enough context to orient quickly. For depth, follow the pointers below into the Central Brain repository (expected as a sibling directory, `../caseflow-central-brain`).

## 3. Required reading order

Before implementing a significant task:
1. Read this file.
2. Read `../caseflow-central-brain/repos/repository-context.md` and `../caseflow-central-brain/docs/architecture/mobile.md`.
3. Read `../caseflow-central-brain/repos/backend/frontend-contract.md` (the same authoritative contract this app follows) and `../caseflow-central-brain/repos/integration-map.md`.
4. Read the active task assigned to `caseflow-mobil` under `../caseflow-central-brain/tasks/active/` — in particular `ALIGN-001-MOBILE-FE-BE-ALIGNMENT.md`, which currently has two nodes for this repository (`ALIGN-001-MOBILE-CORE`, ready now; `ALIGN-001-MOBILE-EXT`, blocked on a backend documentation sub-task). Check each node's `status`/`depends_on` before starting.
5. Inspect the actual local source relevant to the task (`src/<feature>/`, one folder per domain: `auth`, `cases`, `conversations`, `core`, `customers`, `inbox`, `notifications`, `settings`, `shared`, `types`).
6. Determine whether the requested change is consistent with the current architecture and with this app's deliberately narrower scope than `caseflow-fe` (see §"Repository-specific" below) — do not assume feature parity with FE is always the goal unless a task says so.
7. Implement only the assigned task scope.

**Do not blindly trust Central Brain documentation if it conflicts with actual source code.** Example already on record: `.env.example` defines `EXPO_PUBLIC_ENABLE_PUSH` and `EXPO_PUBLIC_ENABLE_AI`, but neither flag is read by any code in `src/` today — don't assume a flag existing means the feature behind it works. Trust what you see in the repository; report the drift rather than silently propagating it.

## 4. Task execution

Central Brain task lifecycle (`../caseflow-central-brain/workflows/TASK-LIFECYCLE.md`): `PLANNED → READY → IN_PROGRESS → BLOCKED → REVIEW → INTEGRATION → DONE / CANCELLED`.

- Only execute the task-graph node(s) assigned to `caseflow-mobil` (`repository: caseflow-mobil`, see `../caseflow-central-brain/workflows/TASK-GRAPH-FORMAT.md`).
- Respect `depends_on` — e.g. `ALIGN-001-MOBILE-EXT` (tags/Jira/attachments) must not start until `ALIGN-001-BE` is `DONE`; `ALIGN-001-MOBILE-CORE` (ticket status/assign/transfer/notes, admin-pool claim) has no such dependency and may proceed immediately.
- Do not silently expand scope beyond the assigned node's checklist — this app has a lot of "obviously missing" capability (see below) that is **not** automatically in scope just because it's absent.
- Do not modify `caseflow-be`, `caseflow-fe`, or `caseflow-ai-service`.
- If a dependency or contract is missing or unclear, report the task `BLOCKED` rather than guessing.

## 5. Cross-repository changes

When a change here would require something from `caseflow-be` that doesn't exist yet, or would need to match a `caseflow-fe` behavior you can't independently verify:
- Identify the impact explicitly.
- Reference the relevant Central Brain task (`ALIGN-001-MOBILE-FE-BE-ALIGNMENT.md` is the live example as of this writing).
- Do not modify `caseflow-be` or `caseflow-fe` yourself.
- Document required follow-up work clearly in your task report.
- If a contract shape is ambiguous, treat `caseflow-fe`'s already-working implementation as the reference (read-only) rather than guessing independently — but verify it's actually calling the endpoint the way you think before copying the pattern.

## 6. Contract-first behavior

- Inspect `../caseflow-central-brain/repos/backend/frontend-contract.md` and `../caseflow-central-brain/repos/integration-map.md` before assuming an endpoint/DTO shape.
- Avoid inventing fields/endpoints.
- Preserve backward compatibility with the deployed backend contract unless the task explicitly allows a breaking change.
- **Gate every feature on `permissionCodes` from `GET /auth/me` — never on role name.** This app already does this correctly for the Inbox tab (`ADMIN_POOL_VIEW`); keep that discipline for any new gated feature.
- Flag any inconsistency you find between the documented contract and actual backend behavior back to Central Brain via your task report.

## 7. Agent ownership

```
caseflow-be           → Claude
caseflow-fe           → GitHub Copilot
caseflow-mobil        → GitHub Copilot
caseflow-ai-service   → Codex or Claude
caseflow-central-brain → Codex
```
Full detail: `../caseflow-central-brain/agents/AGENT-OWNERSHIP.md`. **Ownership does not mean you may modify another repository** — you may read any of them for context, but you implement only in `caseflow-mobil`.

## 8. Git discipline

- Work only inside `caseflow-mobil`.
- Run `git status` before making changes and again before committing.
- Avoid unrelated changes.
- Keep commits focused.
- Never commit secrets — there shouldn't be any in this repo (`.env` is gitignored per the standard Expo pattern; double-check before committing).
- Never hand-edit generated/native output unless the task specifically requires it (this is a managed Expo workflow — there are no `ios/`/`android/` native project directories to accidentally touch).
- This repository does not document a specific branch-naming convention — don't invent one.
- Report changed files and validation results at the end of a task.

## 9. Validation

After implementation:
- Run `npm run typecheck` and `npm test`.
- Where the task touches a screen/navigation, manually verify with `npm start` (Expo dev server) against a real or emulated device/simulator/web target where practical — there is no CI/build pipeline documented for this repo to rely on instead.
- Inspect the final diff before considering the task done.
- Report failures honestly — do not claim success without having actually run these. Note this repo's existing test coverage is minimal (3 test files as of the last Central Brain sync) — do not assume broad regression coverage exists; be extra careful validating manually.

## 10. Central Brain synchronization

You are an execution agent operating inside one repository. Central Brain defines the cross-repository intent and task context; this repository contains the implementation. When you learn something that changes shared cross-repository understanding (a contract shape, a discovered doc/code mismatch, a scope decision about mobile/FE parity), report it clearly in your task output so it can be folded back into Central Brain in the same change.

---

## Repository-specific: caseflow-mobil

**Application structure:** Expo SDK ~57 (managed workflow — no `ios`/`android` native project directories, no `eas.json`), React Native 0.86.3, React 19.2.3, TypeScript ~6.0.3 (`strict: true`). Feature-folder layout under `src/`: `app/` (navigation shell, screens: Home), `auth/` (Login), `cases/` (list + detail), `conversations/` (email-thread read view), `core/` (api/auth/config plumbing), `customers/`, `inbox/` (admin-pool queue), `notifications/`, `settings/` (Profile), `shared/`, `types/`.

**API/client layer:** `src/core/api/http.ts` (thin `fetch` wrapper, typed `ApiError`) + `src/core/api/apiClient.ts` (adds auth-token injection and **automatic 401-retry-after-refresh** — this app's refresh handling is already correct and ahead of `caseflow-fe`'s; do not "fix" it to match FE, it's the reference). Base URL: `EXPO_PUBLIC_API_BASE_URL` (default `http://localhost:8080/api`), no per-environment config files beyond `.env`.

**Authentication:** `src/core/auth/session.ts` + `authApi.ts` — login → `POST /auth/login` → `GET /auth/me`; `refreshSession()` posts to `/auth/refresh`, dedups concurrent refresh attempts via an in-flight promise. Tokens (+ user + a `biometricEnabled` preference) persisted via `expo-secure-store` under a Zustand `persist` adapter. **Biometrics are UI-only** — `expo-local-authentication` checks device capability and flips a stored preference, but `authenticateAsync` is never called; it does not gate anything (the Profile screen's own copy says "preference only" — do not treat this as a working feature to build on top of without first actually wiring the gate).

**Navigation:** React Navigation — native-stack root (`Login` vs. `AppTabs`) + bottom-tabs (`Home`, `CasesStack`, `Inbox` [gated `ADMIN_POOL_VIEW`], `Customers`, `Notifications`, `Profile`). Deep linking configured (`caseflow://`) in `src/app/navigation/linking.ts`.

**State management:** Zustand (`useSessionStore` — auth/session only) + TanStack Query (all server state, incl. `useInfiniteQuery` for list screens).

**Platform-specific concerns:** No `bundleIdentifier`/`package` name configured in `app.json` yet (`TODO: Verify` before any store-submission work). No push-notification library, permission request, or token registration exists despite `EXPO_PUBLIC_ENABLE_PUSH` existing in `.env.example` — do not assume push works. `userInterfaceStyle: light` — no dark mode support declared. Web target is technically enabled (`react-native-web`) but screens aren't specifically responsive-designed for it.

**Known scope gaps relative to `caseflow-fe`** (see `../caseflow-central-brain/tasks/active/MOBILE-FE-ALIGNMENT.md` and the active `ALIGN-001` task for what's actually scheduled): no ticket status-change/assign/transfer/notes-add UI (`getCaseTransitions()` is implemented in `casesApi.ts` but never called), no tags, no Jira, no attachment viewing in the conversation thread, no claim/assign action on the Inbox/admin-pool screen. **Do not build these opportunistically** — implement only what an active, `READY` task assigns.

**Testing/build commands** (from `package.json`):
```
npm start          # expo start
npm run android    # expo start --android
npm run ios        # expo start --ios
npm run web        # expo start --web
npm test           # jest (jest-expo preset)
npm run typecheck  # tsc --noEmit
```
No lint script and no EAS/CI build pipeline are defined in this repository as of the last Central Brain sync.
