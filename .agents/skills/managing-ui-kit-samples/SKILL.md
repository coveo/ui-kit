---
name: managing-ui-kit-samples
description: Creates, modifies, and publishes the Coveo UI-Kit samples under samples/ (Atomic and Headless, search and commerce, across vanilla/React/Angular/Next.js) that double as the npm create @coveo/ui scaffolding templates. Use when adding a new sample, changing an existing one, making a sample publishable, keeping samples consistent (features, styling, tests, script contract), or debugging their publish/lockfile/CI setup.
license: Apache-2.0
metadata:
  author: coveo
  version: '2.0'
---

# Managing UI-Kit Samples

The apps under `samples/` are **dual-purpose**: living documentation for the
Coveo libraries **and** the source templates published to npm as
`@coveo/ui-kit-sample-<name>` and fetched by `npm create @coveo/ui`. Part of
epic KIT-5452 ("Improve Atomic & Headless Samples/Scaffolding"). Every change
must keep them consistent, runnable out of the box, tested, and publishable.

This skill is the actionable layer on top of the canonical standard in
[`samples/CONTRIBUTING.md`](../../../samples/CONTRIBUTING.md) — read that first.
It adds the cross-cutting recipe and the error-prone publishing/lockfile
mechanics (see [`references/publishing.md`](references/publishing.md)).

## When to use

- Adding a new sample (any library/framework in the matrix below).
- Modifying an existing one (a feature/component, styling, a fix).
- Making a sample publishable, or auditing that samples stay consistent.
- Debugging a sample's publish output, a broken lockfile after a rebase, or its
  e2e CI wiring.

## The template matrix

Samples span two axes. `samples = scaffolding`: each folder is published 1:1 as a
`--template`.

| Category (folder)   | Library                             | Use cases          | Frameworks                              |
| ------------------- | ----------------------------------- | ------------------ | --------------------------------------- |
| `atomic/`           | `@coveo/atomic`, `@coveo/atomic-react` | search, commerce | vanilla (Vite), React, Angular, Next.js, Vue |
| `headless/`         | `@coveo/headless` (client-side)     | search, commerce   | vanilla (Vite, e.g. Lit), React         |
| `headless-ssr/`     | `@coveo/headless` (SSR)             | search, commerce   | Next.js, Express, React Router          |
| `thermidor/`        | `@coveo/thermidor`                  | conversation, search | React                                  |

Framework version policy: support **current + previous major** of Angular,
React, Next.js.

## Golden rules

1. **Keep samples consistent.** A feature, style, a11y fix, or convention change
   in one sample usually belongs in its siblings (mirror across React and
   vanilla/Lit; across search and commerce where applicable).
2. **Zero-config & self-contained.** Runs after `pnpm install` with no
   credentials — only the public `searchuisamples` org via
   `getSampleSearchEngineConfiguration()` /
   `getSampleCommerceEngineConfiguration()`. **Search samples set the search hub
   to `BarcaKnowledge`.** No `.env`, no OAuth.
3. **The published copy must install & build for an outside user.** No internal
   workspace packages (e.g. `@coveo/platform-mock-api`) or test tooling may reach
   a scaffolded project — the prepack builder enforces this.
4. **Minimal & single-purpose.** One library + framework per sample; simple,
   readable code a non-developer can follow.
5. **Verify, don't assume.** End with build + lint + e2e, and for publish changes
   run the scaffold deploy-test.

## Relationship to the CLI

`npm create @coveo/ui@latest my-app --template <id>` downloads the published
`@coveo/ui-kit-sample-<id>` tarball (via `pacote`), renames it, and installs.
Sample versions are **fixed in lockstep with their library** (Headless/Atomic)
through changesets fixed packages, so `--template-version <v>` selects the sample
built against library version `v` (defaults to `latest`). See
[`packages/create-ui/README.md`](../../../packages/create-ui/README.md) and
[ADR 001/002](../../../packages/create-ui/docs/adr/).

## Required features per sample type

Follow "What Belongs in a Sample" in CONTRIBUTING.md:

- **Atomic Search** — every relevant `atomic-*` component with minimal config,
  using fields available in `searchuisamples`. Styling comes from Atomic's own
  themes; don't hand-roll CSS.
- **Atomic Commerce** — 1 search page, 2 product listing pages, 1 recommendations
  page.
- **Headless Search** — at minimum search box + result list + pager; also facets
  and sort. The current React/vanilla samples also include: query suggestions +
  instant results with `role=listbox`/`option` + valid `aria-selected`, a
  hierarchical **category facet** shown in the breadbox
  (`categoryFacetBreadcrumbs`), breadcrumbs, sort (Relevance/Newest/Oldest),
  numbered pager, query summary, and href sanitizing via `filterProtocol`.
- **Headless Commerce** — 1 search page, 1+ product listing page(s), 1
  recommendations section; instant products in the search-box dropdown.
- **Headless SSR** — the SSR wiring for the framework (Next.js App Router,
  Express, React Router) plus the search/commerce experience.

Keep implementations feature-equivalent across frameworks.

## Standard script contract

CI discovers samples via Turbo, so scripts must match (adding a compliant sample
needs **zero** CI changes):

| Script  | Required | Command           |
| ------- | -------- | ----------------- |
| `dev`   | yes      | start dev server  |
| `build` | yes      | production build  |
| `e2e`   | yes      | `playwright test` |
| `test`  | optional | `vitest run` (unit tests only) |

- Playwright goes under **`e2e`**, never `test`.
- **Atomic-React exception:** samples consuming `@coveo/atomic-react` assets may
  add a `build:assets` step (copying `dist/assets`, `dist/lang`, `dist/themes`)
  called from a `predev`/`build` hook — the only permitted script deviation.

## Testing

Deterministic Playwright smoke tests are the contract (never a live API):
`@coveo/platform-mock-api` + `@msw/playwright` + `msw`. See CONTRIBUTING.md for
the `e2e/fixtures.ts` + `e2e/smoke.spec.ts` template and required devDeps. E2E
runs through a single glob/affected-driven `samples-e2e` CI job
(`turbo run e2e --affected`).

## Styling conventions

- **Headless (custom UI) samples**: clean, unbranded, Atomic-like. Define the
  palette/scale as `:root` CSS custom properties in `src/index.css` using the
  shared tokens in [`assets/design-tokens.css`](assets/design-tokens.css); use
  BEM-ish class names, semantic HTML, and `:focus-visible` outlines. Don't invent
  per-sample colors — copy the tokens into siblings so they match.
- **Atomic samples**: styling comes from Atomic's components/themes — keep it
  minimal, don't add custom design systems.

## Making a sample publishable

Samples publish via pnpm's `publishConfig.directory` + a shared **prepack
builder** ([`scripts/build-sample-publish-dir.mjs`](../../../scripts/build-sample-publish-dir.mjs))
that emits a trimmed `./publish/`. This is the current mechanism and
**supersedes the `files`-allowlist approach proposed in ADR 002**. Full diffs and
lockfile details: [`references/publishing.md`](references/publishing.md).

Checklist:

1. **`package.json`**: remove `private`; add
   `"publishConfig": {"access": "public", "directory": "publish", "linkDirectory": false}`
   and `"prepack": "node ../../../scripts/build-sample-publish-dir.mjs"`. Keep
   `dev`/`build`/`e2e` (+ `preview`); drop stray `test`/`e2e:watch` scripts and
   any vitest/testing-library devDeps if the sample has no unit tests.
2. **`.gitignore`**: add `publish`.
3. **Lockfile**: add `    publishDirectory: publish` (4-space indent) to this
   sample's importer, after its last devDependency — do **not** regenerate the
   whole lockfile. See [`references/publishing.md`](references/publishing.md).
4. Verify: `pnpm install --frozen-lockfile`, run the builder + `pnpm pack`, and
   run the scaffold deploy-test.

The builder is **shared** — generalize it (e.g. `existsSync` guard for optional
shipped paths) rather than forking per-sample, and never let a branch diverge it
from `main`.

## Verification (always)

From the sample dir: `pnpm install`, `pnpm dev` (renders?), `pnpm e2e` (smoke
passes?). From the repo root: `pnpm run lint:check` (or `oxlint`/`oxfmt` on
changed files). For any **publish** change, also run the scaffold deploy-test
(pack → extract → `npm install` → `npm run build` → render) per
[`references/publishing.md`](references/publishing.md).

## Git workflow

- Worktree per branch; keep sample PRs to a **single, squashed commit**.
- **Rebase** onto `main` (never merge). After a rebase the auto-merged
  `pnpm-lock.yaml` is often silently broken — always re-run `pnpm install
  --frozen-lockfile` and fix per [`references/publishing.md`](references/publishing.md)
  before pushing.
- Keep the PR description in sync with the final branch state.

## Reference & assets

| File | When to load |
| ---- | ------------ |
| [`samples/CONTRIBUTING.md`](../../../samples/CONTRIBUTING.md) | Canonical standards, naming taxonomy, test template, script contract |
| [`packages/create-ui/README.md`](../../../packages/create-ui/README.md) + [ADRs](../../../packages/create-ui/docs/adr/) | CLI usage, template versioning, publishing/consumption decisions |
| [`references/publishing.md`](references/publishing.md) | publishConfig.directory + builder, lockfile edits, rebase fix, deploy-test |
| [`assets/design-tokens.css`](assets/design-tokens.css) | Baseline shared CSS tokens for a headless custom-UI sample |

## Checklist

- [ ] Correct category/naming: `@coveo/ui-kit-sample-<category>-<usecase>[-<framework>]`, matches `--template`
- [ ] Feature set matches the sample type and mirrors siblings
- [ ] Zero-config; `searchuisamples`; search hub `BarcaKnowledge` for search
- [ ] Script contract (`dev`/`build`/`e2e`, `test` optional); Atomic-React `build:assets` only if needed
- [ ] Styling: shared tokens (headless) or Atomic themes (atomic); accessible markup
- [ ] `e2e` Playwright smoke test with `@coveo/platform-mock-api` + MSW
- [ ] Publishable: `publishConfig.directory` + `prepack`, `publish` gitignored, `publishDirectory` in the lockfile importer
- [ ] `pnpm install --frozen-lockfile` passes (no `@types/node` drift)
- [ ] build + lint + e2e green; scaffold deploy-test renders with live data
- [ ] README has "Using this sample as an MRE" + version-pinning sections
- [ ] Single squashed commit, rebased on `main`, PR description in sync
