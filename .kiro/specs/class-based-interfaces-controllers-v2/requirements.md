# Requirements Document

## Introduction

Migrate the thermidor package from factory-function frozen object literals to a class-based internal architecture (ADR-005 v2). The public API (factory functions like `buildSearchInterface()`) remains unchanged. Classes are internal implementation details that provide DRY behavior sharing, proper dispose semantics, type discrimination, and simplified internal access patterns using non-exported symbols instead of `#private` fields with friend functions.

## Glossary

- **Engine**: The core Redux store wrapper that manages state, slice adoption, and subscriptions for the thermidor package.
- **FullEngine**: An internal projection of Engine exposing `mutate`, `read`, `subscribe`, `adoptSlice`, and `storeHydrationSnapshot` methods. Obtained via `getFullEngine()`.
- **BaseInterface**: An abstract class providing shared interface behavior including symbol-keyed properties, thunk resolution with caching, and dispose lifecycle.
- **SearchInterface**: A concrete class extending BaseInterface for search use cases, providing search and query-suggest facade resolvers.
- **CommerceInterface**: A concrete class extending BaseInterface for commerce use cases, providing commerce-search and commerce-suggestions facade resolvers.
- **GenerativeInterface**: A concrete class extending BaseInterface for generative/conversational use cases, providing a no-op conversation resolver and a reference to the source engine.
- **ComposedInterface**: A plain object (not a class) returned by `composeInterfaces()` that aggregates multiple interfaces of the same type and satisfies the `Supports<F>` structural type.
- **BaseController**: An abstract class providing DRY `state` and `subscribe` implementations for all controllers.
- **Controller**: A TypeScript interface defining the public contract (`state`, `subscribe`) for all controllers.
- **Supports**: A structural TypeScript type satisfied by any object that has a `[STATE_ID]` property, a `resolveFacades` method, and a `dispose` method.
- **FacadeResolverFactory**: A function that takes a FullEngine and returns a FacadeResolver (a function from EndpointStateScope to EndpointThunk).
- **EndpointThunk**: An async thunk representing a single API endpoint call.
- **Facade**: A named capability of an interface (e.g., `'search'`, `'suggestions'`, `'conversation'`).

## Requirements

### Requirement 1: BaseInterface Abstract Class

**User Story:** As a thermidor maintainer, I want a shared abstract base class for interfaces, so that interface implementations share lifecycle, caching, and thunk resolution behavior without duplication.

#### Acceptance Criteria

1. THE BaseInterface SHALL expose symbol-keyed readonly properties `[ENGINE]`, `[STATE_ID]`, and `[TYPE]` initialized via the constructor.
2. THE BaseInterface SHALL declare an abstract `resolvers` getter returning a `Record<Facades[T], FacadeResolverFactory>`.
3. WHEN `resolveFacades(facade, composedInterfaceId?)` is called, THE BaseInterface SHALL resolve the requested facade using the `resolvers` Record and return an array of EndpointThunk values.
4. WHEN `resolveFacades` is called with a facade and scope combination previously resolved, THE BaseInterface SHALL return the cached EndpointThunk without invoking the factory again.
5. WHEN `dispose()` is called, THE BaseInterface SHALL mark the instance as disposed.
6. WHILE the BaseInterface instance is disposed, THE BaseInterface SHALL throw an error when `resolveFacades` is called.
7. THE BaseInterface SHALL expose a `disposed` getter returning the current disposal state as a boolean.

### Requirement 2: Concrete Interface Classes

**User Story:** As a thermidor maintainer, I want concrete interface classes that extend BaseInterface, so that each interface type defines only its resolver factories without reimplementing shared behavior.

#### Acceptance Criteria

1. THE SearchInterface class SHALL extend `BaseInterface<'search'>` and provide resolvers for `search` and `suggestions` facades.
2. THE CommerceInterface class SHALL extend `BaseInterface<'commerce'>` and provide resolvers for `search` and `suggestions` facades.
3. THE GenerativeInterface class SHALL extend `BaseInterface<'generative'>` and provide a resolver for the `conversation` facade.
4. THE GenerativeInterface class SHALL expose a `[SOURCE_ENGINE]` readonly property referencing the original Engine instance.
5. WHEN `buildSearchInterface(options)` is called, THE factory function SHALL return a SearchInterface instance and adopt the search-parameters slice on the engine.
6. WHEN `buildCommerceInterface(options)` is called, THE factory function SHALL return a CommerceInterface instance.
7. WHEN `buildGenerativeInterface(options)` is called, THE factory function SHALL return a GenerativeInterface instance and invoke the generative loader.

### Requirement 3: ComposedInterface as Plain Object

**User Story:** As a thermidor maintainer, I want ComposedInterface to be a plain object satisfying the `Supports<F>` structural type, so that composition does not require class inheritance.

#### Acceptance Criteria

1. WHEN `composeInterfaces(options)` is called, THE factory function SHALL return a plain object with a `[STATE_ID]` property, a `resolveFacades` method, and a `dispose` method.
2. WHEN `resolveFacades(facade)` is called on a ComposedInterface, THE ComposedInterface SHALL delegate to each sub-interface's `resolveFacades` method passing the composed interface ID, and return the flat-mapped array of EndpointThunk values.
3. WHEN `dispose()` is called on a ComposedInterface, THE ComposedInterface SHALL perform no operation.
4. IF `composeInterfaces` is called with an empty array, THEN THE factory function SHALL throw an error.
5. IF `composeInterfaces` is called with interfaces that do not share the same engine, THEN THE factory function SHALL throw an error.
6. IF `composeInterfaces` is called with interfaces that do not share the same type, THEN THE factory function SHALL throw an error.

### Requirement 4: Supports Type (Structural Interface)

**User Story:** As a thermidor maintainer, I want a structural `Supports<F>` type so that controllers accept both class-based interfaces and plain composed objects without type discrimination.

#### Acceptance Criteria

1. THE `Supports<F>` type SHALL require a readonly `[STATE_ID]` property of type string.
2. THE `Supports<F>` type SHALL require a `resolveFacades(facade: F, composedInterfaceId?: string): EndpointThunk[]` method.
3. THE `Supports<F>` type SHALL require a `dispose(): void` method.
4. THE `Supports<F>` type SHALL be satisfied by both BaseInterface subclass instances and ComposedInterface plain objects.

### Requirement 5: BaseController Abstract Class

**User Story:** As a thermidor maintainer, I want a shared abstract base class for controllers, so that `state` and `subscribe` logic is implemented once.

#### Acceptance Criteria

1. THE BaseController class SHALL implement the `Controller<TState>` interface.
2. THE BaseController class SHALL provide a `protected engine` property of type FullEngine.
3. WHEN `state` is accessed on a BaseController subclass, THE BaseController SHALL return the value of `engine.read(stateSelector)`.
4. WHEN `subscribe(callback)` is called on a BaseController subclass, THE BaseController SHALL delegate to `engine.subscribe(stateSelector, callback)` and return an unsubscribe function.

### Requirement 6: Controller Migration

**User Story:** As a thermidor maintainer, I want all existing controllers migrated to extend BaseController, so that boilerplate state and subscribe logic is eliminated from each controller.

#### Acceptance Criteria

1. THE SearchBoxController implementation SHALL extend BaseController and retain its existing `setQuery` and `submit` methods.
2. THE ResultListController implementation SHALL extend BaseController and retain its existing domain-specific methods.
3. THE ProductListController implementation SHALL extend BaseController and retain its existing domain-specific methods.
4. THE PaginationController implementation SHALL extend BaseController and retain its existing domain-specific methods.
5. THE CartController implementation SHALL extend BaseController and retain its existing domain-specific methods.
6. THE ConverseController implementation SHALL extend BaseController and retain its existing domain-specific methods.
7. WHEN a controller is constructed, THE controller SHALL call `interface.resolveFacades(facade)` instead of `resolveFacades(interface, facade)`.

### Requirement 7: Engine Dispose

**User Story:** As a thermidor consumer, I want `Engine.dispose()` so that I can tear down all engine resources and prevent further operations.

#### Acceptance Criteria

1. WHEN `dispose()` is called on an Engine instance, THE Engine SHALL tear down the Redux store and release internal references.
2. WHILE the Engine is disposed, THE Engine SHALL throw an error when `mutate` is called.
3. WHILE the Engine is disposed, THE Engine SHALL throw an error when `read` is called.
4. WHILE the Engine is disposed, THE Engine SHALL throw an error when `subscribe` is called.
5. WHILE the Engine is disposed, THE Engine SHALL throw an error when `adoptSlice` is called.
6. THE Engine SHALL expose a `disposed` getter returning the current disposal state as a boolean.

### Requirement 8: Symbol Cleanup

**User Story:** As a thermidor maintainer, I want unused symbols removed, so that the codebase does not carry dead code from the previous architecture.

#### Acceptance Criteria

1. THE symbols module SHALL remove the `KIND` symbol export.
2. THE symbols module SHALL remove the `INTERFACES` symbol export.
3. THE symbols module SHALL remove the `FACADE_RESOLVERS` symbol export.
4. THE symbols module SHALL retain the `ENGINE`, `STATE_ID`, `TYPE`, and `SOURCE_ENGINE` symbol exports.

### Requirement 9: Dead Code Removal

**User Story:** As a thermidor maintainer, I want obsolete utility files deleted, so that no dead code remains after the migration.

#### Acceptance Criteria

1. THE `facade-cache.ts` file SHALL be deleted from the codebase.
2. THE `resolve-facades.ts` file SHALL be deleted from the codebase.

### Requirement 10: Sub-path Export Removal

**User Story:** As a thermidor maintainer, I want sub-path exports removed from `package.json`, so that consumers use the single entry point and internal file paths are not part of the public contract.

#### Acceptance Criteria

1. THE `package.json` exports field SHALL retain only the `"."` entry and the `"./package.json"` entry.
2. THE `package.json` exports field SHALL remove the `"./interfaces/commerce"` entry.
3. THE `package.json` exports field SHALL remove the `"./interfaces/compose"` entry.
4. THE `package.json` exports field SHALL remove the `"./interfaces/generative"` entry.
5. THE `package.json` exports field SHALL remove the `"./interfaces/search"` entry.

### Requirement 11: Public API Preservation

**User Story:** As a thermidor consumer, I want the public API to remain unchanged, so that this internal refactoring does not require changes to my code.

#### Acceptance Criteria

1. THE `src/index.ts` SHALL continue to export the `buildSearchInterface` factory function (via the interfaces/search module or re-export).
2. THE `src/index.ts` SHALL continue to export the `buildCommerceInterface` factory function.
3. THE `src/index.ts` SHALL continue to export the `buildGenerativeInterface` factory function.
4. THE `src/index.ts` SHALL continue to export the `composeInterfaces` factory function.
5. THE `src/index.ts` SHALL continue to export the `Engine` class and `EngineOptions` type.
6. THE `src/index.ts` SHALL continue to export the `Supports` type.
7. THE `src/index.ts` SHALL export updated `Interface` and `ComposedInterface` types compatible with the new class-based architecture.
8. THE symbols `ENGINE`, `STATE_ID`, `TYPE`, `SOURCE_ENGINE` SHALL remain non-exported from `src/index.ts`.

### Requirement 12: Coding Style

**User Story:** As a thermidor maintainer, I want consistent control flow formatting, so that code is always readable and diffs are minimal.

#### Acceptance Criteria

1. ALL `if` statements SHALL use curly braces around their body, even for single-statement bodies.
2. THE codebase SHALL NOT contain braceless `if/return`, `if/continue`, `if/throw`, or any other single-line `if` pattern.
3. ALL class declarations SHALL order their members as follows (top to bottom): static constants, public fields, public getters/setters, protected fields, private fields, constructor, public methods, protected methods, private methods.
4. ALL class declarations SHALL separate each member ordering section with a blank line for readability.
