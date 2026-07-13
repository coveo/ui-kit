# Requirements Document

## Introduction

This feature migrates module-level caches (slices, actions, selectors) from global `Map` instances in feature modules to interface-level ownership via a dedicated `InterfaceCacheRegistry`. Each `BaseInterface` instance owns a registry that feature modules register into, enabling deterministic cleanup on `interface.dispose()`. Additionally, `Engine.dispose()` cascades disposal to all interfaces registered with the engine, ensuring no orphaned state remains after engine teardown.

## Glossary

- **InterfaceCacheRegistry**: A class owned by each `BaseInterface` instance responsible for storing and clearing feature-module caches (slices, actions, selectors) scoped to that interface.
- **BaseInterface**: The abstract class from which all concrete interface classes (SearchInterface, CommerceInterface, GenerativeInterface) inherit. Owns a `#facadeCache` and the new `InterfaceCacheRegistry`.
- **ComposedInterface**: A class that delegates to multiple sub-interfaces. It owns a shared `InterfaceCacheRegistry` for composed-scoped caches and registers with the Engine. Its `dispose()` clears shared caches but does not dispose sub-interfaces.
- **Engine**: The top-level store wrapper that manages the Redux store. Currently uses a `WeakMap<Engine, FullEngine>` for its wrapper and does not track interfaces.
- **FullEngine**: The internal API surface of the engine exposed to interfaces and controllers via the `getFullEngine` accessor hook.
- **Module-level cache**: A `Map<string, T>` declared at module scope in feature directories (e.g., `actionsCache`, `sliceCache`, `selectorsCache`) used by `getOrCreate*` factory functions.
- **Feature module**: A directory under `src/core/internal/` providing slices, actions, and selectors for a specific domain (search-box, pagination, cart, etc.).
- **Cascade dispose**: The behavior where `Engine.dispose()` automatically invokes `dispose()` on all interfaces registered with that engine.

## Requirements

### Requirement 1: InterfaceCacheRegistry

**User Story:** As a developer, I want each interface to own its caches so that disposing an interface deterministically releases all associated slices, actions, and selectors without affecting other interfaces.

#### Acceptance Criteria

1. THE InterfaceCacheRegistry SHALL provide a method to register a named cache entry (key-value pair) scoped to the owning interface.
2. THE InterfaceCacheRegistry SHALL provide a method to retrieve a previously registered cache entry by name and return undefined when the entry does not exist.
3. WHEN `dispose()` is called on the InterfaceCacheRegistry, THE InterfaceCacheRegistry SHALL delete all registered cache entries.
4. THE InterfaceCacheRegistry SHALL use the `#private` field and `static {}` accessor hook pattern established in ADR-005.
5. THE InterfaceCacheRegistry SHALL support storing heterogeneous value types (slices, action creators, selector objects) without requiring generic parameterization per entry.

### Requirement 2: BaseInterface owns InterfaceCacheRegistry

**User Story:** As a developer, I want BaseInterface to instantiate and expose an InterfaceCacheRegistry so that feature modules can register caches during interface construction.

#### Acceptance Criteria

1. WHEN a BaseInterface instance is constructed, THE BaseInterface SHALL create a new InterfaceCacheRegistry instance.
2. THE BaseInterface SHALL expose the InterfaceCacheRegistry to internal modules via the `getInterfaceInternals` accessor hook.
3. WHEN `dispose()` is called on a BaseInterface instance, THE BaseInterface SHALL invoke `dispose()` on the owned InterfaceCacheRegistry before clearing the facade cache.
4. THE BaseInterface SHALL keep the InterfaceCacheRegistry inaccessible to consumers (not part of the public API surface).

### Requirement 3: Feature modules register caches into InterfaceCacheRegistry

**User Story:** As a developer, I want feature-module factory functions to register their outputs into the interface's cache registry so that caches are scoped to interface lifetime rather than module lifetime.

#### Acceptance Criteria

1. WHEN a `getOrCreate*` factory function is called, THE factory function SHALL accept an interface handle and internally extract `stateId` and `cacheRegistry` via the appropriate internals accessor hook.
2. WHEN a `getOrCreate*` factory function is called with an InterfaceCacheRegistry that already contains the requested entry, THE factory function SHALL return the existing cached entry without creating a new one.
3. THE factory functions SHALL remove all direct references to module-level `Map` instances, replacing them with registry-based storage.
4. WHEN an interface is disposed, THE caches registered by feature modules for that interface SHALL be eligible for garbage collection.

### Requirement 4: Engine tracks registered interfaces

**User Story:** As a developer, I want the engine to track all interfaces created against it so that engine disposal can cascade to those interfaces.

#### Acceptance Criteria

1. WHEN a BaseInterface is constructed, THE BaseInterface SHALL register itself with the associated Engine.
2. THE Engine SHALL maintain an internal collection of all registered interfaces.
3. WHEN `dispose()` is called on a BaseInterface, THE BaseInterface SHALL deregister itself from the associated Engine.
4. THE Engine SHALL not prevent garbage collection of interfaces that have been disposed and deregistered.

### Requirement 5: Engine.dispose() cascades to all registered interfaces

**User Story:** As a developer, I want `Engine.dispose()` to automatically dispose all registered interfaces so that a single call tears down the entire object graph without leaking state.

#### Acceptance Criteria

1. WHEN `dispose()` is called on an Engine, THE Engine SHALL invoke `dispose()` on each registered interface before disposing the engine's own resources.
2. WHEN `dispose()` is called on an Engine, THE Engine SHALL clear the interface registry after disposing all interfaces.
3. IF an interface has already been disposed before engine disposal, THEN THE Engine SHALL skip that interface without raising an error.

### Requirement 6: ComposedInterface owns a shared InterfaceCacheRegistry

**User Story:** As a developer, I want ComposedInterface to own a cache registry for shared caches (selectors/thunks scoped to the composed ID) so that disposing the composed interface cleans up shared state without affecting sub-interfaces.

#### Acceptance Criteria

1. WHEN a ComposedInterface instance is constructed, THE ComposedInterface SHALL create a new InterfaceCacheRegistry instance.
2. THE ComposedInterface SHALL expose its InterfaceCacheRegistry to internal modules via the `getComposedInternals` accessor hook.
3. THE ComposedInterface SHALL register itself with the Engine via `engine.addInterface(this)`.
4. WHEN `dispose()` is called on a ComposedInterface, THE ComposedInterface SHALL invoke `dispose()` on its owned InterfaceCacheRegistry.
5. WHEN `dispose()` is called on a ComposedInterface, THE ComposedInterface SHALL NOT invoke `dispose()` on any sub-interface.
6. WHEN a sub-interface of a ComposedInterface is disposed individually, THE ComposedInterface's registry SHALL NOT be affected.
7. THE ComposedInterface SHALL keep the InterfaceCacheRegistry inaccessible to consumers (not part of the public API surface).

### Requirement 7: Disposed interface guards

**User Story:** As a developer, I want clear errors when interacting with disposed objects so that lifecycle violations are detected early during development.

#### Acceptance Criteria

1. IF a `getOrCreate*` factory function is called with an InterfaceCacheRegistry that has been disposed, THEN THE factory function SHALL throw an error indicating the interface has been disposed.
2. WHEN `dispose()` is called on a BaseInterface that has already been disposed, THE BaseInterface SHALL be a no-op (idempotent).
3. WHEN `dispose()` is called on an Engine that has already been disposed, THE Engine SHALL be a no-op (idempotent).
