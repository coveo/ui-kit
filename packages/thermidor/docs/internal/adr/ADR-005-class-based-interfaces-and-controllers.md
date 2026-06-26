# ADR-005: Class-Based Interfaces and Controllers

**Status**: `🟡 Under Evaluation — Revised Direction`  
**Related docs**: ADR-001 (Anti-Corruption Layer), ADR-004 (Lazy Facade Resolvers)

## 1. Context

Thermidor uses factory functions returning frozen object literals with symbol-keyed properties for interfaces and controllers. The initial proposal (v1) migrated to ES classes with `#private` fields and a "friend pattern" for cross-class access. After implementation and evaluation, the complexity cost was deemed too high relative to the benefits.

This document captures the **revised direction (v2)** that keeps classes for their genuine benefits (DRY, dispose, type discrimination) while using symbols for internal access (simpler, sufficiently opaque per ADR-004 leakage gate).

## 2. Revised Decision Statement

Implement a class-based architecture using:
- **Symbols (non-exported)** for internal property access — not `#private` + friend pattern
- **`BaseInterface<T>`** abstract class with `protected` methods and abstract `resolvers` Record
- **`BaseController<TState>`** abstract class with `protected engine`
- **`ComposedInterface<T>`** as a plain object (not a class) — it's a wrapper, not a specialization
- **`Supports<F>`** as a structural interface (duck typing) satisfied by both classes and composed objects
- **`dispose()`** public on Engine and BaseInterface
- **Sub-path exports removed** from package.json

## 3. Design Principles (Revised)

1. **No leaks to the consumer.** Internal mechanics must not appear in the public API surface. Symbols non-exported from `src/index.ts` satisfy this (validated by ADR-004 leakage gate). True runtime inaccessibility (`#private`) is NOT required.

2. **Simplicity over purity.** Standard OOP patterns (abstract, protected, override) are preferred over custom patterns (friends, WeakMap registration, static blocks) when both achieve the same encapsulation goal.

3. **Polymorphism for interfaces, duck typing for composition.** Interface classes use inheritance for shared behavior. ComposedInterface satisfies `Supports<F>` structurally without inheriting from BaseInterface.

4. **Classes for behavior, interfaces for contracts.** Consumer-facing types are TypeScript interfaces. Classes are internal implementation.

## 4. Architecture

### Class Hierarchy

```
BaseInterface<T extends InterfaceType>  (abstract class — symbols, resolvers, cache, dispose)
├── SearchInterface                     (concrete — search + suggestions resolvers)
├── CommerceInterface                   (concrete — commerce search + suggestions resolvers)
└── GenerativeInterface                 (concrete — noop resolver + #sourceEngine)

ComposedInterface<T>                    (plain object — NOT a class, satisfies Supports<F>)

BaseController<TState>                  (abstract class — protected engine, DRY state/subscribe)
├── SearchBoxControllerImpl
├── ResultListControllerImpl
├── ProductListControllerImpl
├── PaginationControllerImpl
├── CartControllerImpl
└── ConverseControllerImpl
```

### Key Design Elements

#### BaseInterface (symbols + protected)

```typescript
// Symbols — internal only, never re-exported from src/index.ts
export const ENGINE: unique symbol = Symbol('engine');
export const STATE_ID: unique symbol = Symbol('stateId');
export const TYPE: unique symbol = Symbol('type');

export abstract class BaseInterface<T extends InterfaceType> {
  readonly [ENGINE]: FullEngine;
  readonly [STATE_ID]: string;
  readonly [TYPE]: T;
  #facadeCache = new Map<string, EndpointThunk>();
  #disposed = false;

  constructor(engine: FullEngine, stateId: string, type: T) { ... }

  abstract get resolvers(): Record<Facades[T], FacadeResolverFactory>;

  resolveThunks(facade: Facades[T], composedInterfaceId?: string): EndpointThunk[] {
    const scope: EndpointStateScope = { interfaceId: this[STATE_ID], composedInterfaceId };
    const key = `${facade}:${composedInterfaceId ?? this[STATE_ID]}`;
    return [this.resolveWithCache(key, () => this.resolvers[facade](this[ENGINE])(scope))];
  }

  protected resolveWithCache(key: string, factory: () => EndpointThunk): EndpointThunk { ... }
  dispose(): void { ... }
  get disposed(): boolean { ... }
}
```

#### SearchInterface (concrete — minimal)

```typescript
const resolverFactories: Record<Facades['search'], FacadeResolverFactory> = {
  search: createSearchFacadeResolver,
  suggestions: createQuerySuggestFacadeResolver,
};

export class SearchInterface extends BaseInterface<'search'> {
  get resolvers() { return resolverFactories; }

  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'search');
  }
}
```

#### ComposedInterface (plain object — not a class)

```typescript
export function composeInterfaces<T extends InterfaceType>(options: {
  interfaces: BaseInterface<T>[];
}): ComposedInterface<T> {
  // ...validation...
  const composedId = generateId();
  return {
    [STATE_ID]: composedId,
    resolveThunks(facade) {
      return interfaces.flatMap(sub => sub.resolveThunks(facade, composedId));
    },
    dispose() { /* no-op */ },
  };
}
```

#### BaseController (protected engine)

```typescript
export abstract class BaseController<TState> implements Controller<TState> {
  protected engine: FullEngine;
  #stateSelector: StateSelector<TState>;

  constructor(engine: FullEngine, stateSelector: StateSelector<TState>) { ... }

  get state(): TState { return this.engine.read(this.#stateSelector); }
  subscribe(cb): Unsubscribe { return this.engine.subscribe(this.#stateSelector, cb); }
}
```

#### Controller usage (direct, simple)

```typescript
class SearchBoxControllerImpl extends BaseController<SearchBoxControllerState> {
  #thunks: EndpointThunk[];
  #actions: ...;

  constructor(options: SearchBoxControllerOptions) {
    const engine = options.interface[ENGINE];
    const stateId = options.interface[STATE_ID];
    // ...
    super(engine, stateSelector);
    this.#thunks = options.interface.resolveThunks('search');
  }

  setQuery({query}) { this.engine.mutate(this.#actions.setQuery(query)); }
  submit() { return Promise.all(this.#thunks.map(t => this.engine.mutate(t({engine: this.engine})))); }
}
```

#### Supports<F> (structural interface)

```typescript
export type Supports<F extends Facades[InterfaceType]> = {
  readonly [STATE_ID]: string;
  resolveThunks(facade: F, composedInterfaceId?: string): EndpointThunk[];
  dispose(): void;
};
```

## 5. What Changed from v1 (Original Implementation)

| v1 (#private + friends) | v2 (symbols + protected) |
|---|---|
| 8 friend functions | 0 friend functions |
| WeakMap + registerFacadeResolver | Abstract `resolvers` Record |
| `static {}` blocks | Standard constructors |
| `controllerMutate(this, action)` | `this.engine.mutate(action)` |
| `getInterfaceInternals(iface).stateId` | `iface[STATE_ID]` |
| `resolveInterfaceFacades(iface, 'search')` | `iface.resolveThunks('search')` |
| ComposedInterface extends BaseInterface | ComposedInterface = plain object |
| 2 methods (resolveFacades + resolveFacadeForScope) | 1 method (resolveThunks) |
| ~85 lines boilerplate in base-interface.ts | ~35 lines |

## 6. Why Symbols Are Sufficient (from ADR-004)

ADR-004 explicitly validates:
> "Non-leakage check: Pass — consumers cannot access `[FACADE_RESOLVERS]` without the unexported Symbol."

The architecture decision charter's leakage gate requires that "implementation concepts not be exposed in the public contract." Symbols that are not re-exported from `src/index.ts` satisfy this gate. `#private` fields provide additional runtime protection against `Object.getOwnPropertySymbols` enumeration, but this threat is not in the ADR charter's requirements.

## 7. What to Implement Next

1. Rewrite design.md with v2 architecture
2. Create BaseController (protected engine, DRY state/subscribe)
3. Create BaseInterface (symbols, abstract resolvers, resolveThunks, dispose)
4. Migrate interface classes (Search, Commerce, Generative)
5. Refactor ComposedInterface as plain object factory
6. Migrate controllers to extend BaseController
7. Add dispose() to Engine
8. Update Supports<F> to structural interface
9. Remove sub-path exports from package.json
10. Cleanup: delete facade-cache.ts, resolve-facades.ts (if redundant)
11. Update tests

## 8. Files

### Spec
- `.kiro/specs/class-based-interfaces-and-controllers/design.md` (to be rewritten)
- `.kiro/specs/class-based-interfaces-and-controllers/tasks.md` (to be regenerated)

### Previous implementation (stashed)
The v1 implementation (#private + friends) is stashed in git for reference.
