# Design Document

## Introduction

This document specifies the technical architecture for migrating the thermidor package from factory-function frozen object literals to a class-based internal architecture, as defined in ADR-005 v2. The public API remains unchanged — factory functions like `buildSearchInterface()` continue to be the consumer-facing entry points. Classes are internal implementation details providing DRY behavior sharing, proper dispose semantics, and simplified internal access via non-exported symbols.

## Architecture Overview

The migration introduces two abstract base classes (`BaseInterface<T>` and `BaseController<TState>`) that encapsulate shared behavior. Concrete interface classes extend `BaseInterface` and only define their resolver factories. Concrete controllers extend `BaseController` and only define domain-specific actions. `ComposedInterface<T>` is a standalone class that implements `Supports<F>` directly without inheriting from `BaseInterface`.

### Class Hierarchy

```
BaseInterface<T extends InterfaceType>     (abstract — symbols, resolvers, cache, dispose)
├── SearchInterface                        (concrete — search + suggestions resolvers)
├── CommerceInterface                      (concrete — search + suggestions resolvers)
└── GenerativeInterface                    (concrete — conversation resolver + SOURCE_ENGINE)

ComposedInterface<T>                       (standalone class — implements Supports<F> directly, no BaseInterface inheritance)

BaseController<TState>                     (abstract — protected engine, DRY state/subscribe)
├── SearchBoxControllerImpl                (concrete — setQuery, submit)
├── ResultListControllerImpl               (concrete — read-only state)
├── ProductListControllerImpl              (concrete — read-only state)
├── PaginationControllerImpl               (concrete — selectPage, setPageSize)
├── CartControllerImpl                     (concrete — setItems, updateItemQuantity)
└── ConverseControllerImpl                 (concrete — submit, selectTurn, retry)
```

### Design Principles

1. **Symbols for internal access** — Non-exported from `src/index.ts`, sufficient per ADR-004 leakage gate.
2. **Abstract + protected over friends** — Standard OOP patterns replace custom WeakMap/friend patterns.
3. **Standalone class for composition** — `ComposedInterface` implements `Supports<F>` directly without inheriting from `BaseInterface`.
4. **Factory functions remain public API** — Classes are never exposed to consumers.

## Components

### 1. Symbols Module (Revised)

**File:** `src/core/interface/utils/symbols.ts`

```typescript
export const ENGINE: unique symbol = Symbol('engine');
export const TYPE: unique symbol = Symbol('type');
export const STATE_ID: unique symbol = Symbol('stateId');
export const SOURCE_ENGINE: unique symbol = Symbol('sourceEngine');
```

Removed symbols: `KIND`, `INTERFACES`, `FACADE_RESOLVERS`. These are no longer needed since `BaseInterface` uses a method (`resolveFacades`) instead of a data property, and the `KIND` discriminant is replaced by the structural `Supports<F>` type.

### 2. Type Definitions

**File:** `src/core/interface/utils/interface-types.ts`

```typescript
import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '../engine/engine.js';
import {STATE_ID} from './symbols.js';

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;

export interface EndpointStateScope {
  interfaceId: string;
  composedInterfaceId?: string;
}

export type FacadeResolver = (scope: EndpointStateScope) => EndpointThunk;

export type FacadeResolverFactory = (engine: FullEngine) => FacadeResolver;

export interface Facades {
  search: 'search' | 'suggestions';
  commerce: 'search' | 'suggestions';
  generative: 'conversation';
}

export type InterfaceType = keyof Facades;

export type Supports<F extends Facades[InterfaceType]> = {
  readonly [STATE_ID]: string;
  resolveFacades(facade: F, composedInterfaceId?: string): EndpointThunk[];
  dispose(): void;
};
```

The key change: `Supports<F>` is now a structural type with a `resolveFacades` method and `dispose`, rather than relying on symbol-keyed `FACADE_RESOLVERS` data property + external `resolveFacades()` utility. The old `Interface<T>` and `ComposedInterface<T>` types become type aliases for `BaseInterface<T>` instances and the `ComposedInterface<T>` class instance, both satisfying `Supports<F>`.

### 3. BaseInterface Abstract Class

**File:** `src/core/interface/base-interface.ts`

```typescript
import type {FullEngine} from './engine/engine.js';
import type {
  EndpointThunk,
  EndpointStateScope,
  FacadeResolverFactory,
  Facades,
  InterfaceType,
} from './utils/interface-types.js';
import {ENGINE, STATE_ID, TYPE} from './utils/symbols.js';

export abstract class BaseInterface<T extends InterfaceType> {
  readonly [ENGINE]: FullEngine;
  readonly [STATE_ID]: string;
  readonly [TYPE]: T;

  abstract get resolvers(): Record<Facades[T], FacadeResolverFactory>;

  get disposed(): boolean {
    return this.#disposed;
  }

  #facadeCache = new Map<string, EndpointThunk>();
  #disposed = false;

  constructor(engine: FullEngine, stateId: string, type: T) {
    this[ENGINE] = engine;
    this[STATE_ID] = stateId;
    this[TYPE] = type;
  }

  resolveFacades(
    facade: Facades[T],
    composedInterfaceId?: string
  ): EndpointThunk[] {
    if (this.#disposed) {
      throw new Error('Cannot resolve thunks on a disposed interface.');
    }

    const scope: EndpointStateScope = {
      interfaceId: this[STATE_ID],
      composedInterfaceId,
    };
    const cacheKey = `${String(facade)}:${composedInterfaceId ?? this[STATE_ID]}`;

    if (!this.#facadeCache.has(cacheKey)) {
      const resolver = this.resolvers[facade];
      const thunk = resolver(this[ENGINE])(scope);
      this.#facadeCache.set(cacheKey, thunk);
    }

    return [this.#facadeCache.get(cacheKey)!];
  }

  dispose(): void {
    this.#disposed = true;
    this.#facadeCache.clear();
  }
}
```

### 4. Concrete Interface Classes

#### SearchInterface

**File:** `src/public/interfaces/search.ts`

```typescript
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {getOrCreateSearchParametersSlice} from '@/src/core/internal/search-parameters/search-parameters-slice.js';
import {createSearchFacadeResolver} from '@/src/core/interface/api/search/search-facade.js';
import {createQuerySuggestFacadeResolver} from '@/src/core/interface/api/query-suggest/query-suggest-facade.js';

const resolverFactories: Record<Facades['search'], FacadeResolverFactory> = {
  search: createSearchFacadeResolver,
  suggestions: createQuerySuggestFacadeResolver,
};

export class SearchInterface extends BaseInterface<'search'> {
  get resolvers() {
    return resolverFactories;
  }

  constructor(
    engine: import('@/src/core/interface/engine/engine.js').FullEngine,
    stateId: string
  ) {
    super(engine, stateId, 'search');
  }
}

export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  fullEngine.adoptSlice(getOrCreateSearchParametersSlice(interfaceId));
  return new SearchInterface(fullEngine, interfaceId);
}
```

#### CommerceInterface

**File:** `src/public/interfaces/commerce.ts`

```typescript
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {createCommerceSearchFacadeResolver} from '@/src/core/interface/api/commerce-search/commerce-search-facade.js';
import {createCommerceSuggestionsFacadeResolver} from '@/src/core/interface/api/commerce-query-suggest/commerce-query-suggest-facade.js';

const resolverFactories: Record<Facades['commerce'], FacadeResolverFactory> = {
  search: createCommerceSearchFacadeResolver,
  suggestions: createCommerceSuggestionsFacadeResolver,
};

export class CommerceInterface extends BaseInterface<'commerce'> {
  get resolvers() {
    return resolverFactories;
  }

  constructor(
    engine: import('@/src/core/interface/engine/engine.js').FullEngine,
    stateId: string
  ) {
    super(engine, stateId, 'commerce');
  }
}

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildCommerceInterface(
  options: BuildCommerceInterfaceOptions
): CommerceInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  return new CommerceInterface(fullEngine, interfaceId);
}
```

#### GenerativeInterface

**File:** `src/public/interfaces/generative.ts`

```typescript
import {createAsyncThunk} from '@reduxjs/toolkit';
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import type {
  FacadeResolverFactory,
  Facades,
  EndpointStateScope,
} from '@/src/core/interface/utils/interface-types.js';
import {SOURCE_ENGINE} from '@/src/core/interface/utils/symbols.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';

const noopThunk = createAsyncThunk<void, {engine: FullEngine}>(
  'generative/noop',
  async () => {}
);

const noopResolverFactory: FacadeResolverFactory = (_engine) => (_scope) =>
  noopThunk;

const resolverFactories: Record<Facades['generative'], FacadeResolverFactory> =
  {
    conversation: noopResolverFactory,
  };

export class GenerativeInterface extends BaseInterface<'generative'> {
  readonly [SOURCE_ENGINE]: Engine;

  get resolvers() {
    return resolverFactories;
  }

  constructor(engine: FullEngine, stateId: string, sourceEngine: Engine) {
    super(engine, stateId, 'generative');
    this[SOURCE_ENGINE] = sourceEngine;
  }
}

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildGenerativeInterface(
  options: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  loadGenerative(fullEngine, interfaceId);
  return new GenerativeInterface(fullEngine, interfaceId, options.engine);
}
```

### 5. ComposedInterface (Standalone Class)

**File:** `src/public/interfaces/compose.ts`

```typescript
import {ENGINE, STATE_ID, TYPE} from '@/src/core/interface/utils/symbols.js';
import type {
  EndpointThunk,
  Facades,
  InterfaceType,
  Supports,
} from '@/src/core/interface/utils/interface-types.js';
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export class ComposedInterface<T extends InterfaceType> implements Supports<
  Facades[T]
> {
  readonly [STATE_ID]: string;

  #interfaces: BaseInterface<T>[];

  constructor(interfaces: BaseInterface<T>[], composedId: string) {
    this[STATE_ID] = composedId;
    this.#interfaces = interfaces;
  }

  resolveFacades(
    facade: Facades[T],
    composedInterfaceId?: string
  ): EndpointThunk[] {
    const id = composedInterfaceId ?? this[STATE_ID];
    return this.#interfaces.flatMap((sub) => sub.resolveFacades(facade, id));
  }

  dispose(): void {
    // No-op: composed interface does not own sub-interface lifecycle
  }
}

export function composeInterfaces<T extends InterfaceType>(options: {
  interfaces: BaseInterface<T>[];
}): ComposedInterface<T> {
  if (options.interfaces.length === 0) {
    throw new Error('composeInterfaces requires at least one interface.');
  }

  const engine = options.interfaces[0][ENGINE];
  const type = options.interfaces[0][TYPE];

  for (const iface of options.interfaces) {
    if (iface[ENGINE] !== engine) {
      throw new Error('All interfaces must share the same engine.');
    }
    if (iface[TYPE] !== type) {
      throw new Error(
        `All interfaces must share the same type. Expected '${type}', got '${iface[TYPE]}'.`
      );
    }
  }

  return new ComposedInterface(options.interfaces, generateId());
}
```

`ComposedInterface<T>` is a standalone class that directly implements `Supports<Facades[T]>`. It does not extend `BaseInterface` — it has no engine reference, no facade cache, and no disposal state of its own. It delegates `resolveFacades` to its sub-interfaces. The `composeInterfaces()` factory validates inputs (non-empty, same engine, same type) then instantiates the class.

### 6. BaseController Abstract Class

**File:** `src/core/interface/base-controller.ts`

```typescript
import type {FullEngine} from './engine/engine.js';
import type {
  StateSelector,
  StateChangeCallback,
  Unsubscribe,
} from './engine/engine-types.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

export abstract class BaseController<TState> implements Controller<TState> {
  get state(): TState {
    return this.engine.read(this.#stateSelector);
  }

  protected engine: FullEngine;

  #stateSelector: StateSelector<TState>;

  constructor(engine: FullEngine, stateSelector: StateSelector<TState>) {
    this.engine = engine;
    this.#stateSelector = stateSelector;
  }

  subscribe(callback: (state: TState) => void): Unsubscribe {
    return this.engine.subscribe(this.#stateSelector, callback);
  }
}
```

### 7. Migrated Controllers

Each controller extends `BaseController` and uses `interface.resolveFacades(facade)` instead of the deleted `resolveFacades()` utility.

#### SearchBoxControllerImpl

**File:** `src/public/controllers/search-box/search-box-controller.ts`

```typescript
import {BaseController} from '@/src/core/interface/base-controller.js';
import type {
  Supports,
  EndpointThunk,
} from '@/src/core/interface/utils/interface-types.js';
import type {Dispatchable} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getOrCreateSearchEndpointSelectors} from '@/src/core/internal/api/search/search-thunk-slice.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class SearchBoxControllerImpl extends BaseController<SearchBoxControllerState> {
  #thunks: EndpointThunk[];
  #actions: ReturnType<typeof getOrCreateSearchBoxActions>;

  constructor(options: SearchBoxControllerOptions) {
    const engine = options.interface[ENGINE];
    const stateId = options.interface[STATE_ID];

    engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

    const selectors = getOrCreateSearchBoxSelectors(stateId);
    const endpointSelectors = getOrCreateSearchEndpointSelectors(stateId);

    const controllerState = createMemoizedStateSelector(
      selectors.getQuery,
      endpointSelectors.getStatus,
      endpointSelectors.getError,
      (query, status, error) => ({
        query,
        isLoading: status === 'pending',
        error,
      })
    );

    super(engine, controllerState);

    this.#thunks = options.interface.resolveFacades('search');
    this.#actions = getOrCreateSearchBoxActions(stateId);
  }

  setQuery({query}: SearchBoxControllerSetQueryOptions): void {
    this.engine.mutate(this.#actions.setQuery(query));
  }

  submit(): Promise<unknown[]> {
    return Promise.all(
      this.#thunks.map((thunk) =>
        this.engine.mutate(thunk({engine: this.engine}) as Dispatchable)
      )
    );
  }
}

export const buildSearchBoxController = (
  options: SearchBoxControllerOptions
): SearchBoxController => new SearchBoxControllerImpl(options);

export interface SearchBoxControllerOptions {
  interface: Supports<'search'>;
}

export interface SearchBoxController extends Controller<SearchBoxControllerState> {
  setQuery(options: SearchBoxControllerSetQueryOptions): void;
  submit(): Promise<unknown[]>;
}

export interface SearchBoxControllerSetQueryOptions {
  query: string;
}

export interface SearchBoxControllerState {
  query: string;
  isLoading: boolean;
  error: string | null;
}
```

#### PaginationControllerImpl

**File:** `src/public/controllers/pagination/pagination-controller.ts`

```typescript
import {BaseController} from '@/src/core/interface/base-controller.js';
import type {
  Supports,
  EndpointThunk,
} from '@/src/core/interface/utils/interface-types.js';
import type {Dispatchable} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreatePaginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class PaginationControllerImpl extends BaseController<PaginationControllerState> {
  #thunks: EndpointThunk[];
  #actions: ReturnType<typeof getOrCreatePaginationActions>;
  #controllerState: ReturnType<typeof createMemoizedStateSelector>;

  constructor(options: PaginationControllerOptions) {
    const engine = options.interface[ENGINE];
    const stateId = options.interface[STATE_ID];

    engine.adoptSlice(getOrCreatePaginationSlice(stateId));

    const selectors = getOrCreatePaginationSelectors(stateId);
    const actions = getOrCreatePaginationActions(stateId);

    const controllerState = createMemoizedStateSelector(
      selectors.getFirstResult,
      selectors.getPageSize,
      selectors.getTotalCount,
      (firstResult, pageSize, totalCount) => ({
        page: pageSize > 0 ? Math.floor(firstResult / pageSize) : 0,
        pageSize,
        totalCount,
        totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
      })
    );

    super(engine, controllerState);

    this.#thunks = options.interface.resolveFacades('search');
    this.#actions = actions;
    this.#controllerState = controllerState;
  }

  selectPage(page: number): void {
    const {pageSize, totalCount} = this.engine.read(this.#controllerState);
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const currentPage = this.state.page;

    if (page < 0 || page >= totalPages || page === currentPage) {
      return;
    }

    this.engine.mutate(this.#actions.setFirstResult(page * pageSize));
    for (const thunk of this.#thunks) {
      this.engine.mutate(thunk({engine: this.engine}) as Dispatchable);
    }
  }

  setPageSize(pageSize: number): void {
    if (pageSize < 1) {
      return;
    }

    this.engine.mutate(this.#actions.setFirstResult(0));
    this.engine.mutate(this.#actions.setPageSize(pageSize));
    for (const thunk of this.#thunks) {
      this.engine.mutate(thunk({engine: this.engine}) as Dispatchable);
    }
  }
}

export const buildPaginationController = (
  options: PaginationControllerOptions
): PaginationController => new PaginationControllerImpl(options);

export interface PaginationControllerState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginationController extends Controller<PaginationControllerState> {
  selectPage(page: number): void;
  setPageSize(pageSize: number): void;
}

export interface PaginationControllerOptions {
  interface: Supports<'search'>;
}
```

#### ResultListControllerImpl / ProductListControllerImpl

These follow the same pattern — extend `BaseController`, construct the memoized selector, and delegate `state`/`subscribe` to the base class. No domain-specific actions are needed since they are read-only controllers.

#### CartControllerImpl

```typescript
class CartControllerImpl extends BaseController<CartControllerState> {
  #actions: ReturnType<typeof getOrCreateCartActions>;

  constructor(options: CartControllerOptions) {
    const engine = options.interface[ENGINE];
    const stateId = options.interface[STATE_ID];

    loadCart(engine, stateId);

    const selectors = getOrCreateCartSelectors(stateId);
    const controllerState = createMemoizedStateSelector(
      selectors.getItems,
      (items) => ({items})
    );

    super(engine, controllerState);
    this.#actions = getOrCreateCartActions(stateId);
  }

  setItems(payload: SetCartItemsPayload): void {
    this.engine.mutate(this.#actions.setItems(payload.items));
  }

  updateItemQuantity(payload: UpdateItemQuantityPayload): void {
    this.engine.mutate(this.#actions.updateItemQuantity(payload.item));
  }
}
```

#### ConverseControllerImpl

The converse controller is the most complex. It extends `BaseController` and maintains the `GenerativeRuntime` instance. It accesses `[SOURCE_ENGINE]` from the GenerativeInterface for hydration. The pattern is identical — construct selector in constructor, pass to `super()`, retain runtime reference.

### 8. Engine Dispose

**File:** `src/core/interface/engine/engine.ts` (modification)

```typescript
export class Engine {
  get disposed(): boolean {
    return this.#disposed;
  }

  #disposed = false;
  // ... existing fields ...

  constructor(options?: EngineOptions) { ... }

  dispose(): void {
    this.#disposed = true;
    this.#store = null!;
    this.#rootReducer = null!;
    this.#adoptedSlices = null!;
    this.#hydrationSnapshots.clear();
    this.#navigatorContextProvider = undefined;
    fullEngineWrappers.delete(this);
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error('Cannot operate on a disposed Engine.');
    }
  }

  // Each method (#mutate, #read, #subscribe, #adoptSlice) adds:
  //   this.#assertNotDisposed();
  // as first statement
}
```

### 9. FacadeResolverFactory Signature Change

The current facade resolvers (`createSearchFacadeResolver`, etc.) take a `FullEngine` and return a `FacadeResolver` (via `createFacadeCache`). With `BaseInterface` owning the caching logic, these factories are simplified:

**New signature:** `(engine: FullEngine) => (scope: EndpointStateScope) => EndpointThunk`

The `createFacadeCache` utility is eliminated — caching now lives in `BaseInterface.resolveFacades()`. Each factory simply creates the thunk for the given scope:

```typescript
// Before (using createFacadeCache):
export function createSearchFacadeResolver(engine: FullEngine) {
  return createFacadeCache<EndpointThunk>(engine, createSearchEndpointThunk);
}

// After (FacadeResolverFactory):
export const createSearchFacadeResolver: FacadeResolverFactory =
  (engine) => (scope) =>
    createSearchEndpointThunk(engine, scope);
```

### 10. Public API Surface (src/index.ts)

**File:** `src/index.ts`

```typescript
export {Engine, getSampleEngineConfiguration} from './core/index.js';
export type {
  EngineOptions,
  NavigatorContext,
  NavigatorContextProvider,
} from './core/index.js';
export * from './public/actions/index.js';
export * from './public/controllers/index.js';
export {composeInterfaces} from './public/interfaces/compose.js';
export {buildGenerativeInterface} from './public/interfaces/generative.js';
export {buildSearchInterface} from './public/interfaces/search.js';
export {buildCommerceInterface} from './public/interfaces/commerce.js';
export type {
  BuildGenerativeInterfaceOptions,
  GenerativeInterface,
} from './public/interfaces/generative.js';
export type {
  BuildSearchInterfaceOptions,
  SearchInterface,
} from './public/interfaces/search.js';
export type {
  BuildCommerceInterfaceOptions,
  CommerceInterface,
} from './public/interfaces/commerce.js';
export type {ComposedInterface} from './public/interfaces/compose.js';
export type {
  Supports,
  InterfaceType,
} from './core/interface/utils/interface-types.js';
export type {
  Turn,
  TurnStatus,
  AgentResponse /* ... */,
} from './core/interface/generative/generative-types.js';
```

Key constraints:

- Symbols (`ENGINE`, `STATE_ID`, `TYPE`, `SOURCE_ENGINE`) are NOT re-exported
- `BaseInterface` and `BaseController` are NOT re-exported
- Only factory functions, TypeScript interfaces/types, and the `Engine` class are public

### 11. Package.json Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

All `./interfaces/*` sub-path exports are removed. Consumers use the single entry point.

## Data Flow

### Interface Creation Flow

```
Consumer calls buildSearchInterface({engine})
  → getFullEngine(engine) obtains FullEngine projection
  → adoptSlice() registers search-parameters slice
  → new SearchInterface(fullEngine, id) constructs instance
  → Instance satisfies Supports<'search'> structurally
  → Consumer receives SearchInterface (typed as public interface)
```

### Controller Creation Flow

```
Consumer calls buildSearchBoxController({interface: searchIface})
  → Constructor accesses searchIface[ENGINE] and searchIface[STATE_ID]
  → adoptSlice() registers search-box slice
  → searchIface.resolveFacades('search') → cached EndpointThunk[]
  → Constructs memoized state selector
  → super(engine, stateSelector) wires up DRY state/subscribe
  → Returns controller exposing setQuery, submit, state, subscribe
```

### Composition Flow

```
Consumer calls composeInterfaces({interfaces: [searchA, searchB]})
  → Validates same engine and same type
  → new ComposedInterface(interfaces, generatedId) creates standalone class instance
  → Instance satisfies Supports<'search'> via direct implementation
  → Controllers accept it seamlessly via Supports<F> parameter type
```

### Dispose Flow

```
Consumer calls engine.dispose()
  → Engine sets #disposed = true, nullifies store
  → Subsequent mutate/read/subscribe/adoptSlice calls throw
  → Consumer can also call interface.dispose() for interface-level teardown
  → Interface sets #disposed = true, clears facade cache
  → Subsequent resolveFacades calls throw
```

## Error Handling

| Scenario                                              | Behavior                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `resolveFacades` on disposed interface                | Throws `"Cannot resolve thunks on a disposed interface."`     |
| `mutate/read/subscribe/adoptSlice` on disposed engine | Throws `"Cannot operate on a disposed Engine."`               |
| `composeInterfaces` with empty array                  | Throws `"composeInterfaces requires at least one interface."` |
| `composeInterfaces` with mismatched engines           | Throws `"All interfaces must share the same engine."`         |
| `composeInterfaces` with mismatched types             | Throws with expected/got type names                           |

## File Structure (After Migration)

```
src/
├── core/
│   ├── interface/
│   │   ├── base-interface.ts              ← NEW
│   │   ├── base-controller.ts             ← NEW
│   │   ├── engine/
│   │   │   ├── engine.ts                  ← MODIFIED (add dispose)
│   │   │   └── engine-types.ts
│   │   ├── utils/
│   │   │   ├── symbols.ts                 ← MODIFIED (remove KIND, INTERFACES, FACADE_RESOLVERS)
│   │   │   ├── interface-types.ts         ← MODIFIED (new Supports, FacadeResolverFactory)
│   │   │   ├── id-generator.ts
│   │   │   └── memoized-state-selector.ts
│   │   ├── api/
│   │   │   ├── search/search-facade.ts    ← MODIFIED (FacadeResolverFactory signature)
│   │   │   ├── query-suggest/...          ← MODIFIED
│   │   │   ├── commerce-search/...        ← MODIFIED
│   │   │   └── commerce-query-suggest/... ← MODIFIED
│   │   └── ...
│   └── ...
├── public/
│   ├── interfaces/
│   │   ├── search.ts                      ← REWRITTEN (class-based)
│   │   ├── commerce.ts                    ← REWRITTEN (class-based)
│   │   ├── generative.ts                  ← REWRITTEN (class-based)
│   │   └── compose.ts                     ← REWRITTEN (standalone class)
│   └── controllers/
│       ├── controller-types.ts
│       ├── search-box/...                 ← REWRITTEN (extends BaseController)
│       ├── result-list/...                ← REWRITTEN
│       ├── product-list/...               ← REWRITTEN
│       ├── pagination/...                 ← REWRITTEN
│       ├── cart/...                        ← REWRITTEN
│       └── converse/...                   ← REWRITTEN
└── index.ts                               ← MODIFIED (exports update)

DELETED:
├── src/core/interface/utils/facade-cache.ts
└── src/core/interface/utils/resolve-facades.ts
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Symbol-keyed properties reflect constructor arguments

_For any_ valid `(engine, stateId, type)` triple, a `BaseInterface` subclass instance constructed with those arguments SHALL have `instance[ENGINE] === engine`, `instance[STATE_ID] === stateId`, and `instance[TYPE] === type`.

**Validates: Requirements 1.1**

### Property 2: resolveFacades returns consistent cached references (idempotence)

_For any_ `BaseInterface` instance and _for any_ valid facade name and optional composedInterfaceId, calling `resolveFacades(facade, composedInterfaceId)` N times (N ≥ 1) SHALL always return an array containing the same object reference, and the underlying `FacadeResolverFactory` SHALL be invoked at most once for that (facade, scope) pair.

**Validates: Requirements 1.3, 1.4**

### Property 3: Disposed interface rejects all thunk resolution

_For any_ `BaseInterface` instance that has had `dispose()` called, and _for any_ valid facade name, calling `resolveFacades(facade)` SHALL throw an error.

**Validates: Requirements 1.5, 1.6, 1.7**

### Property 4: ComposedInterface delegates to all sub-interfaces

_For any_ set of N (N ≥ 1) `BaseInterface<T>` instances sharing the same engine and type, and _for any_ valid facade name, calling `resolveFacades(facade)` on the `ComposedInterface<T>` class instance returned by `composeInterfaces` SHALL return exactly N EndpointThunk values — one from each sub-interface's `resolveFacades` invocation with the composed ID.

**Validates: Requirements 3.1, 3.2**

### Property 5: Supports<F> structural compatibility

_For any_ `BaseInterface` subclass instance and _for any_ `ComposedInterface` class instance, both SHALL satisfy the `Supports<F>` structural type — meaning a controller constructor accepting `Supports<F>` compiles and operates correctly with either.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 6: BaseController delegates state access to engine

_For any_ `BaseController` subclass constructed with a `(engine, stateSelector)` pair, accessing `.state` SHALL return `engine.read(stateSelector)`, and calling `.subscribe(cb)` SHALL register via `engine.subscribe(stateSelector, cb)` and return a valid unsubscribe function.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 7: Disposed engine rejects all operations

_For any_ `Engine` instance that has had `dispose()` called, calling any of `mutate`, `read`, `subscribe`, or `adoptSlice` on its `FullEngine` projection SHALL throw an error.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

### Property 8: composeInterfaces validates homogeneity

_For any_ array of interfaces where at least two interfaces differ in their engine reference OR their type, `composeInterfaces` SHALL throw an error. _For any_ empty array, `composeInterfaces` SHALL throw an error.

**Validates: Requirements 3.4, 3.5, 3.6**
