---
status: Accepted
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

- It reaches _through_ the schema boundary. We built a typed, validated,
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
  need: the client should be _told_ the route, not infer it).

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

---

## Addendum (2026-09-24): the A2-UI v0.9 renderer projection

A second derived projection of the same class now lives beside `response.surfaces`:
**`response.a2uiMessages`**, the turn's A2-UI message stream downgraded to the v0.9
shape a renderer consumes. It is recorded here rather than in its own ADR because it
is the same debt, in the same function, with the same retirement shape: an interim
client-side compensation for something the protocol ends should settle between
themselves.

### Why it exists

The two ends of the protocol are pinned one minor version apart with nothing in
between:

- **Agent Gateway emits A2-UI v1.0 exclusively.** `A2uiMessage.VERSION` is `"v1.0"`
  and it throws on any other version, on both construct and parse; its snapshot and
  state paths are v1.0-only by construction.
- **Every available renderer consumes v0.9.** `@copilotkit/a2ui-renderer` builds its
  `MessageProcessor` from `@a2ui/web_core/v0_9`, and `@a2ui/web_core@0.9.0` publishes
  no `v1_0` subpath. There is, at time of writing, zero renderer that consumes v1.0.

Something must bridge that gap before a consumer can render anything.

### Options considered

- **Revert the server to an older A2-UI version.** Rejected: Gateway is v1.0-only by
  construction, and the older AgentSmith encoder emits `beginRendering`/`surfaceUpdate`,
  which the v0.9 processor does not recognize — so this is two wire generations away
  from the renderer, not one, and it would cost the inline-`dataModel` state path.
- **Downgrade in Agent Gateway.** Rejected: a server breaking change is worse than a
  package one. Gateway would emit a shape its own model refuses to parse, breaking its
  round-trip invariant and the snapshot processor; it is a cross-team change; and
  rolling it back is a deploy rather than a package bump.
- **Leave it in each consumer's frontend (status quo).** Rejected: it asks every
  consumer to reimplement the conversion, which is not a shipping story for the first
  Unified-API clients.
- **Selected: derive it once in the fold and expose it on `TurnResponse`.** One
  auditable site, no server change, removable in a package version.

### Charter exception (ADR-009)

This knowingly takes an exception to two charter requirements, for a bounded period:

- **§4 MUST — faithful transmission and rendering.** Thermidor rewrites the message
  envelope rather than exposing the server's stream verbatim. Mitigation: `activities`
  remain raw v1.0 and are the only source of truth; `a2uiMessages` is derived, so
  nothing downstream of the fold — surface derivation, in-transit `updateDataModel`
  validation, serialization — observes the downgrade.
- **§5 / leakage gate — no transport DTO shapes in the public API.** A renderer's wire
  shape now reaches the public surface. Mitigation: it is typed as
  `A2uiV09Message = Record<string, unknown>` rather than a structural type, so the
  coupling stays contained and is not deepened by per-operation types.
- **§6 tradeoff gate:** recorded here, with the retirement condition below.

### Retirement condition

Remove the projection when BOTH hold:

1. `@a2ui/web_core` publishes a `./v1_0` subpath, or its `v0_9` `MessageProcessor`
   learns to read inline `components[]`; and
2. the renderer consumers use (today `@copilotkit/a2ui-renderer`) imports it.

Then delete `session/a2ui-v09-projection.ts`, drop `a2uiMessages` from `TurnResponse`
and from the fold, and let consumers read `response.activities` directly. That is a
breaking change to `@coveo/thermidor`, which is intended and acceptable while the
package is `0.x` — and is precisely why this compensation belongs in the package
rather than in the server.

### Coupling to serialization ([ADR-011](./ADR-011-session-serialization.md))

`a2uiMessages` follows the same rule as `surfaces`: never persisted, re-derived from
persisted `activities` on restore. A property test asserts the projection is a pure,
re-derivable function of the activity list.
