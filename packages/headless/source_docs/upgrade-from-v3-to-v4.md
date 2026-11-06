---
title: v3 to v4
group: Guides
category: Upgrade
slug: upgrade/v3-to-v4
---

# Upgrade from v3 to v4

[Headless](https://docs.coveo.com/en/lcdf0493/) v4 ships one server-side rendering (SSR) API and removes the members that v3 deprecated.

> [!IMPORTANT]
>
> The following are breaking changes from Headless v3 to v4.

## Requirements

<!-- TODO: KIT-6388 -->

The minimum Node.js and TypeScript versions for v4 will be listed here.

## Modified behaviors

<!-- TODO: KIT-6388 -->

Modified behaviors outside server-side rendering will be listed here.

### Server-side rendering

The `@coveo/headless/ssr` and `@coveo/headless/ssr-commerce` sub-packages keep their paths, but the API behind them is new.
You pass the facts of the page (navigator context, context, cart, search parameters, access token, recommendation slots) to `fetchStaticState()`, and you pass the static state it returns, as is, to `hydrateStaticState()`.

| Topic              | Headless v3                                                                          | Headless v4                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine definitions | `defineSearchEngine()` returns one definition; `defineCommerceEngine()` returns four | `defineSearchEngine()` returns `searchEngineDefinition` and `standaloneEngineDefinition`; `defineCommerceEngine()` returns `listingEngineDefinition`, `searchEngineDefinition` and `standaloneEngineDefinition` |
| Navigator context  | `setNavigatorContextProvider()` on the shared definition                             | `navigatorContext` option of `fetchStaticState()`, built with `buildNavigatorContext()`                                                                                                                         |
| Page inputs        | `controllers` props map and `configuration.context`                                  | `context`, `cart`, `searchParams` and `accessToken` options of `fetchStaticState()`                                                                                                                             |
| Hydration          | `hydrateStaticState({searchAction, controllers})`                                    | `hydrateStaticState(staticState)`                                                                                                                                                                               |
| Recommendations    | `recommendationEngineDefinition` with an `enabled` prop per slot                     | `recommendations` and `productId` options on any definition                                                                                                                                                     |
| Controller props   | Per request, through `controllers`                                                   | Static options in the definers; page facts in `fetchStaticState()` <!-- decided 2026-10-21, not yet built -->                                                                                                   |
| `enableResults`    | On each definer                                                                      | Once, on the engine definition <!-- decided 2026-10-21, not yet built -->                                                                                                                                       |

#### Sub-package paths

<!-- decided 2026-10-21, not yet built -->

The v3 API of `/ssr` and `/ssr-commerce` is removed, and the API that v3 shipped as a preview is published under the same paths, so your imports still resolve but the members behind them change.

**Headless Version 3**

```ts
import {defineSearchEngine} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine(config);

export const {fetchStaticState, hydrateStaticState, setNavigatorContextProvider} = engineDefinition;
```

**Headless Version 4**

```ts
import {defineSearchEngine} from '@coveo/headless/ssr';

export const {searchEngineDefinition, standaloneEngineDefinition} = defineSearchEngine(config);
```

Keep your import paths and apply the changes below; the TypeScript compiler reports every member that no longer exists.

#### Engine definitions

`defineSearchEngine()` returns a search definition and a standalone definition, and `defineCommerceEngine()` no longer returns `recommendationEngineDefinition`.

**Headless Version 3**

```ts
import {defineCommerceEngine} from '@coveo/headless/ssr-commerce';

const engineDefinition = defineCommerceEngine(engineConfig);

export const {
  listingEngineDefinition,
  searchEngineDefinition,
  recommendationEngineDefinition,
  standaloneEngineDefinition,
} = engineDefinition;
```

**Headless Version 4**

```ts
import {defineCommerceEngine} from '@coveo/headless/ssr-commerce';

export const {listingEngineDefinition, searchEngineDefinition, standaloneEngineDefinition} =
  defineCommerceEngine(engineConfig);
```

Each definition exposes `fetchStaticState()` and `hydrateStaticState()` only.
Use `standaloneEngineDefinition` for pages that run no search or listing request on the server, such as a home page with a search box, a cart page or a product page.

#### Navigator context

The navigator context is passed to `fetchStaticState()` on every request, and `buildNavigatorContext()` builds it from the request headers.

**Headless Version 3**

```ts
import {headers} from 'next/headers';
import {fetchStaticState, setNavigatorContextProvider} from '../../lib/generic/engine';
import {NextJsAppRouterNavigatorContext} from '../../navigatorContextProvider';

const navigatorContext = new NextJsAppRouterNavigatorContext(await headers());

setNavigatorContextProvider(() => navigatorContext);

const staticState = await fetchStaticState({
  controllers: {
    searchParameterManager: {initialState: {parameters: searchParameters}},
  },
});
```

**Headless Version 4**

```ts
// proxy.ts: read or mint the client ID, store it in the `coveo_visitorId` cookie
// (`CLIENT_ID_COOKIE_NAME`) and forward it with the page URL as request headers
const clientId = request.cookies.get('coveo_visitorId')?.value ?? crypto.randomUUID();
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-coveo-client-id', clientId);
requestHeaders.set('x-href', request.nextUrl.href);
const response = NextResponse.next({request: {headers: requestHeaders}});
response.cookies.set('coveo_visitorId', clientId, {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
});

// app/search/page.tsx
import {buildNavigatorContext} from '@coveo/headless/ssr';
import {headers} from 'next/headers';
import {searchEngineDefinition} from '../../lib/engine';

const requestHeaders = await headers();
const navigatorContext = buildNavigatorContext({
  headers: requestHeaders,
  location: requestHeaders.get('x-href'),
  clientId: requestHeaders.get('x-coveo-client-id'),
});

const staticState = await searchEngineDefinition.fetchStaticState({
  navigatorContext,
  searchParams: searchParameters,
});
```

`buildNavigatorContext()` reads the referrer, the user agent and the `x-forwarded-for` header, and generates a client ID when none is given.
Store that client ID in the `coveo_visitorId` cookie (exported as `CLIENT_ID_COOKIE_NAME`): your server reads the cookie on each request and sets it on the response, and the browser reports the same visitor after hydration.
The static state carries the navigator context to `hydrateStaticState()`, without `forwardedFor`, so you set it once per request.

#### Page inputs

`context`, `cart`, `searchParams` and `accessToken` are options of `fetchStaticState()`, not controller props or engine configuration, and `context.view.url` defaults to the page URL of the navigator context.

**Headless Version 3**

```ts
const staticState = await searchEngineDefinition.fetchStaticState({
  navigatorContext,
  controllers: {
    cart: {initialState: {items: getCartItems(req)}},
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {url: 'https://sports.barca.group/search'},
    },
    parameterManager: {initialState: {parameters: deserializeParameters(req)}},
  },
});
```

**Headless Version 4**

```ts
const staticState = await searchEngineDefinition.fetchStaticState({
  navigatorContext,
  context: {language: 'en', country: 'US', currency: 'USD'},
  cart: {items: getCartItems(req)},
  searchParams: deserializeParameters(req),
  accessToken: userToken, // optional, for this request only
});
```

Set `context.view.url` only when your merchandising configuration targets another URL than the page being rendered.
For search, `searchParams` replaces the `searchParameterManager` props, since every search definition includes a `parameterManager` controller.
The per-request `accessToken` overrides the configured token for that request, on search and commerce alike, and the static state carries it to `hydrateStaticState()`, so use a scoped search token rather than an API key.
The commerce `configuration.context` and the `setAccessToken()` and `getAccessToken()` methods are removed; configure `renewAccessToken` to rotate a token.

#### Hydration

`hydrateStaticState()` takes the static state returned by `fetchStaticState()` as is, and a mismatch fails with a named error.

**Headless Version 3**

```ts
listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

const {engine, controllers} = await listingEngineDefinition.hydrateStaticState({
  searchActions: staticState.searchActions,
  controllers: {
    cart: {initialState: {items: staticState.controllers.cart.state.items}},
    context: staticState.controllers.context.state,
    parameterManager: {
      initialState: {parameters: staticState.controllers.parameterManager.state.parameters},
    },
  },
});
```

**Headless Version 4**

```ts
const {engine, controllers} = await listingEngineDefinition.hydrateStaticState(staticState);
```

The static state carries `searchActions` (an array, on search too), the controller states and the page facts, and the commerce static state also carries the `solutionType` of the definition that fetched it.
Mistakes fail early, with these errors:

| Error                                   | Thrown when                                                                                               |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `SolutionTypeMismatchError`             | A static state is hydrated with another commerce definition than the one that fetched it.                 |
| `MultipleRecommendationError`           | Two `defineRecommendations()` controllers target the same `slotId`, at define time.                       |
| `Error` naming the reserved controllers | A controller is named `parameterManager` (search), or `context`, `cart` or `parameterManager` (commerce). |
| `Error` naming the engine definition    | An option of `fetchStaticState()` fails validation, for example an unknown recommendation name.           |
| `Error` asking for the page URL         | Neither `context.view.url` nor `navigatorContext.location` is set (commerce).                             |

#### Recommendations

Recommendation slots are requested through the `recommendations` option of any definition and seeded with `productId`, and `recommendationEngineDefinition` is removed.

**Headless Version 3**

```ts
const staticState = await listingEngineDefinition.fetchStaticState({
  navigatorContext: navigatorContext.marshal,
  controllers: {
    cart: {initialState: {items}},
    context: {/* ...language, country, currency, view */},
    parameterManager: {initialState: {parameters}},
  },
});

const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
  navigatorContext: navigatorContext.marshal,
  controllers: {
    popularBought: {enabled: true},
    popularViewed: {enabled: true},
    cart: {initialState: {items}},
    context: {/* ...language, country, currency, view */},
  },
});
```

**Headless Version 4**

```ts
// Listing page: one request for the listing and its two slots
const staticState = await listingEngineDefinition.fetchStaticState({
  navigatorContext,
  context,
  cart: {items},
  searchParams: parameters,
  recommendations: ['popularBought', 'popularViewed'],
});

// Product page: the product ID seeds the slot
const productState = await standaloneEngineDefinition.fetchStaticState({
  navigatorContext,
  context,
  cart: {items},
  recommendations: ['viewedTogether'],
  productId,
});
```

`recommendations` is typed from the names you gave to `defineRecommendations()`, slots that aren't listed keep an empty state until you refresh them in the browser, and a page that only shows recommendations uses `standaloneEngineDefinition`.

#### Controller props

<!-- decided 2026-10-21, not yet built -->

Definers take static options only, page facts go to `fetchStaticState()`, and the per-request `controllers` map is removed.

**Headless Version 3**

```ts
import {defineCommerceEngine, defineProductEnrichment} from '@coveo/headless/ssr-commerce';

const {standaloneEngineDefinition} = defineCommerceEngine({
  configuration,
  controllers: {productEnrichment: defineProductEnrichment()},
});

const staticState = await standaloneEngineDefinition.fetchStaticState({
  navigatorContext,
  controllers: {
    productEnrichment: {options: {productId, placementIds: ['<PLACEMENT_ID>']}},
    // ...rest of the page inputs
  },
});
```

**Headless Version 4**

```ts
import {defineCommerceEngine, defineProductEnrichment} from '@coveo/headless/ssr-commerce';

const {standaloneEngineDefinition} = defineCommerceEngine({
  configuration,
  controllers: {
    productEnrichment: defineProductEnrichment({options: {placementIds: ['<PLACEMENT_ID>']}}),
  },
});

const staticState = await standaloneEngineDefinition.fetchStaticState({
  navigatorContext,
  context,
  productId,
});
```

Move the static options of each controller into its definer and pass the product being viewed once, through `productId`; the static state carries the page facts, so there's nothing to re-wire on the client.

#### Search context

<!-- decided 2026-10-21, not yet built -->

Every search definition includes a `context` controller, fed by a top-level `context` option of `fetchStaticState()`.

**Headless Version 3**

```ts
import {defineContext, defineSearchEngine, defineSearchParameterManager} from '@coveo/headless/ssr';

const {fetchStaticState} = defineSearchEngine({
  configuration,
  controllers: {
    context: defineContext(),
    searchParameterManager: defineSearchParameterManager(),
    // ...rest of the controllers
  },
});

const staticState = await fetchStaticState({
  controllers: {
    context: {initialState: {values: {ageGroup: '30-45', mainInterest: 'sports'}}},
    searchParameterManager: {initialState: {parameters: searchParameters}},
  },
});
```

**Headless Version 4**

```ts
import {defineSearchEngine} from '@coveo/headless/ssr';

const {searchEngineDefinition} = defineSearchEngine({
  configuration,
  controllers: {
    // ...rest of the controllers
  },
});

const staticState = await searchEngineDefinition.fetchStaticState({
  navigatorContext,
  searchParams: searchParameters,
  context: {ageGroup: '30-45', mainInterest: 'sports'},
});
```

Remove `context: defineContext()` and `searchParameterManager: defineSearchParameterManager()` from your definition: `context` and `parameterManager` are reserved names, and the matching controllers are built from the `context` and `searchParams` options.

#### `enableResults`

<!-- decided 2026-10-21, not yet built -->

`enableResults` is set once on the commerce engine definition, as a boolean or per solution type, instead of on each definer.

**Headless Version 3**

```ts
export default {
  configuration: {...getSampleCommerceEngineConfiguration()},
  controllers: {
    productList: defineProductList({enableResults: true}),
    searchBox: defineSearchBox({options: {enableResults: true}}),
    didYouMean: defineDidYouMean(),
  },
} satisfies CommerceEngineDefinitionOptions;
```

**Headless Version 4**

```ts
export default {
  configuration: {...getSampleCommerceEngineConfiguration()},
  enableResults: {search: true, listing: true},
  controllers: {
    productList: defineProductList(),
    searchBox: defineSearchBox(),
    didYouMean: defineDidYouMean(),
  },
} satisfies CommerceEngineDefinitionOptions;
```

The flag applies to every request of the matching solution type, so `state.results` (products and spotlight content) is populated the same way whichever controller triggers the request; pass `true` to enable it for search and listing pages alike.

## Removals

<!-- TODO: KIT-6388 -->

Removals outside server-side rendering will be listed here.

### Server-side rendering

| Removed                                                                                                                                                                                                                                                                                      | Replacement                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setNavigatorContextProvider()` and the `navigatorContextProvider` engine option                                                                                                                                                                                                             | `navigatorContext` option of `fetchStaticState()`, built with `buildNavigatorContext()`; the static state carries it to `hydrateStaticState()`                                                                       |
| `build()`, its `extend` option, `fromBuildResult`, and the `Build`, `BuildOptions`, `FromBuildResult`, `FromBuildResultOptions`, `InferBuildResult` and `EngineDefinitionBuildResult` types                                                                                                  | `fetchStaticState()` and `hydrateStaticState()`; customize requests with definer options, `searchParams`, and `middlewares` or `preprocessRequest` in the configuration                                              |
| `getAccessToken()` and `setAccessToken()`                                                                                                                                                                                                                                                    | `accessToken` option of `fetchStaticState()`; `renewAccessToken` in the configuration to rotate an expiring token                                                                                                    |
| `recommendationEngineDefinition`, `SolutionType.recommendation` and the `enabled` prop of recommendation controllers                                                                                                                                                                         | `recommendations` and `productId` options of the listing, search and standalone definitions                                                                                                                          |
| `configuration.context` of the commerce engine definition                                                                                                                                                                                                                                    | `context` option of `fetchStaticState()`                                                                                                                                                                             |
| `searchAction` in the search static state                                                                                                                                                                                                                                                    | `searchActions`                                                                                                                                                                                                      |
| `listing` and `search` options of the commerce definers                                                                                                                                                                                                                                      | None: controllers are built for both search and listing pages                                                                                                                                                        |
| `EngineDefinition`, `EngineDefinitionOptions`, `OptionsTuple`, `Kind` and `ControllerWithKind`                                                                                                                                                                                               | `SearchEngineDefinition`, `CommerceEngineDefinition`, `SearchEngineDefinitionOptions` and `CommerceEngineDefinitionOptions`; `InferStaticState<typeof definition>` for the static state                              |
| `defineCart()`, `defineContext()` and `defineParameterManager()` (commerce)                                                                                                                                                                                                                  | None: the `cart`, `context` and `parameterManager` controllers are included in every commerce definition and fed by the `cart`, `context` and `searchParams` options <!-- decided 2026-10-21, not yet built -->      |
| `defineContext()`, `defineSearchParameterManager()` and `defineUrlManager()` (search)                                                                                                                                                                                                        | None: the `context` and `parameterManager` controllers are included in every search definition and fed by the `context` and `searchParams` options <!-- decided 2026-10-21, not yet built -->                        |
| The `controllers` option of `fetchStaticState()`, `buildWithProps()` and the `...WithProps` definition types, `InferControllerPropsMapFromDefinitions`, `ControllersPropsMap`, `EngineDefinitionControllersPropsOption`, `MissingControllerProps`, and `controllerProps` in the static state | Static options in the definers; page facts (`navigatorContext`, `accessToken`, `context`, `cart`, `searchParams`, `productId`, `recommendations`) in `fetchStaticState()` <!-- decided 2026-10-21, not yet built --> |
| `enableResults` on `defineProductList()`, `defineSearchBox()`, `defineDidYouMean()` and `defineRecentQueriesList()`                                                                                                                                                                          | `enableResults` on the engine definition <!-- decided 2026-10-21, not yet built -->                                                                                                                                  |
