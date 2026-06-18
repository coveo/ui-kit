## 1. Purpose

This charter defines the criteria used to evaluate architecture and design decisions for thermidor.

A decision is acceptable only if it satisfies all **MUST** requirements and clearly addresses **SHOULD** requirements (see https://www.rfc-editor.org/rfc/rfc2119.html).

**Note**: This charter is a work-in-progress and assumes that the reader has knowledge of the current version of headless.

## 2. Scope

Applies to:

1. Public API design
2. Internal architecture and abstraction boundaries
3. Runtime behavior across supported use cases
4. SSR behavior and lifecycle
5. Packaging and contribution model

## 3. Canonical Definitions

- **Public API surface**: all exported runtime behavior, types, options, and guarantees visible to consumers.

## 4. Decision Requirements

### MUST

- **Full use-case support**
  All known and predictable implementation use cases **MUST** be supported.

- **Public API independence**
  Public API **MUST** be implementation-agnostic and stable.

- **First-class SSR**
  SSR **MUST** be supported as a primary runtime model.

### SHOULD

From highest to lowest priority:

1. **Tree-shaking efficiency**
   Consumers **SHOULD** ship only what they import, with packaging and exports optimized for dead-code elimination.

2. **Migration simplicity**
   Common migrations from current headless **SHOULD** be straightforward and well-documented.

3. **External contribution readiness**
   Architecture boundaries and contribution workflow **SHOULD** be straightforward enough for non-core contributors to deliver safe changes.

## 5. Non-Leakage Policy (Public API)

Public API must not expose implementation concepts from internal state libraries or raw backend transport models.

**Prohibited public exposure**:

1. State-library concepts and types
2. Raw backend client request/response DTOs
3. Public type identities that depend on internal plumbing libraries

**Required public exposure**:

1. Domain-level concepts
2. Implementation-neutral contracts
3. Stable behavior guarantees

## 6. Acceptance Gates

A major architecture decision is approved only if all gates below pass.

- **API gate**
  No unintended public API changes; all intentional changes are reviewed and documented.

- **Leakage gate**
  No prohibited implementation concepts or types in the public contract.

- **Coverage gate**
  Automated validation exists for all required use-case combinations.

- **SSR gate**
  Server-to-client lifecycle is documented and verified for deterministic behavior.

- **Tradeoff gate**
  If a **SHOULD** is not met, rationale and mitigation are explicitly recorded.

## 7. Decision Priority Order

When requirements conflict, resolve in this order:

1. All **MUST** requirements
2. Tree-shaking efficiency
3. Migration simplicity
4. Contribution readiness

## 8. Decision Record Template

Each major decision must include:

1. Decision statement
2. Context and constraints
3. Options considered
4. Chosen option and rationale
5. Impact on **MUST** requirements
6. Impact on **SHOULD** requirements
7. Risks and mitigations
8. Rollout and migration impact

## 9. Exit Criteria for Any Proposal

A proposal is ready to implement when:

1. All **MUST** requirements are satisfied
2. Acceptance gates are defined and testable
3. Known **SHOULD** gaps are documented with mitigation
4. Decision record is complete and approved
