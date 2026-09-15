---
status: Accepted
date: 2026-09-15
related: []
---

# Internal full-URL converse override as a fast-path escape hatch

## Context and Problem Statement

Thermidor's transport hard-codes the converse request path
(`{organizationEndpoint}/api/preview/organizations/{orgId}/agents/commerce/agui/converse`);
only the host is configurable (via `endpoint`). Consumers that need a different
path — a local gateway, or the internal `/private/converse` endpoint for the
unified internal-search work — cannot reach it without editing the engine.

A more structured solution (making transport coordinates a property of the
contract set) is possible but larger. The internal work needs to move now and
should not block on that design.

## Decision Drivers

- Unblock internal iteration (local gateway / internal endpoint) immediately.
- Keep the public API surface clean — this must not become a supported public knob.
- Minimal, low-risk change; fully backward compatible.

## Considered Options

### Option A: Full-URL override, hidden as `@internal`

- **Summary:** Add an optional `converseUrl` to the engine configuration. When set,
  the client sends the request to that exact URL, bypassing all endpoint/path
  composition. Marked `@internal` so it is not a public API.
- **Pros:** One tiny option; ships today; no public-surface commitment; trivially removable.
- **Cons:** A raw URL escape hatch; scatters endpoint knowledge if overused; no per-surface structure.

### Option B: Structured, contract-bound endpoint resolution

- **Summary:** Resolve transport coordinates from the surface's contract set (e.g.
  a `catalogId` → typed endpoint descriptor via a resolver / pluggable transport
  adapter), so the engine never hard-codes a path.
- **Pros:** Would keep the engine schema-agnostic; a single seam for path and
  related routing concerns; no per-consumer forks.
- **Cons:** Larger, cross-team effort; not ready now; design not settled — it is
  one possibility among several, not a committed direction.

## Decision Outcome

Adopt **Option A now** to iterate fast. Option B is recorded as a possibility to
keep on the table, not a committed plan — we may revisit this problem more
thoroughly later (likely via one or more RFCs) once there is appetite and the
requirements are clearer. `converseUrl` is deliberately `@internal` so it never
becomes part of the public contract.

### Rationale

The override is the smallest change that unblocks the internal endpoint today.
The `@internal` tag keeps it out of the public API, so if a more structured
approach is adopted later, replacing the override requires no public deprecation.
This ADR exists to leave a trace of why the escape hatch is here and of the
alternatives we considered, without committing to any particular future design.

## Consequences

- **Positive:** Internal consumers can target any converse URL immediately; zero public-API impact; backward compatible (default composition unchanged).
- **Negative:** A raw-URL escape hatch exists; if leaned on broadly it re-scatters endpoint knowledge (mitigated by `@internal` + this ADR).
- **Neutral:** Trust/authorization stays server-side; the override only changes where the request is sent, not what the gateway permits.

## Implementation and Follow-up

- `converseUrl?: string` on the engine configuration (`@internal`), threaded to the
  unified endpoint client, which uses it verbatim when present.
- Revisit if/when a more structured endpoint-resolution approach is taken up; the
  override can then be removed. Until then it stays as the fast path.
