# ADR-003: Publish the Thermidor Schema Contract and TypeScript Projection

**Status:** Accepted
**Date:** 2026-08-03
**Deciders:** Thermidor Stack team

## Context

ADR-001 establishes Thermidor's schema as a standalone contract that producers and consumers can evolve against independently. It also identifies public exposure as the intended long-term direction. The contract is currently maintained in a private repository and is expressed only as JSON Schema documents.

Public TypeScript consumers need an installable, runtime-validatable projection of that contract. The initial package will be published to npm as `@coveo/thermidor-schema`, under the Coveo scope, and will include Zod schemas and inferred TypeScript types derived from the canonical JSON Schema.

The package must be reviewable and verifiable by its consumers. npm provenance establishes a verifiable link between a published package, its source, and its build instructions. npm's GitHub Actions trusted publishing supports provenance for public packages built from public repositories, but does not generate provenance for packages published from private source repositories.

Publishing this contract therefore requires a source and release model that keeps the canonical schemas, projection generator, generated output, tests, and release workflow together in an auditable public repository.

## Decision Drivers

- Public consumers need a stable npm package with runtime validators and TypeScript types.
- JSON Schema remains the canonical, language-neutral contract for current and future projections.
- Consumers must be able to inspect the source and build instructions for published artifacts.
- Releases should use short-lived GitHub Actions OIDC credentials rather than long-lived npm publishing tokens.
- The package must carry npm provenance.
- The source contract must not be duplicated or allowed to drift from its published projection.
- Future language projections, including Java, must be able to use the same canonical schema source.

## Decision

We will make this repository public after the publication-readiness gates described below pass. It remains the canonical source for Thermidor's JSON Schema contract and for generated language projections.

We will publish a public Apache-2.0 licensed npm package named `@coveo/thermidor-schema`. The first package release will be `0.1.0`; the package and contract may evolve within `0.x` while their public API is still maturing.

The TypeScript package will ship a Zod projection for renderer-neutral domain values, controller state, and action payloads. JSON Schema remains authoritative; Zod is an ergonomic TypeScript runtime projection rather than an independent contract definition.

Releases will be built and published from GitHub Actions using npm trusted publishing with OIDC. The workflow will publish only after validation, generation, type checking, tests, and package smoke tests succeed. It will generate npm provenance for the public package from this public repository. Once trusted publishing is configured, publishing tokens will not be used for routine releases.

## Alternatives Considered

### Publish a public npm package from this private repository

This would make the package installable by public consumers, but npm provenance is not generated from private source repositories. Consumers would also be unable to audit the source and build instructions associated with the package.

We reject this alternative because it does not satisfy the package-verifiability goal.

### Keep canonical schemas private and maintain a separate public projection repository

A public repository could contain generated Zod output and a release workflow while the canonical schemas remained private.

We reject this alternative because it creates two sources that must remain synchronized. It risks release drift, obscures the complete contract and generator inputs from consumers, and makes the public provenance source incomplete unless the canonical schemas and build logic are duplicated.

### Publish generated artifacts manually from a private pipeline

Manual publication can expose a public package, but it relies on long-lived credentials or a non-auditable release process. It also does not give consumers a verifiable, source-complete build path.

We reject this alternative because it weakens the supply-chain security and reproducibility of releases.

### Distribute the contract only through private registries or repository access

Private distribution would avoid publishing the repository and package, but it requires every consumer to receive Coveo access and does not support the intended public-consumer use case.

We reject this alternative because it adds onboarding friction and conflicts with the goal of a public contract.

### Publish only JSON Schema and require TypeScript consumers to interpret it

Consumers could generate their own types and validators from the canonical schemas.

We reject this alternative because it duplicates generation and validation work, permits inconsistent projections, and provides a poorer TypeScript developer experience than a maintained Zod package.

## Consequences

### Positive

- The npm package, its source, and its build instructions are publicly auditable from one canonical repository.
- GitHub Actions OIDC trusted publishing removes long-lived publishing credentials from routine releases.
- npm provenance lets consumers verify where and how a package was built.
- JSON Schema remains reusable by TypeScript, Java, and future language projections.
- Public consumers receive maintained Zod validators and TypeScript types instead of independently translating the contract.

### Negative and trade-offs

- Repository history and all future changes must be suitable for public visibility.
- The repository needs public-facing documentation, security reporting guidance, contribution expectations, protected branches, and release controls.
- Schema and package evolution must be managed deliberately, even during `0.x` development, to avoid surprising public consumers.
- A release-readiness audit is required before changing repository visibility.

## Publication-Readiness Gates

Before the repository is made public or `@coveo/thermidor-schema` is published:

1. Audit the repository history and current content for credentials, private endpoints, customer data, and other non-public material.
2. Add the Apache-2.0 license, public README, security policy, contribution guidance, and release documentation.
3. Define schema identity, hosting, and compatibility rules, including how incompatible contract majors receive distinct schema identities.
4. Add CI that validates canonical JSON Schema, verifies generated output, type-checks and tests the TypeScript projection, and smoke-tests the packed npm artifact.
5. Configure protected branches, required checks, release-tag protection, and a GitHub release environment with appropriate review controls.
6. Configure the npm package's GitHub Actions trusted publisher and restrict routine publishing to OIDC-based releases.

## Scope

This decision publishes the schema contract and its language projections. It does not require publication of unrelated Thermidor implementation, backend services, or future Java source outside this repository. It also does not define the full schema compatibility policy, TypeScript generator implementation, or Java projection; those will be addressed by subsequent decisions and implementation work.
