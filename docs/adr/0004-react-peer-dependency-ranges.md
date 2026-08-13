---
status: Proposed
date: 2026-08-12
related:
  - https://coveord.atlassian.net/browse/KIT-5994
  - packages/atomic-react/package.json
  - packages/headless-react/package.json
  - scripts/report-catalog-candidates.mjs
  - docs/adr/0003-catalog-first-dependency-management-with-automated-reporting.md
---

# React peer dependency ranges stay wide and bypass the catalog intentionally

## Context and Problem Statement

The pnpm catalog pins `react`, `react-dom`, `@types/react`, and `@types/react-dom` to a single 19.x version for the monorepo's own tooling. The published React wrapper packages (`atomic-react`, `headless-react`) instead declare wide peer ranges (`^18 || ^19`), which the catalog-candidates report flags as bypassing the catalog.

We must decide whether to align these peers with the catalog or keep them wide.

## Decision Drivers

- The catalog should remain the single source of truth for the monorepo's internal tooling versions.
- Peer dependency ranges serve a fundamentally different purpose: they declare compatibility for external consumers.
- Any change should be justified by a concrete gain in code, maintenance, or correctness.

## Considered Options

### Option A: Pin peer ranges to `catalog:`

- **Summary:** Replace wide ranges with `catalog:`, publishing an exact 19.x peer.
- **Pros:** Eliminates the catalog-bypass report noise.
- **Cons:** `catalog:` publishes as an exact version (verified against published `@coveo/headless`). This forces consumers into lockstep with our patch upgrades, causes `ERESOLVE` errors for anyone not on that exact version, and risks duplicate React installs at runtime. The monorepo already pins React internally via `pnpm.overrides`, so `catalog:` on the peer brings zero additional consistency for us — only pain for consumers.

### Option B: Drop React 18 (`^19` only)

- **Summary:** Narrow the peer ranges to React 19+.
- **Pros:** Fewer supported majors to document.
- **Cons:** Neither package uses any React-19-only API. The entire surface (`useEffect`, `useRef`, `useState`, `createContext`, `createRoot`, `flushSync`, etc.) is identical across 18 and 19 — there is no code or maintenance benefit to dropping 18. React 18 is still security-supported with no announced end of life. Narrowing would force a full 18→19 migration on consumers for zero functional gain.

### Option C: Keep wide ranges, standardize to `^18 || ^19`, allowlist the bypass

- **Summary:** Align both packages to `^18 || ^19`, declare `@types/react(-dom)` as optional peers on `atomic-react`, and add an intentional-bypass allowlist to the report script.
- **Pros:** Accurate compatibility contract; no unnecessary churn for consumers; report stays meaningful by distinguishing intentional bypasses from real drift.
- **Cons:** Four dependencies remain a maintained exception to the catalog-first rule.

## Decision Outcome

Chosen option: **Option C — keep wide ranges, standardize, and allowlist the bypass.**

### Rationale

There is no gain in pinning or narrowing:

- Pinning to `catalog:` solves no real problem — internal consistency is already handled by `pnpm.overrides` — and introduces install failures for consumers.
- Dropping React 18 removes no code, enables no new API usage, and eliminates no maintenance burden. It only imposes cost on consumers who are on a still-supported React version.
- The wide range accurately reflects the actual compatibility of these packages and is the correct contract for a published library.

## Consequences

- **Positive:** The report distinguishes intentional bypasses from real drift; both packages declare consistent, explicit ranges that match their actual compatibility.
- **Negative:** Four dependencies are a maintained exception to the catalog-first rule.
- **Neutral:** When a real trigger arises (usage of a React-19-only API, or React 18 end of life), revisit the ranges and this ADR.

## Implementation

- `atomic-react` peers standardized to `^18 || ^19`; `@types/react` and `@types/react-dom` added as optional peers to match `headless-react`.
- `scripts/report-catalog-candidates.mjs` gained an `INTENTIONAL_CATALOG_BYPASSES` allowlist that reclassifies these four peers as `intentional-bypass` instead of `bypasses-catalog`.
