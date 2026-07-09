# 001 - Sample Consumption

**Status:** Proposed  
**Date:** 2026-06-25

## Context

`@coveo/create-ui` (`npm create @coveo/ui`) scaffolds a standalone project from the official samples published to npm (see [ADR 002](./002-sample-publishing.md)). Samples arrive install-ready — `workspace:*` and `catalog:` are resolved at publish time — so the CLI's job is: resolve a package, download it, verify it, extract it, and rename the project.

## Decisions

### 1. Fetch at run time, never bundle

Templates update without a CLI release. Bundling couples them.

### 2. Fetch from the npm registry

The CLI resolves the sample package from the npm registry directly (not GitHub).

| Criterion         | npm                                                 | GitHub source tarball (rejected) |
| ----------------- | --------------------------------------------------- | -------------------------------- |
| Immutability      | Published versions are immutable + integrity-hashed | Git tags are mutable             |
| Rate limiting     | None (CDN-backed)                                   | 60 req/hr/IP unauthenticated     |
| Download size     | ~50 KB (just the sample)                            | ~4.5 MB (whole monorepo)         |
| Corporate proxies | Respects `.npmrc` registry config                   | Requires GitHub access           |

Resolution: `pacote.extract('@coveo/ui-kit-sample-<name>@latest', dest)` resolves the package from the registry, downloads, verifies integrity, and extracts in one step.

Rejected alternatives:

- **Shell out to `npm pack`** — heavier, requires `npm` on PATH.
- **GitHub release asset** — mutable, not registry-versioned, requires custom resolution logic.
- **Manual `fetch` + `tar`** — reimplements what `pacote` already does; misses `.npmrc` auth handling.

### 3. Resolve the `latest` dist-tag by default

Default to `latest` — a sample update reaches users immediately once published, with no major pinning or version arithmetic. An optional `--template-version <version>` (a semver such as `3.2.1`, or an npm dist-tag such as `latest`/`next`) overrides the default so Support/PS can reproduce and troubleshoot against a known-good version. Omitting it preserves the `latest` behavior.

Sample versions are kept in lockstep with the Coveo library they build on (Headless or Atomic) via changesets [fixed packages](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md) (see [ADR 002](./002-sample-publishing.md) decision #3). A sample's version therefore always matches its library's, so `--template-version 3.2.1` scaffolds the sample built against Headless/Atomic `3.2.1`.

### 4. Integrity verification handled by `pacote`

`pacote` verifies the tarball's SHA-512 against `dist.integrity` from the registry manifest automatically. No custom `crypto` code needed — a checksum mismatch throws by default.

### 5. Use `commander` for CLI parsing

Provides `--help`, validation, and error messages out of the box with zero runtime deps. Replaces the current hand-rolled `minimist` + manual help string.

### 6. Supporting stack

| Concern                              | Choice                                           | Rationale                                                                                                                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registry resolve, fetch & extraction | [`pacote`](https://www.npmjs.com/package/pacote) | npm's own package fetcher — resolves dist-tags, downloads tarballs, verifies integrity, and extracts in one call. Replaces manual `fetch` + `tar` + `crypto` with a single `pacote.extract(spec, dest)` invocation. Respects `.npmrc` for auth and corporate registry mirrors. |
| Tests                                | `vitest`                                         | Monorepo standard                                                                                                                                                                                                                                                              |
| Build                                | `tsc`                                            | Node CLI; bundler adds nothing                                                                                                                                                                                                                                                 |

### 7. Interactive selection: `@clack/prompts` (planned)

When `--template` is omitted. Not yet implemented.

## Consequences

- Runtime deps: `commander` + `pacote`. Remove `minimist` and `tar`.
- `templates.ts` maps template name → npm package name (`@coveo/ui-kit-sample-<name>`). Monorepo paths removed.
- No run-time dependency-protocol resolution (KIT-5842 eliminated by publish-time resolution in ADR 002).
- Download is proportional to the sample, not the monorepo.
