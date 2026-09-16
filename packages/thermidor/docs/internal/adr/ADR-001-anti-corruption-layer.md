# ADR-001: Anti-Corruption Layer

**Status**: `🟡 Proposed` — **not superseded; still applicable.** This decision survived the session-client collapse (ADR-010) intact and is now governed by the v2 charter [ADR-009](./ADR-009-architecture-decision-charter-v2.md) (not the deprecated ADR-000). Under the v2 design the anti-corruption boundary is **largely satisfied by construction** — there is no engine/Redux/transport DTO left to leak — so its cost (the boilerplate/cognitive overhead noted below) has largely evaporated while its benefit remains. §3 below has been re-mapped to the v2 charter; the original ADR-000 mapping is preserved in git history.  
**Related docs**: [ADR-009 Architecture Decision Charter (v2)](./ADR-009-architecture-decision-charter-v2.md), [ADR-010 Unified-Endpoint Session Client](./ADR-010-unified-endpoint-session-client.md)

## 1. Context

- **Business/context drivers**: The thermidor architecture MUST ensure public API independence, therefore it should isolate external concepts and types from the public API surface.
- **Technical constraints**: None
- **Known assumptions**: The anti-corruption layer pattern seems well-adapted to fulfill this goal

## 2. Decision Statement

Implement an anti-corruption layer to isolate the public API surface from the Coveo REST APIs and Redux.

## 3. Requirements & Considerations Mapping

Mapped against the current charter, [ADR-009 (v2)](./ADR-009-architecture-decision-charter-v2.md). (The original mapping was against ADR-000, whose "Full use-case support", "First-class SSR", tree-shaking, migration-simplicity, and contribution-readiness requirements have since been retired or relocated; see ADR-009 §7. That mapping is preserved in git history.)

### MUST

1. **Requirement**: Public API independence
   - **Impact**: Positive — this is the very purpose of an anti-corruption layer.
   - **Under the v2 design**: largely satisfied *by construction*. With no state library, engine, or transport DTOs in the public surface, there is almost nothing left to leak; the anti-corruption boundary is now cheap to hold rather than a standing tax.

2. **Requirement**: Faithful transmission and rendering
   - **Impact**: None (orthogonal). The layer isolates types/concepts; it does not affect what is transmitted or rendered.

3. **Requirement**: Best-in-class consumer DX
   - **Impact**: Positive. Keeping implementation/transport types out of the surface is a precondition for the clean, domain-level, schema-derived types consumers interact with.

4. **Requirement**: Consumer-owned inputs
   - **Impact**: None directly (orthogonal), though the same isolation discipline is what lets the schema be injected rather than baked in (see ADR-014).

### SHOULD

1. **Consideration**: Conditional SSR
   - **Impact**: None (orthogonal).

2. **Consideration**: Simplicity and legibility
   - **Impact**: Positive under v2. The original ADR-000 concern was that the layer added boilerplate and cognitive overhead (a negative against the retired "external contribution readiness" SHOULD). Because the v2 surface has no Redux/engine to wrap, that overhead has largely evaporated — the boundary is now mostly a lint/structural guarantee rather than hand-written indirection.

**Note on migration**: as under ADR-000, public API independence implies breaking changes from current headless. The anti-corruption layer does not *cause* that (the overall architectural decision does); it confirms it. The v2 charter retired "migration simplicity" as a design driver (ADR-009 §7), so this is no longer weighed as a con here.

## 4. Options Considered

### Option A (Selected): Public API surface must go through an anti-corruption layer

- **Summary**: Implement an anti-corruption layer to isolate Redux and the Coveo REST APIs, and enforce its use in all files exposed in the public API surface (e.g., through linting rules).
- **Pros**:
  - Purely mechanical changes made behind the anti-corruption layer have no impact on files in the public API layer
  - Acts as a conceptual guardrail against accidental leakage of undesired types and concepts into the public API surface
- **Cons**:
  - Additional boilerplate and cognitive overhead for contributors
- **Risks**:
  - Contributor frustration
  - Loss of velocity

### Option B: Do not implement anti-corruption layer

- **Summary**: Do not implement an anti-corruption layer at all.
- **Pros**:
  - Simplicity
- **Cons**:
  - Purely mechanical changes that have no behavioral or contractual impact may still require altering files in the public API surface.
- **Risks**:
  - Accidentally breaking public API surface
  - Accidentally leaking external concepts or types into the public API surface

## 5. Decision Rationale

- Public API independence is a MUST (see the v2 charter, [ADR-009](./ADR-009-architecture-decision-charter-v2.md)); the anti-corruption layer directly serves it.
- The positive impact on public API independence is significant enough to be worthwhile.
- The original concern — a negative impact on the (now-retired) "external contribution readiness" SHOULD from added boilerplate/overhead — has largely evaporated under the v2 design, where there is no engine/Redux to wrap and the boundary is mostly structural.

## 6. Public API and Contract Impact

- **Public API changes**: Yes, from current major of headless
- **Backward compatibility impact**: Yes, breaking from current major of headless
- **Deprecations required**: Yes, every external concept / type leaked directly into the public API surface that will not be carried over 1-to-1 into thermidor's public API surface
- **Type/contract stability notes**: Yes, positive impact
- **Non-leakage check (implementation details not exposed)**: Pass

## 7. Operational and Runtime Impact

- **Performance impact**: Negligible
- **Reliability impact**: None identified
- **Security/privacy impact**: None
- **SSR impact (if applicable)**: None
- **Observability impact (logs/metrics/traces)**: Yes, additional steps in traces due to indirections

## 8. Migration and Rollout Plan

- **Consumer migration impact**: Yes, no more external concepts / types in the public API surface; this is a breaking change
- **Rollout strategy (flagged, phased, big-bang)**: Big-bang
- **Rollback strategy**: None
- **Communication plan**: Deprecation notices in current version of headless once the thermidor public API contract is deemed stable enough
