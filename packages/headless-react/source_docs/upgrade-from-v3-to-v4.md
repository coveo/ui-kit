---
title: v3 to v4
group: Guides
category: Upgrade
slug: upgrade/v3-to-v4
---

# Upgrade from v3 to v4

This guide covers the `@coveo/headless-react` changes that ship with [Headless](https://docs.coveo.com/en/lcdf0493/) v4.
The engine definition, `fetchStaticState()` and `hydrateStaticState()` changes are in the [Headless upgrade guide](https://docs.coveo.com/en/headless/latest/reference/documents/upgrade/v3-to-v4.html).

> [!IMPORTANT]
>
> The following are breaking changes from Headless v3 to v4.

## Requirements

<!-- TODO: KIT-6388 -->

The minimum React, Node.js and TypeScript versions for v4 will be listed here.

## Modified behaviors

<!-- TODO: KIT-6388 -->

Modified behaviors outside server-side rendering will be listed here.

### Server-side rendering

The `@coveo/headless-react/ssr` and `@coveo/headless-react/ssr-commerce` sub-packages keep their paths, but the API behind them is new.
`defineSearchEngine()` and `defineCommerceEngine()` return engine definitions and hooks, and `buildProviderWithDefinition()` builds the provider that renders the static state and hydrates it.

| Topic                         | Headless v3                                                                                                                             | Headless v4                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `defineSearchEngine()` result | One object with `fetchStaticState`, `hydrateStaticState`, `StaticStateProvider`, `HydratedStateProvider`, `useEngine` and `controllers` | `searchEngineDefinition`, `standaloneEngineDefinition`, `useEngine`, `useHydration` and `controllers` |
| Search provider               | Hand-written: `hydrateStaticState()` in an effect, then `StaticStateProvider` or `HydratedStateProvider`                                | `buildProviderWithDefinition(definition)`                                                             |
| Provider props                | `staticState`, `navigatorContext` and `accessToken`                                                                                     | `staticState` and `onHydrationError`                                                                  |
| Hydration status              | `methods === undefined`                                                                                                                 | `useHydration()`                                                                                      |
| Recommendations               | `recommendationEngineDefinition` with a nested provider                                                                                 | The `recommendations` option and the page's provider                                                  |
| Commerce context hook         | `useContext`                                                                                                                            | `useCommerceContext` <!-- decided 2026-10-21, not yet built -->                                       |

#### Sub-package paths

<!-- decided 2026-10-21, not yet built -->

The v3 API of `/ssr` and `/ssr-commerce` is removed, and the API that v3 shipped as a preview is published under the same paths, so your imports still resolve but the members behind them change.

**Headless Version 3**

```ts
import {defineSearchEngine} from '@coveo/headless-react/ssr';

const engineDefinition = defineSearchEngine(config);

export const {
  fetchStaticState,
  hydrateStaticState,
  StaticStateProvider,
  HydratedStateProvider,
  setNavigatorContextProvider,
} = engineDefinition;

export const {
  useResultList,
  useSearchBox,
  useTabManager,
  useAuthorFacet,
  useSearchParameterManager,
} = engineDefinition.controllers;
```

**Headless Version 4**

```ts
import {defineSearchEngine} from '@coveo/headless-react/ssr';

export const {
  searchEngineDefinition,
  standaloneEngineDefinition,
  useEngine,
  useHydration,
  controllers: {useResultList, useSearchBox, useTabManager, useAuthorFacet, useParameterManager},
} = defineSearchEngine(config);
```

Each controller of the definition still yields a `use<Name>` hook, and `useParameterManager` comes from the `parameterManager` controller that every search definition includes.

#### Providers

`buildProviderWithDefinition()` replaces `StaticStateProvider`, `HydratedStateProvider` and the provider you wrote to hydrate the static state.

**Headless Version 3**

```tsx
'use client';

export function SearchPageProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<{staticState: SearchStaticState; navigatorContext: NavigatorContext}>) {
  const [hydratedState, setHydratedState] = useState<SearchHydratedState | undefined>(undefined);

  setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    const {searchParameterManager, context} = staticState.controllers;
    hydrateStaticState({
      searchAction: staticState.searchAction,
      controllers: {
        context: {initialState: context.state},
        searchParameterManager: {initialState: searchParameterManager.state},
      },
    }).then(({engine, controllers}) => setHydratedState({engine, controllers}));
  }, [staticState]);

  if (hydratedState) {
    return (
      <HydratedStateProvider engine={hydratedState.engine} controllers={hydratedState.controllers}>
        {children}
      </HydratedStateProvider>
    );
  }
  return (
    <StaticStateProvider controllers={staticState.controllers}>{children}</StaticStateProvider>
  );
}
```

**Headless Version 4**

```tsx
'use client';

import {buildProviderWithDefinition} from '@coveo/headless-react/ssr';
import {searchEngineDefinition, standaloneEngineDefinition} from '../lib/engine';

export const SearchProvider = buildProviderWithDefinition(searchEngineDefinition);
export const StandaloneProvider = buildProviderWithDefinition(standaloneEngineDefinition);
```

The provider renders the static state, hydrates it with `hydrateStaticState(staticState)`, and ignores a hydration that a newer static state superseded; its `staticState` prop is typed from its own definition, so passing the static state of another definition is a compile-time error.

#### Provider props

The provider takes the static state and an optional `onHydrationError` callback; the navigator context and the access token travel in the static state.

**Headless Version 3**

```tsx
<ListingProvider staticState={staticState} navigatorContext={navigatorContext.marshal}>
  <ProductList />
</ListingProvider>
```

**Headless Version 4**

```tsx
<ListingProvider staticState={staticState} onHydrationError={(error) => console.error(error)}>
  <ProductList />
</ListingProvider>
```

Pass `accessToken` to `fetchStaticState()` instead of the provider; without `onHydrationError`, a failed hydration is thrown during render and reaches the nearest React error boundary instead of leaving the page static.

#### Hydration status

`useHydration()` reports whether the components render the static state, the hydrated engine or a hydration error.

**Headless Version 3**

```tsx
const {state, methods} = useParameterManager();

useEffect(() => {
  if (methods === undefined) {
    return;
  }
  // ...synchronize the URL with the parameters
}, [methods, state.parameters]);
```

**Headless Version 4**

```tsx
const {status, error} = useHydration();

if (status === 'error') {
  console.error(error);
}
```

`status` is `static` before hydration, `hydrated` once the engine is live, and `error` when the hydration failed and `onHydrationError` handled it; `methods` and `useEngine()` still return `undefined` before hydration, so `methods?.submit()` keeps working.

#### Recommendations

A page requests its recommendation slots through its own `fetchStaticState()` call, so the nested recommendation provider goes away.

**Headless Version 3**

```tsx
<ListingProvider staticState={staticState} navigatorContext={navigatorContext.marshal}>
  <ProductList />
  <RecommendationProvider staticState={recsStaticState} navigatorContext={navigatorContext.marshal}>
    <PopularBought />
    <PopularViewed />
  </RecommendationProvider>
</ListingProvider>
```

**Headless Version 4**

```tsx
<ListingProvider staticState={staticState}>
  <ProductList />
  <PopularBought />
  <PopularViewed />
</ListingProvider>
```

Pass `recommendations: ['popularBought', 'popularViewed']` to the listing definition's `fetchStaticState()`; the recommendation hooks work inside any provider, and `useEngine()` returns the one engine of the page.

#### Commerce context hook

<!-- decided 2026-10-21, not yet built -->

The hook of the built-in commerce `context` controller is renamed `useCommerceContext`.

**Headless Version 3**

```tsx
const {useCart, useContext} = engineDefinition.controllers;

export default function Cart() {
  const {state, methods} = useCart();
  const {state: contextState} = useContext();
  // ...
}
```

**Headless Version 4**

```tsx
const {useCart, useCommerceContext} = engineDefinition.controllers;

export default function Cart() {
  const {state, methods} = useCart();
  const {state: contextState} = useCommerceContext();
  // ...
}
```

Rename the hook where you destructure it; it no longer shadows React's own `useContext`.

## Removals

<!-- TODO: KIT-6388 -->

Removals outside server-side rendering will be listed here.

### Server-side rendering

| Removed                                                                                       | Replacement                                                                                                                                    |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `StaticStateProvider` and `HydratedStateProvider` on the search and commerce definitions      | The provider built with `buildProviderWithDefinition(definition)`                                                                              |
| `setNavigatorContextProvider()`                                                               | `navigatorContext` option of `fetchStaticState()`                                                                                              |
| `navigatorContext` and `accessToken` props of the commerce provider                           | None: the static state carries both to `hydrateStaticState()`                                                                                  |
| `recommendationEngineDefinition` and its provider                                             | `recommendations` option of the page's `fetchStaticState()`; the page's provider                                                               |
| `useContext`                                                                                  | `useCommerceContext` <!-- decided 2026-10-21, not yet built -->                                                                                |
| The `use<Name>` hook of a `searchParameterManager: defineSearchParameterManager()` controller | `useParameterManager`, from the `parameterManager` controller that every search definition includes <!-- decided 2026-10-21, not yet built --> |
