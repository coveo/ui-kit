## 1. Purpose

This charter defines the criteria used to evaluate architecture and design decisions for headless-future.

A decision is acceptable only if it satisfies all **MUST** requirements and clearly addresses **SHOULD** requirements.

## 2. Scope

Applies to:

1. Public API design
2. Internal architecture and abstraction boundaries
3. Runtime behavior across supported use cases
4. SSR behavior and lifecycle
5. Packaging and contribution model

## 3. Canonical Definitions

1. **Single use case**: commerce-only or knowledge-only.
2. **Hybrid use case**: commerce and knowledge in the same experience.
3. **Generative use case**: conversational interaction mode, over single or hybrid scope.
4. **Public API surface**: all exported runtime behavior, types, options, and guarantees visible to consumers.

## 4. Decision Requirements

### MUST

1. **Full use-case support**
   Architecture must support:
   - non-generative single
   - non-generative hybrid
   - generative single
   - generative hybrid

2. **Public API independence**
   Public API must be implementation-agnostic and stable.
   Internal plumbing can change mechanically without public contract changes.

3. **First-class SSR**
   SSR must be supported as a primary runtime model, including:
   - server initialization
   - state transfer
   - client hydration
   - deterministic contract-level behavior across server and client

### SHOULD

1. **Migration simplicity**
   Common migrations from current headless should be straightforward and well-documented.
2. **Tree-shaking efficiency**
   Consumers should ship only what they import, with packaging and exports optimized for dead-code elimination.
3. **External contribution readiness**
   Architecture boundaries and contribution workflow should be clear enough for non-core contributors to deliver safe changes.

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

1. **API gate**
   No unintended public API changes; all intentional changes are reviewed and documented.
2. **Leakage gate**
   No prohibited implementation concepts or types in the public contract.
3. **Coverage gate**
   Automated validation exists for all required use-case combinations.
4. **SSR gate**
   Server-to-client lifecycle is documented and verified for deterministic behavior.
5. **Tradeoff gate**
   If a SHOULD is not met, rationale and mitigation are explicitly recorded.

## 7. Decision Priority Order

When requirements conflict, resolve in this order:

1. Full use-case support
2. Public API independence
3. SSR support
4. Tree-shaking efficiency
5. Migration simplicity
6. Contribution readiness

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
