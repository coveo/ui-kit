# ADR-005: Class-Based Interfaces and Controllers

**Status**: `🟢 Implemented`
**Related docs**: ADR-001 (Anti-Corruption Layer), ADR-004 (Lazy Facade Resolvers)

## 1. Context

Thermidor uses factory functions returning frozen object literals with symbol-keyed properties for interfaces and controllers. The initial proposal (v1) migrated to ES classes with `#private` fields and a "friend pattern" for cross-class access. After evaluation, a simplified variant was adopted: `#private` fields with `static {}` accessor hooks (matching the `Engine` / `getFullEngine` pattern already established in the codebase).

## 2. Decision Statement

Implement a class-based architecture using:

- **`#private` fields** for all internal state — true runtime inaccessibility
- **`static {}` blocks** exporting accessor hooks (`getInterfaceInternals`, `getComposedInternals`, `getGenerativeSourceEngine`) for cross-class access
- **`BaseInterface<T>`** abstract class with `#engine`, `#stateId`, `#type`, `#resolvers`, `#facadeCache`
- **`BaseController<TState>`** abstract class with `protected engine`
- **`ComposedInterface<T>`** as a class with its own `#private` state and `static {}` hook
- **`Supports<F>`** as a structural interface (duck typing) satisfied by both classes
- **`getHandleInternals()`** utility for controllers that accept `Supports<F>`
- **`dispose()`** public on Engine and BaseInterface

## 3. Design Principles

1. **No leaks to the consumer.** Internal mechanics must not appear in the public API surface. `#private` fields are not enumerable and not accessible without the accessor hooks, which are internal-only (never re-exported from `src/index.ts`).

2. **Consistency over novelty.** The `#private` + `static {}` hook pattern matches `Engine` / `getFullEngine`. One pattern to learn, applied everywhere.

3. **Polymorphism for interfaces, duck typing for composition.** Interface classes use inheritance for shared behavior. `ComposedInterface` satisfies `Supports<F>` structurally without inheriting from `BaseInterface`.

4. **Classes for behavior, interfaces for contracts.** Consumer-facing types are TypeScript interfaces. Classes are internal implementation.

## 4. Architecture

### Class Hierarchy

```
BaseInterface<T extends InterfaceType>  (abstract class — #private, static hook, resolvers, cache, dispose)
├── SearchInterface                     (concrete — search + suggestions resolvers)
├── CommerceInterface                   (concrete — commerce search + suggestions resolvers)
└── GenerativeInterface                 (concrete — noop resolver + #sourceEngine + static hook)

ComposedInterface<T>                    (class — #private, static hook, delegates to sub-interfaces)

BaseController<TState>                  (abstract class — protected engine, DRY state/subscribe)
├── SearchBoxControllerImpl
├── ResultListControllerImpl
├── ProductListControllerImpl
├── PaginationControllerImpl
├── CartControllerImpl
└── ConverseControllerImpl
```

### Key Design Elements

#### BaseInterface (#private + static hook)

```typescript
export interface InterfaceInternals<T extends InterfaceType = InterfaceType> {
  engine: FullEngine;
  stateId: string;
  type: T;
}

export let getInterfaceInternals: <T extends InterfaceType>(
  iface: BaseInterface<T>
) => InterfaceInternals<T>;

export abstract class BaseInterface<T extends InterfaceType> {
  #engine: FullEngine;
  #stateId: string;
  #type: T;
  #resolvers: Record<Facades[T], FacadeResolverFactory>;
  #facadeCache = new Map<string, EndpointThunk>();
  #disposed = false;

  static {
    getInterfaceInternals = (iface) => ({
      engine: iface.#engine,
      stateId: iface.#stateId,
      type: iface.#type,
    });
  }

  constructor(engine, stateId, type, resolvers) { ... }

  resolveFacades(facade: Facades[T], composedInterfaceId?: string): EndpointThunk[] { ... }
  dispose(): void { ... }
  get disposed(): boolean { ... }
}
```

#### ComposedInterface (#private + static hook)

```typescript
export let getComposedInternals: <T extends InterfaceType>(
  composed: ComposedInterface<T>
) => ComposedInternals;

export class ComposedInterface<T extends InterfaceType> {
  #engine: FullEngine;
  #stateId: string;
  #interfaces: BaseInterface<T>[];

  static {
    getComposedInternals = (composed) => ({
      engine: composed.#engine,
      stateId: composed.#stateId,
    });
  }

  constructor(interfaces: BaseInterface<T>[], composedId: string) { ... }
  resolveFacades(facade, composedInterfaceId?): EndpointThunk[] { ... }
  dispose(): void { /* no-op */ }
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

#### Controller usage (via getHandleInternals)

```typescript
class SearchBoxControllerImpl extends BaseController<SearchBoxControllerState> {
  #thunks: EndpointThunk[];

  constructor(options: SearchBoxControllerOptions) {
    const {engine, stateId} = getHandleInternals(options.interface);
    // ...
    super(engine, controllerState);
    this.#thunks = options.interface.resolveFacades('search');
  }

  setQuery({query}) { this.engine.mutate(this.#actions.setQuery(query)); }
  submit() { return Promise.all(this.#thunks.map(t => this.engine.mutate(t({engine: this.engine})))); }
}
```

#### Supports<F> (structural interface)

```typescript
export type Supports<F extends Facades[InterfaceType]> = {
  resolveFacades(facade: F, composedInterfaceId?: string): EndpointThunk[];
  dispose(): void;
};
```

## 5. Evolution History

| v1 (#private + friends)                            | v2 (symbols)                     | v3 (#private + static hooks) — current |
| -------------------------------------------------- | -------------------------------- | -------------------------------------- |
| 8 friend functions                                 | 0 friend functions               | 0 friend functions                     |
| WeakMap + registerFacadeResolver                   | Abstract `resolvers` Record      | Constructor-injected resolvers         |
| `static {}` blocks (friend registration)           | Standard constructors            | `static {}` blocks (accessor hooks)    |
| `controllerMutate(this, action)`                   | `this.engine.mutate(action)`     | `this.engine.mutate(action)`           |
| `getInterfaceInternals(iface).stateId`             | `iface[STATE_ID]`                | `getInterfaceInternals(iface).stateId` |
| `resolveInterfaceFacades(iface, 'search')`         | `iface.resolveFacades('search')` | `iface.resolveFacades('search')`       |
| ComposedInterface extends BaseInterface            | ComposedInterface = plain object | ComposedInterface = class (own hook)   |
| 2 methods (resolveFacades + resolveFacadeForScope) | 1 method (resolveFacades)        | 1 method (resolveFacades)              |
| ~85 lines boilerplate in base-interface.ts         | ~35 lines                        | ~40 lines                              |

## 6. Why #private + Static Hooks

The `static {}` hook pattern (established by `Engine` / `getFullEngine`) provides:

1. **True runtime encapsulation** — `#private` fields are not enumerable via `Object.getOwnPropertySymbols`, unlike symbol-keyed properties.
2. **Familiar pattern** — developers already use it for Engine; consistency reduces cognitive load.
3. **Type-safe** — accessor hooks are generic functions with proper inference, no `as any` needed.
4. **No re-export risk** — hooks are module-scoped `let` bindings, never part of the public `src/index.ts` barrel.

## 7. Files

### Implementation

- `src/core/interface/base-interface.ts` — BaseInterface + `getInterfaceInternals`
- `src/core/interface/base-controller.ts` — BaseController
- `src/core/interface/utils/get-handle-internals.ts` — unified `getHandleInternals` utility
- `src/core/interface/utils/interface-types.ts` — `Supports<F>`, `Facades`, etc.
- `src/public/interfaces/compose.ts` — ComposedInterface + `getComposedInternals`
- `src/public/interfaces/generative.ts` — GenerativeInterface + `getGenerativeSourceEngine`
- `src/public/interfaces/search.ts` — SearchInterface
- `src/public/interfaces/commerce.ts` — CommerceInterface

### Spec

- `.kiro/specs/class-based-interfaces-controllers-v2/design.md`
- `.kiro/specs/class-based-interfaces-controllers-v2/tasks.md`
