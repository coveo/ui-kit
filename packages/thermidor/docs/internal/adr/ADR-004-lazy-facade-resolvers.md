# ADR-004: Lazy Facade Resolvers on Interface Objects

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-002 Multi-Interface Engine](./ADR-002-multi-interface-engine.md), [ADR-003 Facade Request Response](./ADR-003-facade-request-response.md)

## 1. Context

Interfaces previously carried eagerly-instantiated thunks via `[THUNKS]` and `[THUNK_FACTORIES]` symbols. The `composeInterfaces` function re-instantiated all factories with a different scope. Controllers read `interface[THUNKS].search` directly to dispatch.

- **Business/context drivers**: Controllers must be decoupled from whether they operate on a search, commerce, or composed interface. Adding a new facade should not require modifying global type registries.
- **Technical constraints**: Facades (async thunks) adopt Redux slices and create memoized selectors — instantiation has side effects. Eager instantiation wastes resources when controllers don't use all operations. In SPAs, dynamic interface creation must not leak memory.
- **Known assumptions**: Each facade is a singleton per interface scope (interfaceId + optional composedInterfaceId). The same scope always returns the same thunk instance.

## 2. Decision Statement

Replace eager thunk instantiation with lazy facade resolvers stored as a typed `Record` on the interface object, keyed by a private Symbol (`[FACADE_RESOLVERS]`). Each resolver is a closure-cached factory function that creates the thunk on first call. The interface carries a `[TYPE]` discriminant for structural type safety.

## 3. Requirements & Considerations Mapping

### MUST

1. **Requirement**: Full use-case support
   - **Impact**: Positive
   - **How satisfied**: Controllers call `resolveAllThunks(iface, 'search')` which works identically for search, commerce, and composed interfaces. Each interface's `[FACADE_RESOLVERS]` record provides the correct resolver for each operation.

2. **Requirement**: Public API independence
   - **Impact**: Positive
   - **How satisfied**: `[FACADE_RESOLVERS]` is Symbol-keyed and not exported publicly. Consumers see an opaque interface object. The `resolveOperation` mechanism is invisible to them.

3. **Requirement**: First-class SSR
   - **Impact**: None
   - **How satisfied**: N/A — facade resolution is synchronous and does not depend on browser APIs.

### SHOULD

1. **Requirement**: Tree-shaking efficiency
   - **Impact**: Positive
   - **How addressed**: Facade loaders are imported only by their respective interface builder. If `buildCommerceInterface` is not imported, all commerce loaders are tree-shaken.

2. **Requirement**: Migration simplicity
   - **Impact**: None
   - **How addressed**: Internal refactor only. Controller public API is unchanged.

3. **Requirement**: External contribution readiness
   - **Impact**: Positive
   - **How addressed**: Adding a new facade = create a loader file + add one entry to the interface's `[FACADE_RESOLVERS]` record. TypeScript enforces completeness via the `Facades` type.

## 4. Options Considered

### Option A: Eager Thunk Factories (Previous)

- **Summary**: Interfaces carry `[THUNK_FACTORIES]` and `[THUNKS]`. Factories are called at interface construction, thunks stored as arrays. `composeInterfaces` re-calls all factories with a composed scope.
- **Pros**: Simple mental model, structural type safety via `Requires<T>` checking `[THUNKS]` shape.
- **Cons**: Eager instantiation of all facades. `composeInterfaces` is complex (re-instantiation). No natural GC boundary for composed thunks.
- **Risks**: Adding facades increases construction cost linearly.

### Option B: Global Operation Registry

- **Summary**: Interfaces register their loaders into a global `WeakMap<Engine, Map<key, loader[]>>`. Controllers call `resolveOperation(engine, scope, 'search')` to resolve.
- **Pros**: Controller fully decoupled. Lazy resolution.
- **Cons**: Global mutable state (WeakMap). No natural GC for interface-scoped entries. `registerOperation` not idempotent. Requires explicit `dispose()`. Complex phantom types for type safety.
- **Risks**: Memory leaks in SPAs without dispose. Debugging difficulty (hidden registry).

### Option C (Selected): Lazy Facade Resolvers on Interface (Strategy Pattern)

- **Summary**: Each interface object carries `[FACADE_RESOLVERS]: Record<Facades[T], FacadeResolver>`. Each resolver is backed by `createFacadeCache(engine, factory)` — a closure with an internal Map that creates the thunk on first call and caches it by scope key. `composeInterfaces` delegates to sub-interface resolvers.

- **Pros**:
  - **Lazy**: facades instantiated only when a controller requests them
  - **No global state**: cache lives in the closure, owned by the interface object
  - **Natural GC**: interface GC'd → closure GC'd → cache GC'd
  - **Controller decoupled**: `resolveAllThunks(iface, 'search')` works for any interface type
  - **Type-safe**: `Facades` Record enforces completeness; `[TYPE]` discriminant prevents wrong-interface assignment
  - **Compose is trivial**: delegates to matching sub-interface resolver
  - **Hidden from consumer**: `[FACADE_RESOLVERS]` is Symbol-keyed, not in public API
- **Cons**:
  - More files than original (4 loaders + facade-cache + resolve-all-thunks)
  - One level of indirection vs reading `[THUNKS]` directly
- **Risks**:
  - Facade names are string literals in `Facades` type — typos in `resolveAllThunks` calls caught at compile time but not in ad-hoc string usage

## 5. Decision Rationale

Option C provides the best balance of laziness, simplicity, type safety, and GC behavior. Option A's eager instantiation wastes resources and makes composition complex. Option B's global registry adds hidden state, GC problems, and complex phantom types for marginal benefit over Option C.

The key insight: by placing the resolver Record on the interface object itself (as a method dispatch table), we get the strategy pattern's polymorphism without any global coordination. The interface is both the identity and the resolution mechanism.

The `[TYPE]` discriminant was added for structural type safety: it prevents passing a generative interface to a search controller at compile time, without requiring phantom types or complex type machinery.

## 6. Public API and Contract Impact

- **Public API changes**: None — `[FACADE_RESOLVERS]` is Symbol-keyed and not exported. Controller signatures accept `Supports<'search'>` (auto-derived from the `Facades` registry).
- **Backward compatibility impact**: Breaking for internal code only — `Requires<T>`, `[THUNKS]`, `[THUNK_FACTORIES]` removed.
- **Deprecations required**: `Requires<T>` type replaced by `Supports<F>`.
- **Type/contract stability notes**: `Facades` interface enforces that all declared operations have resolvers.
- **Non-leakage check**: Pass — consumers cannot access `[FACADE_RESOLVERS]` without the unexported Symbol.

## 7. Operational and Runtime Impact

- **Performance impact**: Positive — lazy instantiation means unused facades cost nothing.
- **Reliability impact**: Neutral — same runtime behavior once resolved.
- **Security/privacy impact**: None.
- **SSR impact**: None — synchronous resolution.
- **Observability impact**: Neutral.

## 8. Migration and Rollout Plan

- **Consumer migration impact**: None — internal refactor.
- **Rollout strategy**: Big-bang (internal to thermidor).
- **Rollback strategy**: Revert to eager thunk pattern (stashed as `facade-loader-refactor-registry-approach`).
- **Communication plan**: None required (internal decision).
