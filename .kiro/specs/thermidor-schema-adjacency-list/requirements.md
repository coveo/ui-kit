# Requirements Document

## Introduction

This feature — `thermidor-schema-adjacency-list` (KIT-6147 track #1) — implements the **purely additive** schema-layer changes for [ADR-007](../../../packages/thermidor-schema/docs/ADR-007-adopt-a2-ui-adjacency-list-composition.md) and its [Annex A](../../../packages/thermidor-schema/docs/ADR-007-annex-a-composition-adjacency-list-analysis.md): introducing the A2-UI v1.0 adjacency list composition primitives to the `@coveo/thermidor-schema` contract, without removing or repurposing any existing field.

Today the Thermidor contract models each component as `{ componentId, displayName, componentType, state, actions }` in a flat map, but has no contract-level way to express that one component owns an ordered set of other components. This feature introduces a uniform, contract-level composition primitive **additively**: a component may reference its children **by id** via an optional `children: string[]` (and optionally `child: string` for single-child components), forming a tree by reference in the existing flat map, with an explicit `rootId` declared in a new composition-snapshot contract. Because `children`/`child` are optional (default `[]`), adding them changes no existing behavior.

The scope of this spec is a single, additive schema-contract change in `@coveo/thermidor-schema`:
- Add optional `children` (array of child-ref, default `[]`) and optional `child` (child-ref) to the Base_Component_Contract, re-declared in each component document.
- Add a new `child-ref` shared definition, a new `commerce-search` surface-root component (added to the component-contracts union), and a new `Composition_Snapshot_Contract` (`rootId` + components map, validated through a triad view).
- Regenerate the Zod projection (no `z.lazy`) and export the new schemas/types.
- Update the `@coveo/thermidor` SDK **only** for the widened union (a minimal `commerce-search` instance where the union is enumerated); build and tests pass.

**Explicitly out of scope — deferred to `thermidor-commerce-search-composition` (KIT-6147 track #2):** the entire composition switch-over. This spec does **not** remove `facetIds` from `FacetManagerState` (it stays exactly as on `main`), does **not** touch `BundleSlot.surfaceRef` (it stays as on `main`), does **not** modify the `packages/platform-mock-api` Thermidor mock templates (no emitting of `children`/`rootId` on A2-UI nodes, no state changes), and does **not** modify the `samples/thermidor/demo-schema-react` renderers (FacetManager/BundleDisplay keep their current mechanism — facet ordering via `facetIds` + a `childComponents` map, bundle products via `surfaceRef`). Mounting the A2-UI composition tree via `children(id)` from `@copilotkit/a2ui-renderer`, the root-mapping problem (`id` ≠ `'root'`), the retirement of `facetIds`/`surfaceRef`, placing `children` on A2-UI component nodes, and the root mapping are all track #2 concerns.

The composition snapshot (an explicit `rootId` plus the flat component map) lives on the A2-UI composition plane, while per-component state continues to travel on the AG-UI transport keyed by `componentId`, consistent with the ADR-002 boundary. Additivity is the approach taken here (per ADR-007, `children` optional with a default of `[]`). Because the real backend is not implemented and no external client consumes the `@coveo/thermidor-schema` contract yet, and because no existing field is removed, the contract change made here is not breaking in practice. The only in-repo consumer touched is the `@coveo/thermidor` SDK, updated in lockstep solely for the widened union; the `packages/platform-mock-api` templates and both `samples/thermidor/*` samples are left unchanged and must keep building and passing their tests. Per-component `state`/`actions` and the per-`componentId` transport are unchanged (ADR-006). No parse-time validation of the parent/child relationship is introduced (children hold ids; the backend is the trusted owner of composition). ADR-007 and Annex A are the source of truth; where this document and the ADR disagree, the ADR prevails.

This spec covers the additive schema portion of Phase 1 (Schema) of Annex A section 8. Because the composition fields are optional and nothing existing is removed, the mock templates and the samples continue to build and pass without modification. Placing composition on the A2-UI component nodes, removing `children` from the AG-UI state, removing `facetIds`/`surfaceRef`, mounting the A2-UI tree via CopilotKit's `children(id)`, and resolving root mapping are all deferred to `thermidor-commerce-search-composition`. Server payload population against the real backend (Phase 3) and consolidation of existing cases onto `children` (Phase 4) also remain out of scope, except for introducing the surface-root component types the model requires.

## Glossary

- **Thermidor_Schema**: The `@coveo/thermidor-schema` package, comprising the canonical JSON Schema documents under `schema/`, the generated Zod projections under `src/generated/schemas.ts`, and the public exports in `src/index.ts`.
- **Base_Component_Contract**: The base component JSON Schema document at `schema/base/component.schema.json`, referenced by every component schema via `allOf`.
- **Component_Contract**: A single component's JSON Schema document (e.g. `regular-facet.schema.json`) that constrains `componentType`, `state`, and `actions` for one component type.
- **Component_Contracts_Union**: The discriminated union of all Component_Contracts, defined in `schema/components/component-contracts.schema.json` and projected to the Zod `ComponentContractsSchema`.
- **Component_Contracts_Triad**: A projection of the Component_Contracts_Union used to validate composition-snapshot map values: it unions the same component members but omits the base identity fields (`componentId`/`displayName`), validating each value as the `{componentType, state, actions}` triad plus the optional `children`/`child`. It exists so Ajv and the identity-free Zod projection agree.
- **Children_Field**: The optional `children` property on the Base_Component_Contract: an ordered array of component id strings referencing other components in the same flat map. Default `[]`.
- **Child_Field**: The optional `child` property on the Base_Component_Contract: a single component id string, following the A2-UI single-child convention.
- **Component_Id**: A component instance identifier, matching the pattern `^[a-z][a-z0-9-]*$`, unique within a flat component map.
- **Flat_Component_Map**: The runtime map keyed by Component_Id, where each value is a component object. Composition is expressed by reference between entries, not by physical nesting.
- **Composition_Snapshot_Contract**: A new JSON Schema document describing the A2-UI composition envelope of a surface — an explicit `rootId` plus the Flat_Component_Map. It expresses composition (which components exist, what contains what, in what order) on the A2-UI plane; it is distinct from the AG-UI per-component state transport (StateSnapshot/StateDelta), which continues to carry each component's `state` keyed by `componentId` (ADR-002, ADR-006).
- **Root_Id**: The `rootId` field of the Composition_Snapshot_Contract, naming the Component_Id at the top of the composition tree.
- **Surface_Root_Component**: A component whose `componentType` names a surface intent (e.g. `commerce-search`) and that sits at the Root_Id of a surface. Its `componentType` carries the surface intent, so no separate surface-type discriminant is needed.
- **Zod_Projection**: The generated Zod schemas in `src/generated/schemas.ts`, produced by `scripts/generate-zod.ts` from the canonical JSON Schema documents.
- **Generation_Pipeline**: The `pnpm run generate` process that projects the canonical JSON Schema documents into the Zod_Projection.

## Requirements

### Requirement 1: Children field on the base component contract

**User Story:** As a backend producer, I want a uniform `children` field on every component contract, so that I can declare the ordered set of components a container owns without a per-case ad-hoc mechanism.

#### Acceptance Criteria

1. THE Base_Component_Contract SHALL define an optional `children` property of type array whose items are strings, containing at most 1000 items.
2. WHERE a component provides no `children` property, THE Thermidor_Schema SHALL treat the Children_Field as the default empty array.
3. THE Base_Component_Contract SHALL constrain each item of the Children_Field to match the Component_Id pattern `^[a-z][a-z0-9-]*$`.
4. IF a component provides a `children` array containing an item that does not match the Component_Id pattern `^[a-z][a-z0-9-]*$`, THEN THE Thermidor_Schema SHALL reject the component and produce a validation error, without partially accepting the component.
5. THE Base_Component_Contract SHALL document that the order of the Children_Field is backend-owned and meaningful for container components.
6. WHERE a component provides a `children` array with two or more identical strings, THE Thermidor_Schema SHALL accept the component as valid, because ordering and referential integrity are owned by the backend and not enforced at parse time.
7. THE Base_Component_Contract SHALL preserve the existing required properties `componentId`, `displayName`, `componentType`, `state`, and `actions` without adding the Children_Field to the required list.

### Requirement 2: Single-child field on the base component contract

**User Story:** As a backend producer, I want an optional single-child `child` field, so that single-child components follow the A2-UI convention instead of wrapping one id in an array.

#### Acceptance Criteria

1. THE Base_Component_Contract SHALL define an optional `child` property of type string.
2. THE Base_Component_Contract SHALL constrain the Child_Field to match the Component_Id pattern `^[a-z][a-z0-9-]*$`.
3. WHEN a component without a `child` property is validated, THE Thermidor_Schema SHALL accept the component as valid.
4. IF a component provides a `child` value that does not match the Component_Id pattern `^[a-z][a-z0-9-]*$`, THEN THE Thermidor_Schema SHALL reject the component and produce a validation error.
5. THE Base_Component_Contract SHALL document that the Child_Field references a single component by Component_Id following the A2-UI single-child convention.

### Requirement 3: Additive composition change applied to the schema and the SDK union

**User Story:** As a maintainer of the Thermidor stack, I want the composition fields added additively to the schema contract and the SDK widened only for the new union member, so that the contract gains the adjacency-list primitives without removing any existing field and without touching the mock templates or the samples.

#### Acceptance Criteria

1. WHERE the composition fields are added, THE Thermidor_Schema SHALL define the Children_Field as an optional array of strings defaulting to the empty array and the Child_Field as an optional string, so that a component that declares neither field remains valid.
2. THE Thermidor_Schema SHALL define the Children_Field as an array of zero or more strings and the Child_Field as a single string, each referencing another component by `componentId`, rather than as nested component objects, so that no recursion is introduced into the contract.
3. THE Generation_Pipeline SHALL project the Children_Field and the Child_Field into the Zod_Projection without emitting any `z.lazy()` call.
4. THE Thermidor_Schema SHALL leave every component's `state` and `actions` contracts unchanged by this feature, including the `facet-manager` (which retains its existing `facetIds` state field exactly as before), resolving per-`componentId` state exactly as before the change.
5. THE Thermidor_Schema SHALL allow each existing Component_Contract (`product-carousel`, `cart`, `next-actions-bar`, `bundle-display`, `comparison-table`, `product-list`, `pagination`, `sort`, `search-box`, `regular-facet`, `numeric-facet`, `date-facet`, `category-facet`, `facet-manager`) to carry the Children_Field and Child_Field through the Base_Component_Contract without any edit to that Component_Contract's own `state` or `actions`.
6. WHEN the composition change is applied, THE feature SHALL update the `@coveo/thermidor` SDK as needed so that it builds and passes its tests against the widened Component_Contracts_Union, including providing a minimal `commerce-search` instance wherever the union members are enumerated.
7. THE feature SHALL NOT modify the `packages/platform-mock-api` Thermidor mock templates, and those templates SHALL continue to build and pass their tests unchanged, because the composition fields are optional and no existing composition mechanism (`surfaceRef`, `facet-manager` `facetIds`) is retired in this spec.
8. THE feature SHALL NOT modify the `samples/thermidor/demo-schema-react` renderers (`FacetManager.tsx`, `BundleDisplay.tsx`), and that sample SHALL continue to build and pass its tests unchanged, keeping its current rendering mechanism (facet ordering read from `facetIds` with the existing `childComponents` map, bundle products read via `surfaceRef`).
9. THE feature SHALL NOT modify `samples/thermidor/demo-react`, and that sample SHALL continue to build and pass its tests using the real backend through the `@coveo/thermidor` SDK.
10. THE feature SHALL include a changeset for `@coveo/thermidor-schema` that declares an appropriate non-breaking semver bump level and describes the additive composition change, because no external consumer depends on the schema contract yet and no existing field is removed.

### Requirement 4: Composition snapshot contract with an explicit root

**User Story:** As a consumer, I want the A2-UI composition envelope — an explicit `rootId` plus the flat component map — declared in its own contract distinct from the AG-UI state message, so that I know where the composition tree starts without relying on a magic id or position and without conflating composition with per-component state transport.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL define a Composition_Snapshot_Contract as a canonical JSON Schema document with an absolute `$id` under the `https://schema.thermidor.coveo.com/` namespace.
2. THE Composition_Snapshot_Contract SHALL require a `rootId` property of type string matching the Component_Id pattern `^[a-z][a-z0-9-]*$`.
3. IF a Composition_Snapshot_Contract instance omits the `rootId` property, or provides a `rootId` that is not a string, or provides a `rootId` string that does not match the Component_Id pattern `^[a-z][a-z0-9-]*$`, THEN THE Thermidor_Schema SHALL reject the instance as structurally invalid and SHALL produce a validation error indicating the offending `rootId`.
4. THE Composition_Snapshot_Contract SHALL require a `components` property representing the Flat_Component_Map, without constraining the keys of the Flat_Component_Map to the Component_Id pattern at parse time, because Component_Id validity of the map keys is owned by the backend and not enforced at parse time, consistent with Requirement 4.8 and Requirement 1.6.
5. THE Composition_Snapshot_Contract SHALL constrain each value of the Flat_Component_Map to conform to the triad view of the Component_Contracts_Union — a projection that unions the same component members but omits the base identity fields (`componentId`/`displayName`), so each map value is validated as the `{componentType, state, actions}` triad plus the optional Children_Field/Child_Field, consistent with what the Zod projection produces (Ajv↔Zod agreement).
6. IF a value in the Flat_Component_Map does not conform to that triad view, THEN THE Thermidor_Schema SHALL reject the instance as structurally invalid and SHALL produce a validation error indicating the offending Component_Id key.
7. WHEN a Composition_Snapshot_Contract instance declares an empty Flat_Component_Map containing zero entries, THE Thermidor_Schema SHALL accept the instance as structurally valid.
8. WHEN a Composition_Snapshot_Contract instance references a Root_Id that is absent from the Flat_Component_Map, THE Thermidor_Schema SHALL accept the instance as structurally valid, because referential integrity between Root_Id and the Flat_Component_Map is owned by the backend and not enforced at parse time.
9. THE Composition_Snapshot_Contract SHALL express composition on the A2-UI plane (rootId plus the Flat_Component_Map) and SHALL NOT redefine or carry the AG-UI per-component `state` transport, which continues to deliver each component's `state` keyed by `componentId` (ADR-002, ADR-006).

### Requirement 5: Surface-root component types

**User Story:** As a backend producer, I want surface-root component types such as `commerce-search`, so that a surface's intent is carried by its root component's `componentType` without a separate surface-type discriminant.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL define the `commerce-search` Surface_Root_Component as a canonical Component_Contract JSON Schema document with an absolute `$id` under the `https://schema.thermidor.coveo.com/` namespace, whose `componentType` is fixed to the constant string value `commerce-search`.
2. THE `commerce-search` Component_Contract SHALL reference the Base_Component_Contract via `allOf` so that a `commerce-search` component carries the Children_Field and the Child_Field, and SHALL preserve the base required properties `componentId`, `displayName`, `componentType`, `state`, and `actions` without adding new required properties beyond the base.
3. THE Thermidor_Schema SHALL add the `commerce-search` Surface_Root_Component to the Component_Contracts_Union as a member keyed on the `componentType` discriminator, using a discriminator value distinct from every other member of the union.
4. WHEN the Component_Contracts_Union resolves a component whose `componentType` equals the constant string `commerce-search`, THE Thermidor_Schema SHALL resolve it to the `commerce-search` Component_Contract and reject any other `componentType` value against that member.
5. THE `commerce-search` Component_Contract SHALL fix `componentType` to the constant string `commerce-search`, which conforms to the base `componentType` pattern `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`.

### Requirement 6: Regenerated Zod projection and exports

**User Story:** As a downstream consumer importing `@coveo/thermidor-schema`, I want the Zod projections and exports regenerated from the updated schemas, so that the TypeScript/Zod contract reflects the new composition model.

#### Acceptance Criteria

1. WHEN the Generation_Pipeline runs against the updated canonical JSON Schema documents, THE Thermidor_Schema SHALL regenerate `src/generated/schemas.ts` so that it exports a named Zod schema value for the Composition_Snapshot_Contract projection and a named Zod schema value for each Surface_Root_Component projection.
2. WHEN `pnpm run generate:check` runs after the schemas are regenerated and the committed `src/generated/schemas.ts` is byte-for-byte identical to the generator output, THE Thermidor_Schema SHALL complete the check with a success indication.
3. IF `pnpm run generate:check` runs and the committed `src/generated/schemas.ts` differs from the generator output, THEN THE Thermidor_Schema SHALL complete the check with a failure indication reporting that the committed file is out of date, without modifying the committed file.
4. THE Thermidor_Schema SHALL export the generated Zod schema value and inferred type for the Composition_Snapshot_Contract from `src/index.ts`.
5. THE Thermidor_Schema SHALL export the generated Zod schema value and inferred type for each Surface_Root_Component from `src/index.ts`.
6. WHEN the Zod_Projection validates a component whose `children` property is an array of zero or more strings, THE Thermidor_Schema SHALL accept the component as valid.
7. IF the Zod_Projection validates a component whose `children` property is present but is not an array of strings, THEN THE Thermidor_Schema SHALL reject the component and produce a validation error indicating that `children` must be an array of strings, leaving the input unmodified.
8. WHEN the Component_Contracts_Union Zod schema (`ComponentContractsSchema`) resolves a component by `componentType`, THE Thermidor_Schema SHALL resolve each Surface_Root_Component to its own Component_Contract, including resolving a `commerce-search` component to the `commerce-search` Component_Contract.
9. WHERE the shared `child-ref` definition is projected, THE Generation_Pipeline SHALL inline its pattern `^[a-z][a-z0-9-]*$` at each use site as `z.string().regex(...)` rather than emitting a named `ChildRefSchema` Zod value or `ChildRef` type, and THE Thermidor_Schema SHALL NOT export a named `ChildRefSchema`/`ChildRef` from `src/index.ts`; this inlining is intentional, and `child-ref` remains the single JSON-Schema-level source of the Component_Id pattern.

### Requirement 8: Contract validation and package integrity preserved

**User Story:** As a maintainer, I want the existing validation, freshness, and packaging guarantees to hold after the change, so that consumers can continue to rely on the handoff preconditions.

#### Acceptance Criteria

1. WHEN `pnpm run validate:schema` runs against the updated canonical JSON Schema documents, THE Thermidor_Schema SHALL report that every document is structurally valid, where structurally valid means each document declares an absolute `$id` and every `$ref` reference resolves to an existing target, and SHALL complete with a success (zero) exit status.
2. IF any updated canonical JSON Schema document lacks an absolute `$id` or contains a `$ref` reference that does not resolve, THEN THE Thermidor_Schema SHALL complete `pnpm run validate:schema` with a non-success (non-zero) exit status and SHALL emit a message identifying the offending document.
3. WHEN `pnpm run test` runs, THE Thermidor_Schema SHALL report, for each changed contract, that its Zod projection accepts every input the corresponding Ajv-validated JSON Schema document accepts and rejects every input that document rejects, and SHALL complete with a success (zero) exit status.
4. IF, for any changed contract, the Zod projection and the corresponding Ajv-validated JSON Schema document disagree on accepting or rejecting a test input, THEN THE Thermidor_Schema SHALL complete `pnpm run test` with a non-success (non-zero) exit status and SHALL emit a message identifying the diverging contract.
5. WHEN `pnpm run build` runs, THE Thermidor_Schema SHALL compile the package to `dist/` with a success (zero) exit status and no type errors, and IF a type error occurs, THEN THE Thermidor_Schema SHALL complete with a non-success (non-zero) exit status and SHALL NOT emit compiled output to `dist/` for the failing input.
6. THE Thermidor_Schema SHALL include at least one valid Composition_Snapshot_Contract test fixture that populates the added composition fields (`children`, `child`, and `rootId`) and that the Zod projection accepts, and at least one invalid Composition_Snapshot_Contract test fixture that violates the added composition fields and that the Zod projection rejects.
7. WHERE the `@coveo/thermidor-schema` package source is modified, THE feature SHALL include a changeset file that names `@coveo/thermidor-schema`, declares an appropriate non-breaking semver bump level (minor or patch, as appropriate for a 0.x package), and describes the change, because no external consumer depends on the contract yet and all in-repo consumers are updated in lockstep.
