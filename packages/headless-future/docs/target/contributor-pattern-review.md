# Contributor Pattern Review

> Part of the `@coveo/headless-future` [architecture](architecture.md). See the
> [glossary](glossary.md) for term definitions.

An architectural analysis of the `onRequest` contributor pattern used in
`SearchEndpointFacade` and `ConversationEndpointFacade`.

## Table of Contents

- [Executive Summary](#executive-summary)
- [What the Pattern Does](#what-the-pattern-does)
  - [The Involved Types](#the-involved-types)
  - [How Loaders Wire It Up](#how-loaders-wire-it-up)
- [Two Separate Registries](#two-separate-registries)
- [Five Critical Questions](#five-critical-questions)
  - [1. Is it easy to debug?](#1-is-it-easy-to-debug)
  - [2. Are there consequences?](#2-are-there-consequences)
  - [3. Is contributor order explicit?](#3-is-contributor-order-explicit)
  - [4. Is it a good pattern?](#4-is-it-a-good-pattern)
  - [5. Is it overkill?](#5-is-it-overkill)
- [The Core Architectural Flaw](#the-core-architectural-flaw)
- [Alternative Patterns](#alternative-patterns)
  - [Option A — Composed Selector](#option-a--composed-selector)
  - [Option B — State-Selector Contributors (Incremental Fix)](#option-b--state-selector-contributors-incremental-fix)
  - [Option C — Two-Tier Model (Recommended)](#option-c--two-tier-model-recommended)
- [Applying the Recommendation Per Endpoint](#applying-the-recommendation-per-endpoint)
- [Recommendations](#recommendations)

---

## Executive Summary

The contributor pattern (`onRequest`) was introduced to decouple request
building across features: each feature loader registers a function that
contributes its slice of the API request, and the facade merges them at call
time.

The pattern is implemented correctly but applied in the wrong context and with
a type signature that undermines its own goals. The core issues are:

- Contributors are **zero-argument closures** that can read from anything —
  breaking the Layer 0 rule that all state access goes through the `Engine`.
- The request is assembled from an **implicit, order-dependent set of
  anonymous functions**, making it hard to inspect, test, or reason about.
- There are **two separate registries** with inconsistent usage across endpoints
  and no documented semantic difference.

**For the search endpoint**, the request fields are finite and well-known. A
composed state selector is simpler, more debuggable, and more consistent with
how the rest of this codebase works. The `onRequest()` mechanism should be
repositioned as a public extension point for consumers, not used for internal
wiring.

**For the conversation endpoint**, the contributor model is more justified
because the request legitimately varies by deployment. The fix there is
narrower: change contributor signatures to receive `State` as an argument
instead of closing over the engine.

---

## What the Pattern Does

The contributor pattern decentralizes request building. Instead of a single
function reading all required state and assembling the final API request,
multiple independent **contributor** functions each return a `Partial<TRequest>`.
The facade collects them all and merges them at call time.

### The Involved Types

```ts
// endpoint-facade-types.ts
export type RequestContributor<TRequest extends object> =
  () => Partial<TRequest>;
```

```ts
// endpoint-facade.ts
export abstract class EndpointFacade<TRequest extends object> {
  onRequest(contribute: RequestContributor<TRequest>): () => void { ... }
}
```

```ts
// endpoint-facade-request-builder.ts
export const buildRequest = <TRequest extends object>(
  contributors: Array<RequestContributor<TRequest>>
): TRequest => {
  return contributors.reduce<TRequest>((request, contribute) => {
    return deepMerge(request, contribute()); // each contributor called with no args
  }, {} as TRequest);
};
```

### How Loaders Wire It Up

Each feature loader does two jobs: it adopts its Redux slice **and** registers a
contributor to the relevant endpoint facade:

```ts
// search-box-loader.ts
export const loadSearchBox = (engine: FullEngine) => {
  engine.adoptSlice(searchBoxSlice);

  const facade = SearchEndpointFacade.getInstance(engine);
  facade.onRequest(() => ({
    // ← zero-arg closure
    q: engine.read(searchBoxSelectors.getQuery), //   reads from closed-over engine
  }));
};
```

```ts
// result-list-loader.ts
export const loadResultList = (engine: FullEngine) => {
  engine.adoptSlice(resultsSlice);

  const facade = SearchEndpointFacade.getInstance(engine);
  facade.onResponse((response) => {
    // ← response side: writes to state
    engine.mutate(setResults(map(response)));
  });
};
```

---

## Two Separate Registries

There are currently two independent mechanisms for registering contributors,
used inconsistently across endpoints.

| Mechanism                                       | API                                      | Used by                                                  |
| ----------------------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| `EndpointFacade.onRequest()`                    | Local to the facade instance             | `loadSearchBox`, `loadPagination`, etc.                  |
| `EndpointContributorRegistry.register(key, fn)` | Module-level `WeakMap<Engine, Registry>` | `loadConversationEndpoint` (defaults, navigator context) |

`ConversationEndpointFacade.callEndpoint()` merges **both** — registry contributors
first (base/defaults), facade-local contributors second (feature overrides):

```ts
const finalRequest = buildRequest([
  ...contributorRegistry.getOrderedContributors(conversationEndpointKey),
  ...this.getOrderedRequestContributors(),
]);
```

`SearchEndpointFacade.callEndpoint()` only uses its own local contributors —
it does not consult `EndpointContributorRegistry` at all. There is no `search`
key in `endpointKeys`.

**Consequence:** the two endpoints have entirely different extension models with
no documentation explaining the semantic difference between the two registries.

---

## Five Critical Questions

### 1. Is it easy to debug?

**No — harder than a direct state-read approach.**

When a search request carries the wrong `q`, there is no single place to inspect.
The request is assembled by calling an unknown number of anonymous thunks at
runtime. Debugging requires:

1. Knowing that contributors exist and where they are registered.
2. Tracing which `loadXxx()` calls were made (determining which contributors
   are active).
3. Knowing the registration order (which determines collision resolution).
4. Stepping through `buildRequest` as it merges each contributor's output.

The facades expose a debug helper, but it only returns a count:

```ts
getRequestCompositionDebugInfo() {
  return { registeredContributorCount: this.getRegisteredRequestContributorCount() };
}
```

Knowing there are 3 contributors tells you nothing about what they produce.

Compare this to the previous `executeSearchAPI` approach — a single function
where every request field was visible in one place, readable top-to-bottom.

---

### 2. Are there consequences?

**Yes — several non-obvious ones.**

**Silent field collisions.** If two contributors provide the same field, the
last one silently wins via `deepMerge`. No warning is raised, no conflict is
detected. Changing the controller creation order in consumer code silently
changes the final request.

**Array fields are replaced, not merged.** `deepMerge` treats arrays as
primitives because `isMergeableObject` returns `false` for arrays:

```ts
const isMergeableObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
```

Two contributors both contributing `facets: [...]` will silently lose the
first array. This is a data-loss footgun.

**No fault isolation.** If any contributor throws, `buildRequest` throws and
the entire `callEndpoint()` is aborted. There is no way for one contributor
to fail gracefully while the others still participate.

**Contributor leak.** All current loaders discard the unsubscribe handle
returned by `onRequest()`:

```ts
facade.onRequest(() => ({q: engine.read(searchBoxSelectors.getQuery)}));
// ↑ return value (unsubscribe function) is silently discarded
```

Contributors accumulate in `#requestContributors` for the lifetime of the
engine. The WeakSet guard in each loader prevents duplicate registration
today, but the pattern is fragile.

---

### 3. Is contributor order explicit?

**No — it is implicit and load-order dependent.**

Registration order is determined by the sequence in which `loadXxx()` functions
are called, which is determined by the order in which controllers are
instantiated by the consumer:

```ts
// Consumer code — registration order flows from this
const searchBox = buildSearchBoxController({engine}); // q contributor registered 1st
const pagination = buildPaginationController({engine}); // firstResult registered 2nd
```

For non-overlapping fields this is irrelevant. For overlapping fields, changing
this order silently changes the request. Nothing in the type system or runtime
warns about ordering sensitivity.

The conversation endpoint adds a second tier of implicit ordering: registry
contributors always precede facade-local contributors. This priority rule is
undocumented.

---

### 4. Is it a good pattern?

**In the right context — yes. For this use case — mostly no.**

The contributor pattern earns its complexity when:

- External parties (consumers, plugins, framework adapters) need to inject
  fields into a request at runtime.
- The request structure is open-ended and not fully known at design time.
- Different deployments need different request compositions.

For `headless-future`'s current search endpoint, the request fields (`q`,
`firstResult`, `numberOfResults`, `facets`) are well-known, finite, and
defined entirely at design time. There is no external plugin scenario. Every
registered contributor is permanent and always active.

The pattern would genuinely shine if, for example, an optional analytics
controller needed to inject tracking fields only when loaded, or if consumers
needed to add custom request parameters for their specific Coveo deployment.
That is dynamic and externally driven — a real fit for the contributor model.

For "search box always contributes its query", it is the wrong tool.

---

### 5. Is it overkill?

**For the search endpoint: yes. For the conversation endpoint: debatable.**

The removed `executeSearchAPI` approach was simpler and fully traceable:

```ts
// Old direct approach — no pattern to learn, easy to trace
async function executeSearchAPI(engine: FullEngine): Promise<void> {
  const q = engine.read(searchBoxSelectors.query);
  const firstResult = engine.read(paginationSelectors.firstResult);
  const facets = engine.read(facetSelectors.all);
  const request = {q, firstResult, numberOfResults, facets};
  const response = await httpClient.call(request, config);
  engine.mutate(resultsMutations.setResults(transform(response)));
}
```

The contributor pattern replaces this with a singleton facade, a contributor
registry, multiple loaders, and a `deepMerge` assembly step. The added
complexity buys composability that is not currently needed for the search
endpoint.

The conversation endpoint has a stronger case. Its request includes contextual
data — navigator context, session tokens, language, `targetEngine` — from
different sources that legitimately vary by deployment. A contributor model keeps
each concern isolated without coupling them together. Even so, reading from
state directly inside `callEndpoint()` would achieve the same isolation with
less indirection.

---

## The Core Architectural Flaw

The deepest issue is that contributors are **zero-argument closures** rather than
**pure state selectors**. The type definition offers no constraint on what a
contributor may do:

```ts
// Current — no constraints on what the contributor reads
type RequestContributor<TRequest extends object> = () => Partial<TRequest>;
```

A contributor could read from the engine, from a global, from `localStorage`,
or from the DOM. The type system cannot enforce the architectural rule that all
state access goes through the `Engine`. Every other read operation in this
codebase is a selector — a pure function of `State`. Contributors are the only
exception, and there is no reason for that exception to exist.

The three alternatives below all address this flaw to varying degrees.

---

## Alternative Patterns

Three viable alternatives exist, addressing the stated goals of good
architecture, maintainability, testability, and debuggability. They are not
mutually exclusive — the recommended approach combines elements of all three.

---

### Option A — Composed Selector

The request is modeled as **derived state**: a memoized selector that reads
from all relevant feature slices and produces the final request object.

The core observation is that a search request is just a transformation of
state — the same thing that `createMemoizedStateSelector` already handles
throughout this codebase.

```ts
// search-request-selector.ts
export const buildSearchRequest = createMemoizedStateSelector<
  State,
  [string, number, number, Record<string, FacetState>],
  CoveoSearchEndpointRequest
>(
  [
    (state) => state.searchBox?.query ?? '',
    (state) => state.pagination?.currentPage ?? 1,
    (state) => state.pagination?.pageSize ?? 10,
    (state) => state.facets ?? {},
  ],
  (query, currentPage, pageSize, facets) => ({
    q: query,
    firstResult: (currentPage - 1) * pageSize,
    numberOfResults: pageSize,
    facets: buildFacetRequests(facets),
  })
);
```

The facade reads from the selector at call time — no registry, no contributors:

```ts
// SearchEndpointFacade.callEndpoint()
const request = this.engine.read(buildSearchRequest);
```

Loaders are reduced to slice adoption only — they no longer touch the facade:

```ts
// search-box-loader.ts — after
export const loadSearchBox = (engine: FullEngine) => {
  engine.adoptSlice(searchBoxSlice); // that's it
};
```

Testing the full request requires no mocks:

```ts
it('builds the request from current state', () => {
  const state: State = {
    searchBox: {query: 'laptops'},
    pagination: {currentPage: 2, pageSize: 10, totalCount: 100},
  };

  expect(buildSearchRequest(state)).toEqual({
    q: 'laptops',
    firstResult: 10,
    numberOfResults: 10,
    facets: [],
  });
});
```

The full request is also inspectable at any time without triggering a network
call:

```ts
engine.read(buildSearchRequest); // current request, always up-to-date
```

| Criteria       | Score                                                              |
| -------------- | ------------------------------------------------------------------ |
| Debuggable     | ✅ Request readable from state at any time                         |
| Testable       | ✅ Pure function — pass a state object, get a request              |
| Order explicit | ✅ Selector inputs are declared, not registration-order-dependent  |
| Maintainable   | ✅ Adding a field = adding one sub-selector                        |
| Coupling       | ⚠️ The request selector knows about all contributing feature slices |

---

### Option B — State-Selector Contributors (Incremental Fix)

A minimal change to the current pattern: keep the contributor registry but
change the contributor signature from a zero-argument closure to a pure
function that receives `State` as an argument.

**Type change:**

```ts
// endpoint-facade-types.ts — before
type RequestContributor<TRequest extends object> = () => Partial<TRequest>;

// endpoint-facade-types.ts — after
type RequestContributor<TRequest extends object> =
  (state: State) => Partial<TRequest>;
```

**`buildRequest` receives state and passes it down:**

```ts
// endpoint-facade-request-builder.ts — after
export const buildRequest = <TRequest extends object>(
  contributors: Array<RequestContributor<TRequest>>,
  state: State
): TRequest =>
  contributors.reduce<TRequest>(
    (request, contribute) => deepMerge(request, contribute(state)),
    {} as TRequest
  );
```

**Loaders register pure functions — no closed-over `engine`:**

```ts
// search-box-loader.ts — after
facade.onRequest((state) => ({
  q: searchBoxSelectors.getQuery(state), // pure selector, no engine closure
}));
```

This option fixes testability and Layer 0 compliance with minimal disruption.
It does not resolve implicit ordering or the two-registry split.

**Before and after comparison:**

|                         | Before (closure)                | After (selector)               |
| ----------------------- | ------------------------------- | ------------------------------ |
| Contributor signature   | `() => Partial<T>`              | `(state: State) => Partial<T>` |
| State access            | Via closed-over `engine.read()` | Via argument                   |
| Testable in isolation   | ❌ Needs engine + facade        | ✅ Just pass a state object    |
| Enforced by types       | ❌ Can read anything            | ✅ Only receives `State`       |
| Side effects possible   | ✅ Yes                          | ❌ No                          |
| Consistent with Layer 0 | ❌ Partial                      | ✅ Full                        |

| Criteria       | Score                                                   |
| -------------- | ------------------------------------------------------- |
| Debuggable     | ⚠️ Still distributed — no single place to see the full request |
| Testable       | ✅ Contributors are now pure functions                  |
| Order explicit | ❌ Still depends on `loadXxx` call order                |
| Maintainable   | ✅ Minimal change to existing code                      |
| Coupling       | ✅ Features remain decoupled from each other            |

---

### Option C — Two-Tier Model (Recommended)

Combine Options A and B. The internal request building uses a composed
selector (Option A). The `onRequest()` mechanism is retained but repositioned
as a **public extension point** for consumers — not used internally.

```ts
// SearchEndpointFacade.callEndpoint()
async callEndpoint(): Promise<void> {
  // Tier 1: state-driven, deterministic, always present
  const state = this.engine.read((s) => s);
  const coreRequest = buildSearchRequest(state);

  // Tier 2: consumer extensions — opt-in, layered on top
  const extensions = buildRequest(this.getOrderedRequestContributors(), state);

  const finalRequest = deepMerge(coreRequest, extensions);
  // ...
}
```

The semantic split becomes explicit and documented:

| Tier | Mechanism | Owner | When to use |
| ---- | --------- | ----- | ----------- |
| Core | `buildSearchRequest` selector | Internal (loaders, features) | All well-known request fields |
| Extension | `facade.onRequest(fn)` | External (consumers, plugins) | Custom fields, analytics, deployment-specific overrides |

| Criteria       | Score                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Debuggable     | ✅ Core request always inspectable; extensions clearly separated         |
| Testable       | ✅ Core: pure selector test; extensions: state-selector contributor test |
| Order explicit | ✅ Core: declared in selector; extensions: registration-order (documented) |
| Maintainable   | ✅ Clear ownership — internal uses selector, external uses contributor   |
| Coupling       | ✅ Best of both worlds                                                   |

---

## Applying the Recommendation Per Endpoint

| Endpoint | Recommended approach | Rationale |
| -------- | -------------------- | --------- |
| **Search** | Option C (Two-Tier) | Request fields are finite and well-known; composability only needed for consumer extensions |
| **Conversation** | Option B (State-Selector Contributors) + registry unification | Request legitimately varies by deployment and feature; contributor model is appropriate, but closures must become pure selectors and the two registries must be merged |

For the conversation endpoint specifically, the `EndpointContributorRegistry`
makes architectural sense — infrastructure contributors (navigator context,
session tokens, language, `targetEngine`) legitimately come from different
sources. The fix is to:

1. Change all contributor signatures to `(state: State) => Partial<T>`.
2. Collapse the facade-local registry and the `EndpointContributorRegistry`
   into a single registry per endpoint. Remove the implicit two-tier ordering
   (registry-first, facade-second) and replace it with an explicit priority
   field or registration-time ordering that is documented.

---

## Recommendations

| Priority | Recommendation |
| -------- | -------------- |
| 🔴 | Change `RequestContributor<T>` to `(state: State) => Partial<T>` and update `buildRequest` to pass state |
| 🔴 | For the search endpoint, replace internal contributor wiring with a composed `buildSearchRequest` selector (Option C) |
| 🟠 | For the conversation endpoint, unify the two registries into one; remove the implicit two-tier ordering |
| 🟠 | Reposition `onRequest()` as a documented public extension point for consumers only — remove its use from internal loaders |
| 🟡 | Add a `search` key to `endpointKeys` so the conversation registry pattern can be replicated for search if needed |
| 🟡 | Return and store the unsubscribe handle from `onRequest()` in loaders, or document why permanent registration is intentional |
| 🟡 | Expand `getRequestCompositionDebugInfo()` to expose contributor output snapshots, not just counts |

**Decision matrix across internal wiring and public extension:**

| | Internal wiring | Public extension point |
| --- | --- | --- |
| **Recommended** | Composed selector (`buildSearchRequest`) | State-selector `onRequest(fn)` |
| **Current** | Zero-arg closure | Zero-arg closure |
| **Incremental fix** | State-selector contributor | State-selector contributor |

The composed selector approach is the most consistent with how the rest of
Layer 0 works: state is the source of truth, selectors are the read mechanism,
and the request is simply another derived value. The `onRequest()` extension
point remains available for the cases where it is genuinely needed — consumer
customization — rather than being overloaded as the primary internal wiring
mechanism.
