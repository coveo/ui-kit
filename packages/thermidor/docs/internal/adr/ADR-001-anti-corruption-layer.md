# ADR-001: Anti-Corruption Layer

**Status**: `🟡 Proposed`  
**Related docs**: -

## 1. Context

- **Business/context drivers**: The thermidor architecture MUST ensure public API independence, therefore it should isolate external concepts and types from the public API surface.
- **Technical constraints**: None
- **Known assumptions**: The anti-corruption layer pattern seems well-adapted to fulfill this goal

## 2. Decision Statement

Implement an anti-corruption layer to isolate the public API surface from the Coveo REST APIs and Redux.

## 3. Requirements & Considerations Mapping

Map this decision to thermidor's Architecture Decision Charter requirements.

### MUST

1. **Requirement**: Full use-case support
   - **Impact**: None
   - **How satisfied**: N/A

2. **Requirement**: Public API independence
   - **Impact**: Positive
   - **How satisfied**: This is the very purpose of an anti-corruption layer

3. **Requirement**: First-class SSR
   - **Impact**: None
   - **How satisfied**: N/A

### SHOULD

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: None
   - **How addressed (or why deferred)**: N/A

2. **Consideration**: Migration simplicity
   - **Impact**: Negative
   - **How addressed (or why deferred)**: Right now in Headless, Redux and Coveo REST API types and concepts leak directly into the public API surface, preventing public API independence altogether. We established public independence as a MUST of thermidor, which almost unavoidably implies introducing breaking changes. The anti-corruption layer does not cause that (the overall architectural decision does), but it confirms it.

3. **Consideration**: External contribution readiness
   - **Impact**: Negative
   - **How addressed (or why deferred)**: An anti-corruption layer implies additional boilerplate and cognitive overhead. In this case, we believe the benefit outweighs the cost. The boilerplate overhead can at least be partially mitigated through code snippets, scripts, and/or AI agent instructions. The cognitive overhead is something we will have to deal with.

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

- Public API independence is a MUST (see ADR-000)
- External contributor readiness is the 3rd-priority SHOULD (see ADR-000)
- The positive impact on public API independence is significant enough to be worthwhile
- The negative impact on external contributor readiness is relatively minor and can be mitigated to some extent

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
