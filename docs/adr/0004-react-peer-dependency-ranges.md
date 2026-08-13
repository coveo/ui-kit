---
status: Proposed
date: 2026-08-13
related:
  - https://coveord.atlassian.net/browse/KIT-5994
  - packages/atomic-react/package.json
  - packages/headless-react/package.json
  - pnpm-workspace.yaml
  - docs/adr/0003-catalog-first-dependency-management-with-automated-reporting.md
---

# Use a named catalog for React peer dependency ranges

## Context and Problem Statement

The default pnpm catalog pins `react`, `react-dom`, `@types/react`, and `@types/react-dom` to a single 19.x version for the monorepo's own tooling. The published React wrapper packages (`atomic-react`, `headless-react`) must declare wide peer ranges (`^18 || ^19`) because they support both React 18 and 19 consumers.

We must decide how to manage these peer ranges without breaking consumers or undermining the catalog-first policy.

## Decision Drivers

- The catalog should remain the single source of truth for dependency version specifiers across the monorepo.
- Peer dependency ranges serve a fundamentally different purpose: they declare compatibility for external consumers.
- Any change should be justified by a concrete gain in code, maintenance, or correctness.
- The solution should not require special-case tooling (allowlists, report modifications).

## Considered Options

### Option A: Pin peer ranges to the default `catalog:`

- **Summary:** Replace wide ranges with `catalog:`, publishing the default catalog's exact 19.x peer.
- **Pros:** Eliminates catalog-bypass report noise.
- **Cons:** The default catalog holds an exact version (`react: 19.2.7`). Publishing that as a peer dependency forces consumers into lockstep with our patch upgrades, causes `ERESOLVE` errors for anyone not on that exact version, and risks duplicate React installs at runtime.

### Option B: Drop React 18 (`^19` only)

- **Summary:** Narrow the peer ranges to React 19+.
- **Pros:** Fewer supported majors to document.
- **Cons:** Neither package uses any React-19-only API. The entire surface (`useEffect`, `useRef`, `useState`, `createContext`, `createRoot`, `flushSync`, etc.) is identical across 18 and 19. React 18 is still security-supported with no announced end of life. Narrowing would force a full 18→19 migration on consumers for zero functional gain.

### Option C: Keep wide ranges hardcoded, allowlist the bypass

- **Summary:** Hardcode `^18 || ^19` in both packages and add an intentional-bypass allowlist to `scripts/report-catalog-candidates.mjs`.
- **Pros:** Accurate compatibility contract; report stays meaningful.
- **Cons:** Four dependencies remain a maintained exception. Requires custom tooling (allowlist + `isIntentionalBypass` function) that must stay in sync with any future React-consuming package. The hardcoded ranges can drift between packages.

### Option D: Named catalog (`catalogs.react-compatibility`)

- **Summary:** Define a named catalog `react-compatibility` in `pnpm-workspace.yaml` holding `^18 || ^19` for `react`, `react-dom`, `@types/react`, and `@types/react-dom`. Reference it as `catalog:react-compatibility` in both packages' `peerDependencies`.
- **Pros:** Single source of truth for the compatibility range. On publish, pnpm replaces `catalog:react-compatibility` with the stored specifier (`^18 || ^19`) — consumers see exactly the range we intend. No report-script changes needed (the report already skips `catalog:` specifiers). No allowlist to maintain.
- **Cons:** Slight indirection — readers must look up the named catalog in `pnpm-workspace.yaml` to see the actual range. Standard catalog tradeoff, already accepted repo-wide.

## Decision Outcome

Chosen option: **Option D — named catalog (`catalogs.react-compatibility`).**

### Rationale

- A named catalog preserves the wide range contract (`^18 || ^19`) for consumers while staying within the catalog-first policy (ADR-0003).
- `pnpm publish` replaces `catalog:react-compatibility` with the catalog's specifier verbatim, so the published `package.json` contains `^18 || ^19` — identical behavior to hardcoding, with centralized management.
- No custom tooling or allowlists required; `report-catalog-candidates.mjs` naturally skips `catalog:` specifiers.
- Future range changes (e.g., adding React 20, or eventually dropping React 18) require editing only one line in `pnpm-workspace.yaml`.

## Consequences

- **Positive:** Both packages declare consistent ranges from a single source; the catalog-candidates report stays clean without modifications; no maintained exceptions to the catalog-first rule.
- **Negative:** None significant. The named catalog is a minor addition to `pnpm-workspace.yaml`.
- **Neutral:** When a real trigger arises (usage of a React-19-only API, or React 18 end of life), update the named catalog entry and this ADR.

## Implementation

- `pnpm-workspace.yaml` gains a `catalogs.react-compatibility` section with all four deps at `^18 || ^19`.
- `atomic-react` and `headless-react` peer dependencies reference `catalog:react-compatibility`.
- `scripts/report-catalog-candidates.mjs` requires no changes (reverted to its pre-PR state).
