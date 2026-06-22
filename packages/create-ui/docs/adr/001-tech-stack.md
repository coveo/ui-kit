# 001 - Template Delivery and Technology Stack for `create-ui`

**Status:** `🟡 Proposed`

**Date:** 2026-06-22

## Context and Problem Statement

`@coveo/create-ui` is a CLI scaffolding tool — `npm create @coveo/ui <project-name> --template <name>` — that produces a standalone, runnable project from the official samples in the `coveo/ui-kit` monorepo. It downloads a sample, rewrites its `package.json` so it installs on its own, and runs the user's package manager.

Two forces dominate every decision below:

- **Template freshness is a hard requirement.** Templates must update _without_ publishing a new CLI version. Locking the CLI version to a template version has been tried before and had its issues.
- **Scaffolded projects must actually install.** Samples live in a pnpm workspace and reference monorepo packages via `workspace:*` (e.g. `@coveo/headless`, `@coveo/auth`) and shared third-party versions via `catalog:`. A scaffolded project must resolve those to versions that are actually **published on npm**, or the end user's `install` fails.

Around that core sit the usual CLI concerns: argument parsing and UX, downloading/extracting an archive, and a reasonable install footprint (the tool runs via `npx` / `npm create`).

This ADR records the decisions reached for template delivery and the supporting technology stack, including the alternatives we deliberately rejected.

## Criteria

- **Freshness without version-locking** — templates evolve independently of CLI releases.
- **Installability / correctness** — a scaffolded project resolves to published versions and runs.
- **Stability** — end users never receive a broken or unreleased template.
- **Low maintenance** — prefer well-maintained packages over hand-rolled logic, and prefer a single uniform code path over special cases.
- **UX** — clear help, validation, errors, and (later) interactive template selection.
- **Supportability** — depend only on documented, public contracts.
- **Footprint** — reasonable install size for an on-demand tool; real, but secondary to the above.

## Decision Outcome

### 1. Deliver templates by runtime download — not by bundling them in the package

The CLI fetches templates at run time rather than shipping them inside its published `dist/`.

- **Why:** freshness is a hard requirement, and bundling version-locks templates to the CLI release. Bundling was tried previously and rejected. Runtime download lets a sample change in the monorepo reach users without a CLI release.
- **Rejected — bundle templates into the npm package:** instant, offline, version-consistent, but it couples template updates to CLI releases. Hard "no".
- **Rejected — hybrid manifest + per-file fetch:** see decision 4 (rate limits make it worse).

### 2. Fetch from the documented public REST API — not `codeload.github.com`

Use `GET https://api.github.com/repos/{owner}/{repo}/tarball/{ref}`, send a `User-Agent`, and follow the `302` redirect.

- **Why:** `codeload.github.com/<owner>/<repo>/tar.gz/<ref>` is an **internal, undocumented** host whose URL scheme can change with no notice or deprecation window. The REST endpoint is a **documented, versioned public contract**.
- **Important nuance:** GitHub still _serves the bytes from codeload_ — the `302` points there with a short-lived signed token. We are not avoiding codeload's servers; we are avoiding **hardcoding its URL**. We discover that URL dynamically from the redirect every request, so if GitHub changes codeload's topology we keep working. Same bytes, supported contract.
- Unauthenticated rate limit is 60 requests/hour/IP — ample for scaffolding.

### 3. Download from the latest **release**, not from `main`

The ref is resolved to the **latest published release** of the repository — **not** pinned to a major. `main` is never used as the default.

- **Why not `main`:** samples reference `@coveo/headless`/`@coveo/auth` via `workspace:*`. The dependency-resolution step rewrites those to the version found in `packages/<name>/package.json` **at the downloaded ref**. On `main` that file can hold an in-development or just-bumped version that is **not yet on npm**, producing a project that cannot `install`. `main` can also carry unreleased or broken samples.
- **Why a release ref is safe:** `ui-kit` releases with changesets, which tags every published package on a single "Version Packages" commit. We verified this: `@coveo/shopify@1.9.35`, `@coveo/headless@3.51.5`, `@coveo/atomic@3.59.6`, and `@coveo/quantic@3.41.0` all resolve to the **same commit** (`80cb575…`). Any release commit is therefore a fully-published, workspace-consistent snapshot — every `workspace:*` resolves to a version that exists on npm. This also retroactively de-risks KIT-5842.
- **Why latest, not pinned to a major:** the earlier draft pinned to a per-library target major (a `TARGET_MAJORS` constant) so that adopting a new major was a deliberate, reviewable CLI change. We reversed this in favour of the simplest rule — **always the latest release** — for two reasons. **(1) Less code:** no `TARGET_MAJORS` constant, no per-library major filtering, and no manual bump-and-release ritual to adopt a major; one lookup serves every template. **(2) A new major is the behaviour we _want_:** serving `@coveo/headless@4`'s samples the moment they ship is exactly the freshness goal, and because it is still a release commit it remains a fully-published, installable snapshot. The one residual risk is a `samples/` **path restructure** that invalidates the hardcoded paths in `templates.ts`; we accept it because (a) the post-extraction safety net below turns it into a clear _"update the CLI"_ error rather than a cryptic failure, and (b) we assume `ui-kit` will not restructure samples without updating them in the same coordinated release.
- **Resolution mechanism:** `GET /repos/{owner}/{repo}/releases/latest` returns the most recent non-prerelease, non-draft release (sorted by the release commit's date); download its `tarball_url` **verbatim** (so the `@`/`/` in the tag are never hand-encoded). No pagination, no tag matching, no major arithmetic. This also **excludes prereleases/drafts**, directly serving the _Stability_ criterion. Because changesets tags every package of a release on one "Version Packages" commit (the `80cb575…` example above), every per-package release tag on that commit points at the same commit — hence byte-identical archive content — so it does not matter which tag GitHub labels "latest".
- **Safety net (now the primary guard):** with no major pin, a future release is served immediately, so post-extraction validation is what protects end users. After extraction, if the expected `template.path` is absent (a release moved or renamed things), fail with a clear _"this template isn't available in the latest release; please update @coveo/create-ui"_ rather than a cryptic `tar`/`ENOENT` error.

### 4. Accept downloading the **entire** `coveo/ui-kit` tarball

We stream the whole repository tarball at the resolved release commit and extract only what we need (the sample directory plus support files: `pnpm-workspace.yaml` and `packages/*/package.json`). We do **not** try to download a narrower slice.

- **Why this is acceptable — measured, not assumed:** the full monorepo tarball at a release commit is **4.5 MB across 7,868 entries and downloads in ~1.3 s**. It is small because a git archive **excludes** `node_modules`, `dist`, and anything gitignored — it is committed source only. For a one-time scaffold, this is invisible to users.
- **Why narrowing the download is worse, not better:**
  - **GitHub Contents API (per-file):** one sample is ~175 files; add the support files and you issue **~175+ requests**, which blows the **60 req/hour** unauthenticated limit on the first run. Net: a broken tool to save ~3 MB on a 1.3 s operation.
  - **Sparse / shallow git checkout:** requires a `git` binary on the user's machine and more orchestration, for the same negligible saving.
- **Net:** streaming the whole tarball through a `tar` `filter` is the simplest design and — importantly — a **single code path that is uniform across every ref** (release tag, branch, or SHA via `--ref`). That uniformity is the low-maintenance choice.

### 5. Do **not** build a dedicated release-asset bundle (for now)

We considered having the release workflow build a purpose-made archive (samples + `pnpm-workspace.yaml` + lockfile + `packages/*/package.json`) and upload it as a **GitHub Release asset** for the CLI to download instead of the source tarball.

- **As a download-size optimization: rejected.** It optimizes a non-problem (see decision 4 — 4.5 MB / 1.3 s) while adding machinery to the **shared** release pipeline that, if it breaks or is skipped, breaks the CLI.
- **The compelling version — pre-resolving dependencies at release time** (shipping samples with `catalog:`/`workspace:*` already rewritten, which would let KIT-5842's runtime logic disappear) — was also **deferred**, because it collides with decisions already made:
  - The `--ref` escape hatch (decision 3) points at arbitrary refs that have **no** prebuilt asset, so the source-tarball + runtime-resolution path must still exist. We would then maintain **two** code paths — _more_ maintenance, not less.
  - The asset only exists on releases produced after the pipeline change, so "latest release" becomes "latest release _that has the asset_" — extra resolution logic.
- **Revisit when:** KIT-5842's _runtime_ resolution proves genuinely painful or unreliable. At that point relocating resolution to release-time (using pnpm's own tooling in CI) becomes worth the pipeline change, and we would commit to asset-only and drop or restrict `--ref`. Until then, the single uniform download path wins.

### 6. CLI argument parsing: `commander`

Use `commander` for flag parsing, help, and validation.

- **Why:** the goals here are **UX** and **low maintenance**. `commander` owns `--help` generation, option validation, unknown-option errors, and (if ever needed) subcommands — maintained upstream, not hand-rolled by us. It has **zero runtime dependencies** and is the most battle-tested CLI framework in the ecosystem.
- **Rejected — `minimist` (the previous choice):** it is a _bare_ parser that turns `argv` into an object and nothing more. It provides no help, validation, or errors, so every UX affordance would be hand-written (as the current `index.ts` already does with its manual `HELP` string and validation branches) — exactly the maintenance we want to avoid.
- **Rejected — `node:util.parseArgs` (Node built-in):** zero-dependency and available across our `engines` range, but it is the same bare level as `minimist` — no UX. Footprint purity is not our priority; UX and not-reinventing are.
- **Rejected — `yargs`:** more than we need and ~1 MB with many transitive deps. `cac` is a lighter alternative to `commander` if footprint ever becomes a concern.

### 7. Supporting stack

| Concern        | Choice                  | Why                                                                                                                                                                             |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tar extraction | `tar` (npm)             | Streaming `filter` + `strip` out of the box — exactly what decision 4 needs, without buffering the archive. Maintained by the npm team.                                         |
| HTTP           | Node built-in `fetch`   | Node 20+ ships stable Undici-backed `fetch`. A single GET + redirect-follow needs no third-party client.                                                                        |
| Test runner    | `vitest`                | Monorepo standard (shared `catalog:` version). Native ESM + TS; network is mocked via an injectable `fetchImpl`.                                                                |
| Build          | `tsc` only (no bundler) | Output is a Node CLI, not a browser bundle. `tsc` emits ESM that Node runs natively; startup is dominated by network I/O, so a bundler adds complexity for no user-facing gain. |

### 8. Interactive template selection: `@clack/prompts` (planned)

The interactive selection flow (when `--template` is omitted) is the next design branch and is **not yet implemented**. The intended choice is `@clack/prompts`, paired with `commander` for flags — the standard modern combination for `create-*` tools. To be detailed in a follow-up revision/ADR.

## Consequences

- **Runtime dependencies:** `commander` + `tar` (`fetch` is native). `minimist` and `@types/minimist` are removed.
- **New CLI logic to implement** (follows approval of this ADR):
  - A release-resolution module: `GET /releases/latest` → `tarball_url` (no `TARGET_MAJORS` constant, no tag matching).
  - The `--ref` override flag.
  - Post-extraction validation of `template.path`.
  - Migration of `index.ts` argument parsing from `minimist` to `commander`, removing the hand-written help/validation.
  - Remove the misleading "the whole-monorepo tarball is large / optimizing the download size is a known follow-up" comment in `download.ts` — measurement (decision 4) disproves the premise.
- **Adopting a future major** (e.g. `@coveo/headless@4`) requires **no** CLI change — the next release's samples are served automatically. The only thing that can force a CLI change is a `samples/` **path restructure**, which the post-extraction safety net surfaces as a clear _"update the CLI"_ error.
- **A known, accepted trade-off:** we download the entire `ui-kit` repository (~4.5 MB) to extract ~50 KB. This is intentional — it is fast, and every alternative is either worse (rate limits), heavier (a `git` dependency), or higher-maintenance (a dual-path release asset).

## Related Links

- [GitHub REST API — Download a repository archive (tar)](https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-tar)
- [GitHub REST API — Get the latest release](https://docs.github.com/en/rest/releases/releases#get-the-latest-release)
- KIT-5842 — resolve monorepo-only dependency protocols (`catalog:`, `workspace:*`) so samples install standalone
- KIT-5833 — link to the "How to use @coveo/create-ui" guide (pending)
