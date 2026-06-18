# UI-Kit Samples

This guide outlines the conventions for creating and maintaining samples in the `ui-kit`
repository.

Samples are not just examples — **samples are the scaffolding**. Each sample doubles as a
project starter that the `create-ui` CLI clones on demand, so every sample must run out of the
box, stay minimal, and be tested in CI alongside the libraries it depends on.

## Overview

Samples are organized under three entry-point folders that mirror the primary ways developers
consume the UI-Kit:

```
samples/
├── atomic/        # Pre-built UI components from @coveo/atomic / @coveo/atomic-react
├── headless/      # Custom UI built with @coveo/headless controllers
└── headless-ssr/  # Server-side rendering with @coveo/headless
```

## Naming convention

A sample is identified by three dimensions: **library**, **use case**, and **framework**.

| Dimension | Allowed values                                                          |
| --------- | ----------------------------------------------------------------------- |
| Library   | `atomic`, `headless`                                                    |
| Use case  | `search`, `commerce`, `insight`, `recommendation`                       |
| Framework | `vite` (vanilla), `react`, `angular`, `vuejs`, `nextjs`, `react-router` |

> **Vanilla / no framework:** use the `vite` token (the build tool), e.g. `search-vite`. Never
> use a bare `search`/`commerce` folder — the framework token must always be explicit.

**Folder:** `samples/<library>/<use-case>-<framework>`

**Package name:** `@samples/<library>-<use-case>-<framework>`

- Use **kebab-case** everywhere.
- The package name is a **single npm scope** (`@samples/...`) with dash-joined segments.
  Do **not** use a second slash in the scope (`@samples/atomic/search-react` is an invalid npm
  name).
- The package name must match the folder path, with the `/` after the library replaced by `-`.

### Canonical templates

These eight combinations are the supported scaffolding templates. The `--template` name (used by
`create-ui`) drops the `vite` token for vanilla; the CLI maps template names to folders.

| `--template`              | Folder                            | Package                            |
| ------------------------- | --------------------------------- | ---------------------------------- |
| `atomic-search`           | `samples/atomic/search-vite`      | `@samples/atomic-search-vite`      |
| `atomic-commerce`         | `samples/atomic/commerce-vite`    | `@samples/atomic-commerce-vite`    |
| `atomic-search-react`     | `samples/atomic/search-react`     | `@samples/atomic-search-react`     |
| `atomic-commerce-react`   | `samples/atomic/commerce-react`   | `@samples/atomic-commerce-react`   |
| `headless-search`         | `samples/headless/search-vite`    | `@samples/headless-search-vite`    |
| `headless-commerce`       | `samples/headless/commerce-vite`  | `@samples/headless-commerce-vite`  |
| `headless-search-react`   | `samples/headless/search-react`   | `@samples/headless-search-react`   |
| `headless-commerce-react` | `samples/headless/commerce-react` | `@samples/headless-commerce-react` |

## Sample conventions

Every sample **must**:

- **Run with zero configuration.** Use the `searchuisamples` organization through the sample
  credential helpers from `@coveo/headless` — no API keys, OAuth, search tokens, or `.env` files:
  - Search: `getSampleSearchEngineConfiguration()`
  - Commerce: `getSampleCommerceEngineConfiguration()`
  - Insight / Recommendation: `getSampleInsightEngineConfiguration()` /
    `getSampleRecommendationEngineConfiguration()`
- **Be self-contained and minimal.** Include only what the use case needs. No custom styling
  beyond what is required for basic usability.
- **Include a `README.md`** with: purpose, prerequisites, key features, and how to run.
- **Include a Playwright smoke test** that verifies the sample loads and renders.
- **Be private** (`"private": true`) and live under one of the three entry-point folders so it is
  picked up by the `samples/<entry-point>/*` workspace globs (no `pnpm-workspace.yaml` edit needed).

### Standard script contract

CI discovers samples through Turbo tasks, so scripts must follow this contract. Adding a sample
that respects it requires **no CI changes**.

| Script  | Required | Command              | Purpose                                                 |
| ------- | -------- | -------------------- | ------------------------------------------------------- |
| `dev`   | yes      | start the dev server | Local development and the scaffolded starter experience |
| `build` | yes      | production build     | Built by the `build`/`affected` pipeline                |
| `e2e`   | yes      | `playwright test`    | Run by the single affected-driven `samples-e2e` CI job  |
| `test`  | optional | `vitest run`         | Unit tests; run by `turbo test --affected` when present |

Rules:

- Playwright tests go under the **`e2e`** script (never `test`). `test` is reserved for unit
  tests so the two CI lanes stay separate.
- **Atomic-React exception:** samples that consume `@coveo/atomic-react` assets may add a
  `build:assets` step (copying `dist/assets`, `dist/lang`, `dist/themes`) and call it from a
  `predev`/`build` hook. This is the only permitted deviation from the standard scripts.

## How samples are tested in CI

- **Build & unit tests** are already affected-driven: `turbo build --affected` and
  `turbo test --affected` pick up any sample automatically.
- **E2E** runs through a single `samples-e2e` job that executes `turbo run e2e --affected` inside
  the Playwright container. Because a sample that depends on `@coveo/headless` or `@coveo/atomic`
  is automatically marked affected when those libraries change, a library change that breaks a
  sample is caught immediately — and adding a new sample needs **zero** CI edits.

## Creating a new sample — checklist

1. Pick the entry point (`atomic/`, `headless/`, `headless-ssr/`) and name the folder/package per
   the convention above.
2. Set `package.json` `name` to `@samples/<library>-<use-case>-<framework>`, `"private": true`.
3. Wire engine configuration with the appropriate `getSample*EngineConfiguration()` helper.
4. Implement the `dev`, `build`, and `e2e` scripts (and `test` if you add unit tests).
5. Add a `README.md` and at least one Playwright smoke test.
6. Verify locally:
   ```bash
   pnpm install
   pnpm --filter @samples/<library>-<use-case>-<framework> run build
   pnpm --filter @samples/<library>-<use-case>-<framework> run e2e
   ```
7. Open the PR — no `pnpm-workspace.yaml` or `ci.yml` changes should be required.

## Sample principles

- **Minimalism** — only the files needed for the demonstration.
- **Single purpose** — one use case per sample; don't showcase everything.
- **Clear intent** — the sample's purpose should be obvious at a glance.
- **Idiomatic** — follow framework and library best practices.
