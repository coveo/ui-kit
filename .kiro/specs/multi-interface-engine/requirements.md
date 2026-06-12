# Requirements Document

## Introduction

The Multi-Interface Engine feature enables a single `Engine` instance in `headless-future` to support multiple use cases simultaneously. Today, an engine supports either a search context or a commerce context, but not both. This feature introduces per-type `build*Interface` functions (e.g., `buildSearchInterface`, `buildCommerceSearchInterface`) that return typed, independently stateful execution contexts with built-in API facade code. Controllers and action loaders bind to a single `interface` parameter. For multi-interface scenarios, `composeInterfaces` merges configured interfaces into a composite that cross-interface controllers can bind to.

## Glossary

- **Engine**: The top-level stateful container that manages application state. Fully opaque — no public state or feature-level access.
- **Interface**: A typed execution context constructed via a per-type build function (e.g., `buildSearchInterface`, `buildCommerceSearchInterface`). Each Interface has a unique identifier and a type that constrains compatible controllers. The type is fully inferred from the build function. Each interface type bundles its API facade code; feature state is lazy-loaded on first use.
- **Interface_Type**: The inferred type of an Interface that acts as a compatibility constraint — determining which controllers can bind to it. Not a feature manifest.
- **Interface_ID**: A unique auto-generated (or explicitly provided) string identifier assigned to each Interface instance.
- **Composed_Interface**: The result of `composeInterfaces({ interfaces: [...] })` — a composite of multiple configured interfaces that satisfies the Interface type constraint. Cross-interface controllers bind to a composed interface. The composed interface owns its own state partition for shared features.
- **Controller**: A stateful object that encapsulates domain logic and binds to a SINGLE `interface` parameter — which can be either an Interface or a Composed_Interface.
- **Two_Tier_Selector**: A request-building strategy where each section of an API request has a default selector (static, returns deterministic values when the feature is inactive) and an operational selector (live, reads from state once the feature self-registers).
- **Action_Loader**: A function that loads a scoped set of imperative action methods bound to a single Interface or Composed_Interface.

## Requirements

### Requirement 1: Build an Interface

**User Story:** As a developer, I want to build typed interfaces against an engine using per-type build functions, so that I can support multiple use cases from a single engine instance.

#### Acceptance Criteria

1. WHEN a per-type build function (e.g., `buildSearchInterface`, `buildCommerceSearchInterface`) is called with an Engine, THE function SHALL create a new Interface instance with a unique auto-generated Interface_ID.
2. THE build function SHALL return the built Interface object with full type inference — no explicit generic annotation required from consumers.
3. THE Interface type SHALL constrain which controllers and Action_Loaders are compatible with it.
4. WHEN multiple Interface instances are built for the same interface type, THE Engine SHALL create separate instances with distinct Interface_IDs.
5. WHERE a developer provides an explicit `id` parameter, THE build function SHALL use the provided value as the Interface_ID and skip auto-generation entirely.
6. THE Interface SHALL bundle its API facade code at build time. Feature state SHALL be lazy-loaded on first use (via controller or action loader).

### Requirement 2: Interface Type Safety

**User Story:** As a developer, I want full TypeScript type safety on interface-specific operations, so that I get compile-time guarantees when binding controllers and actions to interfaces.

#### Acceptance Criteria

1. THE per-type build function SHALL return an Interface whose type constrains which controllers are compatible with it.
2. WHEN a developer passes an Interface to a controller build function, THE type system SHALL verify compatibility at compile time.
3. IF an Interface is passed to an incompatible controller build function, THEN THE type system SHALL produce a compile-time error.
4. WHEN a developer passes an Interface to an Action_Loader, THE type system SHALL verify compatibility at compile time.

### Requirement 3: Controller Binding

**User Story:** As a developer, I want to build controllers bound to a single interface parameter, so that each controller operates within a well-defined scope.

#### Acceptance Criteria

1. WHEN a controller build function is called with an `interface` option, THE Controller SHALL read state exclusively from the specified Interface or Composed_Interface.
2. WHEN a controller build function is called with an `interface` option, THE Controller SHALL dispatch mutations scoped to the specified Interface or Composed_Interface.
3. WHEN the specified Interface or Composed_Interface state changes, THE Controller SHALL notify its subscribers of the state change.
4. IF a controller build function is called with an Interface whose type is incompatible with the controller, THEN THE type system SHALL produce a compile-time error.
5. Controller build functions SHALL accept a single `interface` parameter only — controllers SHALL NOT accept an array of interfaces directly.

### Requirement 4: Interface Composition

**User Story:** As a developer, I want to compose multiple configured interfaces into a single composite, so that cross-interface controllers can drive multiple endpoints from one binding while maintaining a uniform API.

#### Acceptance Criteria

1. WHEN `composeInterfaces({ interfaces: [...] })` is called with an array of configured Interfaces, THE function SHALL return a Composed_Interface instance.
2. THE Composed_Interface SHALL satisfy the Interface type constraint so that it can be passed as the `interface` parameter to controllers and Action_Loaders.
3. THE Composed_Interface SHALL own its own state partition in the store, separate from the partitions of its constituent Interfaces.
4. WHEN a controller bound to a Composed_Interface triggers a submit action, THE Composed_Interface SHALL invoke endpoint requests on all constituent Interfaces concurrently via their built-in facade code.
5. THE type system SHALL restrict which controllers accept a Composed_Interface — single-interface controllers (e.g., pagination, facets, result list) SHALL only accept an Interface, not a Composed_Interface.
6. THE Composed_Interface type restriction on controllers SHALL be designed so that it can be widened in the future without introducing breaking changes.
7. `composeInterfaces` SHALL be usable inline as the `interface` parameter value — no requirement to pre-declare the composed interface as a separate variable.

### Requirement 5: Actions Scoped to an Interface

**User Story:** As a developer, I want to load actions scoped to a single interface or composed interface, so that imperative operations target the correct execution context.

#### Acceptance Criteria

1. WHEN an Action_Loader is called with an `interface` option, THE Action_Loader SHALL return action methods that mutate state on the specified Interface or Composed_Interface.
2. WHEN an action method from a scoped Action_Loader is invoked, THE action SHALL apply the mutation to the Interface or Composed_Interface provided.
3. THE Action_Loader SHALL accept a single `interface` parameter (Interface or Composed_Interface), not an array.
4. IF an Action_Loader is called with an Interface whose type is incompatible with the loaded actions, THEN THE type system SHALL produce a compile-time error.

### Requirement 6: Interface State Isolation

**User Story:** As a developer, I want each interface to maintain isolated state, so that mutations on one interface do not affect another.

#### Acceptance Criteria

1. THE Engine SHALL store feature state using flat keys prefixed by interface ID, where each feature instance gets its own keyed partition.
2. WHEN a mutation is dispatched scoped to Interface A, THE Engine SHALL apply the mutation only to the state partition belonging to Interface A.
3. WHEN Interface A state changes, THE Engine SHALL NOT trigger state change notifications for Interface B subscribers.
4. WHEN a Composed_Interface owns state, THE Engine SHALL store that state in a partition keyed by the composed interface's own ID, separate from the partitions of its constituent Interfaces.

### Requirement 7: Parallel Endpoint Requests via Composition

**User Story:** As a developer, I want the composed interface to invoke endpoint requests on all constituent interfaces in parallel when submit is triggered, so that the user gets results as fast as possible.

#### Acceptance Criteria

1. WHEN a Controller bound to a Composed_Interface triggers a submit action, THE Composed_Interface SHALL invoke the submit lifecycle on all constituent Interfaces concurrently via their built-in facade code.
2. IF one constituent Interface's endpoint request fails, THEN THE Composed_Interface SHALL allow other requests to complete independently.
3. WHEN a constituent Interface's endpoint request completes, THE Engine SHALL update that Interface's state without waiting for other Interfaces.

### Requirement 8: Feature Self-Registration

**User Story:** As a developer, I want features to self-register when I first use them (via controller or action loader), so that I don't need explicit setup beyond importing and calling the function.

#### Acceptance Criteria

1. WHEN a controller or action loader is called for a feature that has not been loaded for that Interface, THE Engine SHALL automatically load the feature (adopt the slice and register selectors).
2. WHEN the same feature is loaded multiple times for the same Interface, THE Engine SHALL treat subsequent loads as idempotent no-ops.
3. WHEN a feature self-registers, THE request builder SHALL include live state values from that feature. Non-registered features SHALL contribute their initial state values.

### Requirement 9: Two-Tier Request Section Selectors

**User Story:** As a developer, I want API requests to always contain valid values for all sections, even when some features aren't active, so that the interface can make well-formed requests at any point.

#### Acceptance Criteria

1. THE Interface request builder SHALL assign a default selector to each section of an API request, returning static deterministic values when the corresponding feature is inactive.
2. THE Interface request builder SHALL assign an operational selector to each section of an API request, reading from live state when the corresponding feature is active.
3. WHEN a feature self-registers, THE request builder SHALL switch from the default to the operational selector for that feature's section.
4. THE selector switch SHALL be idempotent and one-time per feature per Interface.

## Design Constraints

1. THE Interface state SHALL be representable as serializable plain data structures (no closures, class instances, or non-serializable references), enabling future state transfer across runtime boundaries (e.g., SSR hydration).
2. THE Engine SHALL remain fully opaque — no public state or feature-level access on the Engine class itself.
