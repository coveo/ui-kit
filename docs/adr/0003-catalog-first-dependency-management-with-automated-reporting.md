---
status: Proposed
date: 2025-07-30
related:
  - scripts/report-catalog-candidates.mjs
  - pnpm-workspace.yaml
---

# Catalog-first dependency management with automated reporting

## Context and Problem Statement

Dependencies hardcoded across multiple packages drift silently. There is no way to discover which ones could be promoted to the pnpm workspace catalog or which packages bypass an existing catalog entry.

## Decision Drivers

- Version drift should be surfaced proactively.
- The catalog should be the single source of truth for shared versions.
- Tooling should fit existing conventions (`scripts/`, ESM, `packages.mjs` helpers).

## Considered Options

### Option A: Reporting script

A script that scans all packages, groups hardcoded dependencies by semver divergence, and outputs structured JSON.

- **Pros:** Immediate visibility, zero new infra, actionable categories.
- **Cons:** Informational only — does not auto-fix.

### Option B: Lint rule enforcing `catalog:` usage

- **Pros:** Enforces compliance at commit time.
- **Cons:** Only catches existing catalog entries, blocks workflow, requires custom plugin.

## Decision Outcome

Option A — introduce `scripts/report-catalog-candidates.mjs`.

A lightweight reporting tool fits the problem better than enforcement. It surfaces both promotion candidates and bypass violations without blocking developers.

## Consequences

- **Positive:** Drift becomes visible before it causes problems. Catalog promotion candidates are obvious.
- **Negative:** Without periodic execution, drift can still accumulate.
- **Neutral:** The script has no side effects and can be removed at any time.
