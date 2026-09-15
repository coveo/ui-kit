---
status: Accepted
date: 2026-09-15
related:
  - https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6896418852 # RFC — Catalog-Bound Endpoint Resolution
  - https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6899990561 # RFC — Signalling Execution Mode from Client to Backend
---

# Internal full-URL converse override as a fast-path escape hatch

## Context and Problem Statement

Thermidor's transport hard-codes the converse request path
(`{organizationEndpoint}/api/preview/organizations/{orgId}/agents/commerce/agui/converse`);
only the host is configurable (via `endpoint`). Consumers that need a _different
path_ — a local gateway, or the internal `/private/converse` endpoint for the
unified internal-search work — cannot reach it without editing the engine.

The durable fix (making transport coordinates a property of the contract set) is
designed in the Catalog-Bound Endpoint Resolution RFC. That is a larger change.
The internal work needs to move now, and does not want to block on the RFC.

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

### Option B: Catalog-Bound Endpoint Resolution (the RFC)

- **Summary:** Resolve transport coordinates from the surface's `catalogId` via a
  typed endpoint descriptor + resolver + pluggable transport adapter; execution
  mode rides the same descriptor.
- **Pros:** Restores the schema-agnostic engine; one seam for path + routing policy; no forks.
- **Cons:** Larger, cross-team effort; not ready now.

## Decision Outcome

Adopt **Option A now** to iterate fast, and pursue **Option B** as the durable
solution. `converseUrl` is deliberately `@internal` and documented as an escape
hatch that Option B will supersede.

### Rationale

The override is the smallest possible change that unblocks the internal endpoint
today, while the `@internal` tag keeps it out of the public contract so adopting
the RFC later requires no public deprecation. Option B is preferred long-term but
must not gate current work.

## Consequences

- **Positive:** Internal consumers can target any converse URL immediately; zero public-API impact; backward compatible (default composition unchanged).
- **Negative:** A raw-URL escape hatch exists; if leaned on broadly it re-scatters endpoint knowledge (mitigated by `@internal` + this ADR).
- **Neutral:** Trust/authorization stays server-side; the override only changes where the request is sent, not what the gateway permits.

## Implementation and Follow-up

- `converseUrl?: string` on the engine configuration (`@internal`), threaded to the
  unified endpoint client, which uses it verbatim when present.
- Remove `converseUrl` once Catalog-Bound Endpoint Resolution lands, migrating
  internal consumers to `catalogId`-driven resolution.
