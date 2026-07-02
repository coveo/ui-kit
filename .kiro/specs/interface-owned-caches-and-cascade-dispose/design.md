# Design Document: Interface-Owned Caches and Cascade Dispose

## Overview

This design migrates ~36 module-level `Map` caches across 12+ feature directories from global scope to interface-level ownership. A new `InterfaceCacheRegistry` class holds all feature-module artifacts (slices, actions, selectors) for a given interface. `BaseInterface` owns the registry, and `Engine.dispose()` cascades teardown through all registered interfaces.

The design follows the established `#private` + `static {}` accessor hook pattern (ADR-005).

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Engine                                                       │
│  #interfaces: Set<EngineTrackedInterface>                     │
│  dispose() → cascades to all interfaces                      │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ SearchInterface       │  │ CommerceInterface     │         │
│  │ (extends BaseInterface)│  │ (extends BaseInterface)│        │
│  │                       │  │                       │         │
│  │  #cacheRegistry ──────┼──┼─► InterfaceCacheRegistry│       │
│  │  #facadeCache         │  │  #cacheRegistry        │        │
│  │  dispose()            │  │  dispose()             │        │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                              │
│  ┌──────────────────────────┐                                │
│  │ ComposedInterface         │  (owns shared cacheRegistry,  │
│  │  #cacheRegistry           │   registered with Engine,     │
│  │  dispose() → disposes     │   does NOT dispose            │
│  │    shared registry only   │   sub-interfaces)             │
│  └──────────────────────────┘                                │
└─────────────────────────────────────────────────────────────┘

Feature Modules (src/core/internal/*):
  getOrCreateSearchBoxSlice(iface)
  getOrCreateSearchBoxActions(iface)
  getOrCreateSearchBoxSelectors(iface)
  ...
  └── internally extract stateId + cacheRegistry from interface
```

## Components

### 1. InterfaceCacheRegistry

A new class responsible for storing and clearing per-interface caches.

**File:** `src/core/interface/cache/interface-cache-registry.ts`

```typescript
// Branded symbol type for type-safe registry access
export type CacheKey<T> = symbol & {__type: T};

export function createCacheKey<T>(description: string): CacheKey<T> {
  return Symbol(description) as CacheKey<T>;
}

export interface InterfaceCacheRegistryInternals {
  disposed: boolean;
}

export let getInterfaceCacheRegistryInternals: (
  registry: InterfaceCacheRegistry
) => InterfaceCacheRegistryInternals;

export class InterfaceCacheRegistry {
  #entries = new Map<symbol, unknown>();
  #disposed = false;

  static {
    getInterfaceCacheRegistryInternals = (registry) => ({
      disposed: registry.#disposed,
    });
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  set<T>(key: CacheKey<T>, value: T): void {
    this.#assertNotDisposed();
    this.#entries.set(key, value);
  }

  get<T>(key: CacheKey<T>): T | undefined {
    this.#assertNotDisposed();
    return this.#entries.get(key) as T | undefined;
  }

  has(key: CacheKey<unknown>): boolean {
    this.#assertNotDisposed();
    return this.#entries.has(key);
  }

  getOrCreate<T>(key: CacheKey<T>, factory: () => T): T {
    this.#assertNotDisposed();
    const existing = this.#entries.get(key);
    if (existing) {
      return existing as T;
    }
    const value = factory();
    this.#entries.set(key, value);
    return value;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#entries.clear();
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error(
        'Cannot access InterfaceCacheRegistry: the owning interface has been disposed.'
      );
    }
  }
}
```

**Key decisions:**

- Uses `CacheKey<T>` (branded symbol) for type-safe retrieval without casts at call-sites.
- `#entries` is a `Map<symbol, unknown>` internally — the branding is compile-time only.
- Each feature module declares its own `CacheKey<T>` constant co-located with the factory function.
- `createCacheKey<T>()` helper creates the branded symbol.
- The `static {}` block exports `getInterfaceCacheRegistryInternals` for testing internal state if needed.
- `dispose()` is idempotent.
- `getOrCreate<T>()` eliminates duplicated get-or-create logic across ~36 factory functions. The `factory` callback is lazy — only invoked when the key is absent.

### 2. BaseInterface Changes

**File:** `src/core/interface/base-interface.ts`

```typescript
import {InterfaceCacheRegistry} from './cache/interface-cache-registry.js';

export interface InterfaceInternals<T extends InterfaceType = InterfaceType> {
  engine: FullEngine;
  stateId: string;
  type: T;
  cacheRegistry: InterfaceCacheRegistry; // NEW
}

export abstract class BaseInterface<T extends InterfaceType> {
  #engine: FullEngine;
  #stateId: string;
  #type: T;
  #resolvers: Record<Facades[T], FacadeResolverFactory>;
  #facadeCache = new Map<string, EndpointThunk>();
  #cacheRegistry: InterfaceCacheRegistry; // NEW
  #disposed = false;

  static {
    getInterfaceInternals = (iface) => ({
      engine: iface.#engine,
      stateId: iface.#stateId,
      type: iface.#type,
      cacheRegistry: iface.#cacheRegistry, // NEW
    });
  }

  constructor(
    engine: FullEngine,
    stateId: string,
    type: T,
    resolvers: Record<Facades[T], FacadeResolverFactory>
  ) {
    this.#engine = engine;
    this.#stateId = stateId;
    this.#type = type;
    this.#resolvers = resolvers;
    this.#cacheRegistry = new InterfaceCacheRegistry(); // NEW

    // Register with engine for cascade dispose
    engine.addInterface(this); // NEW
  }

  dispose(): void {
    if (this.#disposed) {
      return; // Idempotent
    }
    this.#disposed = true;
    this.#cacheRegistry.dispose(); // NEW: dispose registry first
    this.#facadeCache.clear();
    this.#engine.removeInterface(this); // NEW: deregister from engine
  }
  // ... rest unchanged
}
```

### 3. Engine Changes

**File:** `src/core/interface/engine/engine.ts`

New internal `Set` tracking registered interfaces, new methods on `FullEngine`:

```typescript
type EngineTrackedInterface = {disposed: boolean; dispose(): void};

export type FullEngine = Engine & {
  adoptSlice(slice: Slice): Promise<void>;
  getNavigatorContextProvider(): NavigatorContextProvider | undefined;
  mutate(mutation: Dispatchable): unknown;
  read<T>(selector: StateSelector<T>): T;
  addInterface(iface: EngineTrackedInterface): void;
  removeInterface(iface: EngineTrackedInterface): void;
  storeHydrationSnapshot(
    interfaceId: string,
    content: Record<string, unknown>
  ): void;
  subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe;
};

export class Engine {
  // ...existing fields...
  #interfaces = new Set<EngineTrackedInterface>(); // NEW

  static {
    getFullEngine = (engine: Engine) => {
      // ...existing wrapper creation...
      const wrapper = {
        // ...existing methods...
        addInterface: (iface: EngineTrackedInterface) =>
          engine.#addInterface(iface), // NEW
        removeInterface: (iface: EngineTrackedInterface) =>
          engine.#removeInterface(iface), // NEW
      } as FullEngine;
      // ...
    };
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;

    // NEW: cascade dispose to all registered interfaces
    for (const iface of this.#interfaces) {
      if (!iface.disposed) {
        iface.dispose();
      }
    }
    this.#interfaces.clear();

    // existing cleanup
    this.#store = null!;
    this.#rootReducer = null!;
    this.#adoptedSlices = null!;
    this.#hydrationSnapshots.clear();
    this.#navigatorContextProvider = undefined;
    fullEngineWrappers.delete(this);
  }

  #addInterface(iface: EngineTrackedInterface): void {
    this.#assertNotDisposed();
    this.#interfaces.add(iface);
  }

  #removeInterface(iface: EngineTrackedInterface): void {
    this.#interfaces.delete(iface);
  }
}
```

**Key decisions:**

- `#interfaces` (Set) for O(1) add/remove/membership testing.
- `removeInterface` does not assert not-disposed — it's called during the cascade.
- Idempotent `dispose()` via early return when already disposed.
- No ordering guarantee during cascade — interfaces are independent.

### 4. Feature Module Migration Pattern

Each feature module's `getOrCreate*` function changes from using a module-level `Map` to accepting an `InterfaceCacheRegistry`. Each module declares a **co-located** typed `CacheKey<T>` constant (replaces the old module-level Map). The key is private to the module (not exported).

**Before (e.g., `search-box-actions.ts`):**

```typescript
const actionsCache = new Map<
  string,
  ReturnType<typeof createSearchBoxActions>
>();

export function getOrCreateSearchBoxActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createSearchBoxActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
```

**After:**

```typescript
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {Supports} from '@/src/core/interface/utils/interface-types.js';

type SearchBoxActions = ReturnType<typeof createSearchBoxActions>;

const CACHE_KEY: CacheKey<SearchBoxActions> =
  createCacheKey<SearchBoxActions>('searchBox/actions');

export function getOrCreateSearchBoxActions(
  iface: Supports<Facades[InterfaceType]>
): SearchBoxActions {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSearchBoxActions(stateId)
  );
}
```

**Key points:**

- **No registry in the signature** — factories accept the interface handle (same type controllers use) and extract internals via `getHandleInternals`. Works for both `BaseInterface` and `ComposedInterface`.
- **No cast needed** — `registry.getOrCreate(CACHE_KEY, factory)` returns `SearchBoxActions` directly via `CacheKey<T>` inference.
- **Type-safe** — the factory return type must match `CacheKey<T>`'s type parameter.
- **No duplicated logic** — `getOrCreate` encapsulates the get-or-set pattern; each factory is a single `return` statement.
- **Co-located** — the `CacheKey` constant lives in the same file as the factory function.
- **Module-private** — the key is not exported, only used within the file.

**Internal dependencies (slice → actions):**

```typescript
// search-box-slice.ts
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateSearchBoxActions} from './search-box-actions.js';

type SearchBoxSlice = ReturnType<typeof createSearchBoxSlice>;

const CACHE_KEY: CacheKey<SearchBoxSlice> =
  createCacheKey<SearchBoxSlice>('searchBox/slice');

export function getOrCreateSearchBoxSlice(
  iface: Supports<Facades[InterfaceType]>
): SearchBoxSlice {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateSearchBoxActions(iface);
    return createSearchBoxSlice(stateId, actions);
  });
}
```

**Pattern applied uniformly to:**

- `*-actions.ts` — `getOrCreateXxxActions(iface: Supports<Facades[InterfaceType]>)`
- `*-slice.ts` — `getOrCreateXxxSlice(iface: Supports<Facades[InterfaceType]>)`
- `*-selectors.ts` — `getOrCreateXxxSelectors(iface: Supports<Facades[InterfaceType]>)`

Each file removes its module-level `Map`, declares a typed `CacheKey<T>` constant, and uses the registry passed in by the caller.

### 5. Call-Site Changes (Interface Constructors / Build Functions)

The `buildSearchInterface` (and similar build functions) passes the interface handle to factories:

```typescript
export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  const iface = new SearchInterface(fullEngine, interfaceId);
  const {engine} = getInterfaceInternals(iface);

  engine.adoptSlice(getOrCreateSearchParametersSlice(iface));

  return iface;
}
```

**Generative hydration example:**

```typescript
const subInterface = buildSearchInterface({engine});
engine.adoptSlice(getOrCreateSearchBoxSlice(subInterface));
const searchBoxActions = getOrCreateSearchBoxActions(subInterface);
```

### 5b. Controller Call-Site (Before/After)

**Before:**

```typescript
constructor(options: SearchBoxControllerOptions) {
  const {engine, stateId} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const selectors = getOrCreateSearchBoxSelectors(stateId);
  const endpointSelectors = getOrCreateSearchEndpointSelectors(stateId);
  // ...
  this.#actions = getOrCreateSearchBoxActions(stateId);
}
```

**After:**

```typescript
constructor(options: SearchBoxControllerOptions) {
  const {engine} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

  const selectors = getOrCreateSearchBoxSelectors(options.interface);
  const endpointSelectors = getOrCreateSearchEndpointSelectors(options.interface);
  // ...
  this.#actions = getOrCreateSearchBoxActions(options.interface);
}
```

### 6. ComposedInterface Changes

**File:** `src/public/interfaces/compose.ts`

ComposedInterface now owns a shared `InterfaceCacheRegistry` for caches scoped to the composed ID (shared selectors, shared thunks). It registers with the Engine for cascade dispose.

```typescript
export class ComposedInterface<T extends InterfaceType> {
  #engine: FullEngine;
  #stateId: string;
  #interfaces: BaseInterface<T>[];
  #cacheRegistry: InterfaceCacheRegistry; // NEW
  #disposed = false; // NEW

  static {
    getComposedInternals = (composed) => ({
      engine: composed.#engine,
      stateId: composed.#stateId,
      cacheRegistry: composed.#cacheRegistry, // NEW
    });
  }

  constructor(interfaces: BaseInterface<T>[], composedId: string) {
    // ... existing setup ...
    this.#cacheRegistry = new InterfaceCacheRegistry(); // NEW
    this.#engine.addInterface(this); // NEW
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#cacheRegistry.dispose(); // Disposes shared caches only
    this.#engine.removeInterface(this);
    // Does NOT dispose sub-interfaces
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  // resolveFacades unchanged...
}
```

**Key decisions:**

- ComposedInterface owns a registry for _shared_ caches (selectors/thunks scoped to `composedInterfaceId`).
- Registers with Engine → cascade dispose cleans up shared caches.
- `dispose()` does NOT cascade to sub-interfaces — their lifecycle is independent.
- Disposing a sub-interface individually does NOT affect the ComposedInterface's registry.
- `getComposedInternals` now exposes `cacheRegistry` alongside `engine` and `stateId`.

## Data Flow

### Interface Construction

```
buildSearchInterface(options)
  ├─ new SearchInterface(engine, stateId)
  │    ├─ super() → BaseInterface constructor
  │    │    ├─ new InterfaceCacheRegistry()
  │    │    └─ engine.addInterface(this)
  │    └─ return
  ├─ getOrCreateSearchParametersSlice(iface) → internally uses cacheRegistry
  └─ return iface
```

### Interface Disposal

```
interface.dispose()
  ├─ guard: if (#disposed) return
  ├─ #disposed = true
  ├─ #cacheRegistry.dispose()  → clears all feature-module entries
  ├─ #facadeCache.clear()
  └─ engine.removeInterface(this)
```

### ComposedInterface Construction

```
buildComposedInterface(interfaces)
  ├─ new ComposedInterface(interfaces, composedId)
  │    ├─ new InterfaceCacheRegistry()
  │    └─ engine.addInterface(this)
  └─ return composed
```

### ComposedInterface Disposal

```
composed.dispose()
  ├─ guard: if (#disposed) return
  ├─ #disposed = true
  ├─ #cacheRegistry.dispose()  → clears shared caches only
  ├─ engine.removeInterface(this)
  └─ does NOT dispose sub-interfaces
```

### Engine Cascade Disposal

```
engine.dispose()
  ├─ guard: if (#disposed) return
  ├─ #disposed = true
  ├─ for each interface in Set:
  │    └─ if (!iface.disposed) iface.dispose()
  ├─ #interfaces.clear()
  └─ existing cleanup (store, reducers, hydration, etc.)
```

## Error Handling

| Scenario                                             | Behavior                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `registry.get(key)` on disposed registry             | Throws: "Cannot access InterfaceCacheRegistry: the owning interface has been disposed." |
| `registry.set(key, value)` on disposed registry      | Throws: same message                                                                    |
| `getOrCreate*` with disposed registry                | Throws via registry's `#assertNotDisposed()`                                            |
| `interface.dispose()` called twice                   | No-op (idempotent)                                                                      |
| `engine.dispose()` called twice                      | No-op (idempotent)                                                                      |
| `composed.dispose()` called twice                    | No-op (idempotent)                                                                      |
| Engine cascade encounters already-disposed interface | Skips (checks `iface.disposed` before calling)                                          |
| `engine.addInterface()` on disposed engine           | Throws: "Cannot operate on a disposed Engine."                                          |

## Interfaces

### InterfaceCacheRegistry Public API

```typescript
class InterfaceCacheRegistry {
  get disposed(): boolean;
  set<T>(key: CacheKey<T>, value: T): void;
  get<T>(key: CacheKey<T>): T | undefined;
  getOrCreate<T>(key: CacheKey<T>, factory: () => T): T;
  has(key: CacheKey<unknown>): boolean;
  dispose(): void;
}
```

### Updated InterfaceInternals

```typescript
interface InterfaceInternals<T extends InterfaceType = InterfaceType> {
  engine: FullEngine;
  stateId: string;
  type: T;
  cacheRegistry: InterfaceCacheRegistry;
}
```

### Updated ComposedInternals

```typescript
interface ComposedInternals {
  engine: FullEngine;
  stateId: string;
  cacheRegistry: InterfaceCacheRegistry; // NEW
}
```

### Updated FullEngine

```typescript
type EngineTrackedInterface = {disposed: boolean; dispose(): void};

type FullEngine = Engine & {
  adoptSlice(slice: Slice): Promise<void>;
  getNavigatorContextProvider(): NavigatorContextProvider | undefined;
  mutate(mutation: Dispatchable): unknown;
  read<T>(selector: StateSelector<T>): T;
  addInterface(iface: EngineTrackedInterface): void;
  removeInterface(iface: EngineTrackedInterface): void;
  storeHydrationSnapshot(
    interfaceId: string,
    content: Record<string, unknown>
  ): void;
  subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe;
};
```

### Factory Function Signature (Generalized)

Factory functions accept an interface handle — either a `BaseInterface` or `ComposedInterface`. Both expose `{stateId, cacheRegistry}` via their respective internals accessor hooks. The `getHandleInternals` utility abstracts this:

```typescript
// get-handle-internals.ts returns {engine, stateId, cacheRegistry}
// Works for both BaseInterface and ComposedInterface

// Each feature module factory:
function getOrCreateXxx(iface: InterfaceHandle): XxxType {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createXxx(stateId));
}
```

Where `InterfaceHandle` is the union type accepted by `getHandleInternals` (i.e., `Supports<Facades[InterfaceType]>` — what controllers already pass as `options.interface`).

**Updated `getHandleInternals`:**

```typescript
// src/core/interface/utils/get-handle-internals.ts
export function getHandleInternals(handle: Supports<Facades[InterfaceType]>): {
  engine: FullEngine;
  stateId: string;
  cacheRegistry: InterfaceCacheRegistry;
} {
  // Dispatches to getInterfaceInternals or getComposedInternals
  // Both now return cacheRegistry
}
```

## File Changes Summary

| File                                                   | Change                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `src/core/interface/cache/interface-cache-registry.ts` | **New** — InterfaceCacheRegistry class, `CacheKey<T>` type, and `createCacheKey<T>()` helper                                |
| `src/core/interface/base-interface.ts`                 | Add `#cacheRegistry`, expose in internals, dispose cascade, engine registration                                             |
| `src/core/interface/engine/engine.ts`                  | Add `#interfaces`, `addInterface`, `removeInterface`, idempotent dispose, cascade logic                                     |
| `src/core/internal/search-box/search-box-actions.ts`   | Remove module Map, accept registry param                                                                                    |
| `src/core/internal/search-box/search-box-slice.ts`     | Remove module Map, accept registry param                                                                                    |
| `src/core/internal/search-box/search-box-selectors.ts` | Remove module Map, accept registry param                                                                                    |
| `src/core/internal/search-parameters/*`                | Same pattern                                                                                                                |
| `src/core/internal/pagination/*`                       | Same pattern                                                                                                                |
| `src/core/internal/cart/*`                             | Same pattern                                                                                                                |
| `src/core/internal/facets/*`                           | Same pattern                                                                                                                |
| `src/core/internal/result-list/*`                      | Same pattern                                                                                                                |
| `src/core/internal/product-list/*`                     | Same pattern                                                                                                                |
| `src/core/internal/sort/*`                             | Same pattern                                                                                                                |
| `src/core/internal/query-correction/*`                 | Same pattern                                                                                                                |
| `src/core/internal/generative/*`                       | Same pattern                                                                                                                |
| `src/core/internal/triggers/*`                         | Same pattern                                                                                                                |
| `src/public/interfaces/search.ts`                      | Pass registry to factory calls                                                                                              |
| `src/public/interfaces/commerce.ts`                    | Pass registry to factory calls                                                                                              |
| `src/public/interfaces/generative.ts`                  | Pass registry to factory calls                                                                                              |
| `src/public/interfaces/compose.ts`                     | Add `#cacheRegistry`, `#disposed`, expose in `getComposedInternals`, register/unregister with Engine, implement `dispose()` |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Registry store/retrieve round-trip

_For any_ `CacheKey<T>` and any value of type `T`, registering the entry via `registry.set(key, value)` and then calling `registry.get(key)` SHALL return the same value with the correct type `T | undefined`, and calling `registry.get(otherKey)` for any `CacheKey` that was never registered SHALL return `undefined`.

**Validates: Requirements 1.1, 1.2, 1.5**

### Property 2: Registry dispose clears all entries

_For any_ set of N registered entries in an InterfaceCacheRegistry, calling `dispose()` SHALL result in all subsequent `get(key)` calls throwing a disposed error, and the internal map SHALL be empty.

**Validates: Requirements 1.3**

### Property 3: BaseInterface dispose cascades to registry

_For any_ BaseInterface instance with N entries registered in its InterfaceCacheRegistry, calling `interface.dispose()` SHALL result in the owned registry being disposed (i.e., `registry.disposed === true`).

**Validates: Requirements 2.3**

### Property 4: Factory idempotence via registry

_For any_ interface ID and InterfaceCacheRegistry, calling a `getOrCreate*` factory function twice with the same arguments SHALL return the same object reference on both calls, and the registry SHALL contain exactly one entry for that cache key.

**Validates: Requirements 3.1, 3.2**

### Property 5: Engine registration invariant

_For any_ sequence of N interface constructions against an engine, the engine SHALL track exactly N interfaces. _For any_ subset of those interfaces that are subsequently disposed, the engine SHALL track exactly (N - disposed count) interfaces.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Engine cascade dispose

_For any_ engine with N registered interfaces, calling `engine.dispose()` SHALL invoke `dispose()` on each non-already-disposed interface, and the engine's interface Set SHALL be empty afterward.

**Validates: Requirements 5.1, 5.2**

### Property 7: Disposed registry throws on access

_For any_ InterfaceCacheRegistry that has been disposed, calling `set()`, `get()`, or `has()` SHALL throw an error indicating the interface has been disposed.

**Validates: Requirements 7.1**

### Property 8: Dispose idempotence

_For any_ disposable object (BaseInterface or Engine), calling `dispose()` N times (where N >= 1) SHALL be equivalent to calling it exactly once — no errors are thrown and the final state is identical.

**Validates: Requirements 7.2, 7.3**

### Property 9: Engine cascade skips pre-disposed interfaces

_For any_ engine with registered interfaces where a subset have been manually disposed before `engine.dispose()` is called, the engine SHALL skip those pre-disposed interfaces without error, and the remaining interfaces SHALL be disposed normally.

**Validates: Requirements 5.3**

### Property 10: ComposedInterface dispose independence

_For any_ ComposedInterface with N sub-interfaces, calling `composed.dispose()` SHALL dispose the ComposedInterface's own registry without invoking `dispose()` on any sub-interface. Conversely, disposing a sub-interface SHALL NOT affect the ComposedInterface's registry.

**Validates: Requirements 6.4, 6.5, 6.6**
