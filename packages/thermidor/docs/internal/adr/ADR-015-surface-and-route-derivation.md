---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-011-session-serialization.md
---

# Surface & route derivation: interim client-side, target server-surfaced

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md).

## Context and Problem Statement

Consumers need to know, per turn, **which surface(s) the server produced and what
kind they are** — most concretely, "did this turn route to a commerce-search
surface?" Two callers ask this today:

- Internal: the converse controller's `dispatchAction` derives the target
  `surfaceId` from the active turn (`deriveCommerceSurfaceId`).
- Sample: navigation decides, per turn (including historical turns), whether to
  route to the search-results page or render inline (`findSurface` /
  `findCommerceSurfaceId`).

Both answer the question by **re-parsing the raw, untyped A2UI wire payload** out
of `activities`: walk `activity.payload.messages` → `createSurface` → resolve
`rootId` against `createSurface.components` → read `props.componentType` and compare
it to the literal string `'commerce-search'`, with `isRecord` guards at every hop.

This is a smell, not merely duplicated code. It is the client **reverse-engineering
the server's routing/structure decision from transport artifacts**:

- It reaches *through* the schema boundary. We built a typed, validated,
  consumer-injected component system (ADR-013, ADR-014), then hand-walk the untyped
  wire format underneath it and hardcode a magic `componentType` string to recover
  a fact the schema/server already knows.
- The question it answers is really **route determination** — the same open problem
  flagged for conditional SSR ([ADR-009](./ADR-009-architecture-decision-charter-v2.md)
  §SHOULD). Inferring the route from output artifacts is inherently fragile.

## Decision Drivers

- **Public API independence / non-leakage (charter MUST):** consumers should read
  typed domain data, not parse transport DTOs.
- **Best-in-class DX (charter MUST):** "what surfaces did this turn produce" should
  be a typed answer, not a hand-rolled payload walk each consumer rewrites.
- **Do not let a workaround become silent permanent debt:** whatever interim step we
  take must be recorded as interim, with the upstream fix and its retirement
  condition explicit.
- **Unblock the sample and internal `dispatchAction` now**, without waiting on a
  backend/protocol change.

## Considered Options

### Option A: Extract a shared client utility (status quo cleanup)

- **Summary:** Export one framework-agnostic `findSurfaces(activities)` from
  thermidor; both callers use it.
- **Pros:** Removes duplication; cheapest.
- **Cons:** Keeps the client doing payload archaeology and the hardcoded
  `'commerce-search'` string. Treats the symptom, not the cause.

### Option B (selected, interim): Derive once in the fold; expose typed surfaces on `TurnResponse`

- **Summary:** The event-fold computes surface identity/type once while folding the
  stream and exposes it as a **typed projection** on the response (e.g.
  `response.surfaces: DiscoveredSurface[]`, each with `surfaceId` and root
  `componentType`). Consumers read typed data; no consumer walks `activities`. The
  raw traversal + `'commerce-search'` check lives in exactly one place (the fold),
  clearly marked as a protocol-gap workaround.
- **Pros:** Removes archaeology from all consumer code; single derivation site;
  typed, testable, tree-shakeable; strictly better than A. Works today with no
  backend change.
- **Cons:** The fold still hardcodes the traversal and the magic string — the smell
  is contained, not eliminated. Coupled to the serialization decision (see below).

### Option C (target, upstream): Server-surfaced typed routing/surface identity

- **Summary:** The AG-UI stream carries surface identity and route/surface type as
  **first-class typed data** (a typed activity/field), so the client neither walks
  payloads nor guesses. Discovery, where still needed, goes through the schema.
- **Pros:** Eliminates the smell at the source; the client reads what the server
  declares; route determination stops being inference. Directly serves the
  conditional-SSR route-determination need.
- **Cons:** Requires backend/protocol work outside this repo; not available now.

## Decision Outcome

Adopt **Option B now** as an explicitly interim measure, and pursue **Option C** as
the target end state upstream.

- Interim (this repo): derive surfaces once in the fold; expose a typed
  `response.surfaces` projection; delete `deriveCommerceSurfaceId` and the sample's
  `findSurface`/`findCommerceSurfaceId`, which read the typed projection instead.
- Target (upstream): server-surfaced typed routing/surface identity, coordinated
  with the conditional-SSR route-determination ADR (both are the same underlying
  need: the client should be *told* the route, not infer it).

**Retirement condition:** when Option C lands, the fold's raw traversal and the
hardcoded `'commerce-search'` string are removed; `response.surfaces` (or its
successor) is populated from the server's typed data instead of derived from
`activities`.

## Consequences

- **Positive:** Consumers read typed surface data; the fragile payload walk is
  reduced to a single, clearly-labelled interim site; sample and `dispatchAction`
  are unblocked immediately.
- **Negative / debt:** The `'commerce-search'` magic string and wire-shape
  assumptions persist in the fold until Option C. Recorded here so the debt is
  visible and owned, not silently permanent.
- **Coupling to serialization ([ADR-011](./ADR-011-session-serialization.md)):**
  `response.surfaces` is a **derived** projection of `activities`. Since `activities`
  is already persisted for all turns, `surfaces` should be re-derived on restore
  (or persisted as a pure cache), not treated as an independent source of truth —
  consistent with the "derive, don't duplicate" stance ADR-011 takes on `surfaces`.
- **Coupling to SSR:** Option C is the same decision as SSR route-determination;
  they should be designed together.
