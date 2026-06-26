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

Resolution: `GET https://registry.npmjs.org/@coveo/sample-<name>/latest` → use `dist.tarball` and `dist.integrity` from the response.

Rejected alternatives:

- **Shell out to `npm pack`** — heavier, requires `npm` on PATH.
- **GitHub release asset** — mutable, not registry-versioned, requires custom resolution logic.

### 3. Resolve the `latest` dist-tag

Always fetch `latest`. No major pinning, no version arithmetic. A sample update reaches users immediately once published.

### 4. Verify integrity before extracting (TBD)

Check the tarball's SHA-512 against `dist.integrity` from the registry manifest using Node's built-in `crypto`. Fail loudly on mismatch.

### 5. Use `commander` for CLI parsing

Provides `--help`, validation, and error messages out of the box with zero runtime deps. Replaces the current hand-rolled `minimist` + manual help string.

### 6. Supporting stack

| Concern         | Choice                 | Rationale                                                             |
| --------------- | ---------------------- | --------------------------------------------------------------------- |
| Tar extraction  | `tar` (npm)            | Streaming extract with `strip: 1` for npm tarball's `package/` prefix |
| HTTP            | Node built-in `fetch`  | Two requests total (metadata + tarball); no third-party client needed |
| Integrity (TBD) | Node built-in `crypto` | Standard library, no dependency                                       |
| Tests           | `vitest`               | Monorepo standard                                                     |
| Build           | `tsc`                  | Node CLI; bundler adds nothing                                        |

### 7. Interactive selection: `@clack/prompts` (planned)

When `--template` is omitted. Not yet implemented.

## Consequences

- Runtime deps: `commander` + `tar`. Remove `minimist`.
- `templates.ts` maps template name → npm package name (`@coveo/sample-<name>`). Monorepo paths removed.
- No run-time dependency-protocol resolution (KIT-5842 eliminated by publish-time resolution in ADR 002).
- Download is proportional to the sample, not the monorepo.
