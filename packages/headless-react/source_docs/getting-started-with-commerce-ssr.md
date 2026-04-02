---
title: Getting Started with Commerce SSR
group: Getting Started
slug: getting-started/commerce-ssr
---

# Getting started with Commerce SSR

This guide walks through setting up a server-side rendered commerce storefront using `@coveo/headless-react/ssr-commerce`.

> [!NOTE]
>
> Commerce SSR utilities are currently in Open Beta.

## Prerequisites

Before getting started, make sure that:

- You have a working knowledge of [React](https://react.dev/) and a React-based framework such as [Next.js](https://nextjs.org/).
- You're familiar with Coveo Headless engines and controllers.
  You can refer to the [Headless usage documentation](https://docs.coveo.com/en/headless/latest/reference/documents/usage/index.html) for an introduction.
- You have Node.js version 20 or later installed.

## Install

Use [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install the package along with its peer dependencies:

```
npm install @coveo/headless-react @coveo/headless react react-dom
```

> [!NOTE]
>
> `@coveo/headless-react` requires React 18 or later.
> If you use TypeScript, note that Headless doesn't support the `classic` or `node10`/`node` `moduleResolution` options.

## Core concepts

The SSR utilities revolve around three core concepts:

1. **Engine definition** — A configuration object that specifies the engine settings and the set of controllers your application needs.
   It provides methods to fetch the static state and to generate the hydrated state.

2. **Static state** — The initial state of the application, generated on the server.
   It contains the data needed for the first render (for example, initial product listings) without interactivity.

3. **Hydrated state** — The state after client-side hydration.
   It contains live Headless controllers with methods you can call to add interactivity, as well as the Headless engine instance itself.

## Define the commerce engine

Create and export an engine definition in a shared file.
Include the controllers and the commerce engine configuration:

```ts
// lib/commerce-engine.ts

import {
  defineCommerceEngine,
  defineSummary,
  defineProductList,
  defineCart,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless-react/ssr-commerce';

export const engineDefinition = defineCommerceEngine({
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList(),
    cart: defineCart(),
  },
});

export const {useSummary, useProductList, useCart} =
  engineDefinition.controllers;
```

The commerce engine definition provides four solution-type definitions that you can use depending on the page type:

- `engineDefinition.listingEngineDefinition` — For product listing pages.
- `engineDefinition.searchEngineDefinition` — For search result pages.
- `engineDefinition.standaloneEngineDefinition` — For standalone components (for example, a standalone search box).
- `engineDefinition.recommendationEngineDefinition` — For recommendation widgets.

## Build components with hooks

Each controller defined in the engine definition automatically generates a corresponding React hook.
The hook is named after the controller key, capitalized and prefixed with `use` (for example, `productList` → `useProductList`).

> [!IMPORTANT]
>
> If you're using Next.js with the [App Router](https://nextjs.org/docs/app), any file which uses these hooks must begin with the `'use client'` directive.

```tsx
'use client';

import {useProductList, useCart} from '../lib/commerce-engine';

export function ProductList() {
  const {state, methods} = useProductList();
  const {methods: cartMethods} = useCart();

  return (
    <ul>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <span>{product.ec_name}</span>
          <button
            onClick={() =>
              cartMethods?.updateItemQuantity({
                productId: product.ec_product_id!,
                name: product.ec_name!,
                price: product.ec_price!,
                quantity: 1,
              })
            }
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
```

> [!NOTE]
>
> The `methods` property is `undefined` when rendering with the `StaticStateProvider` (that is, on the server).
> Always use optional chaining (`cartMethods?.updateItemQuantity(...)`) or guard against `undefined` before calling methods.

## Wire up SSR with the provider builder

The commerce engine definition provides `buildProviderWithDefinition`, a utility that creates a provider component handling the static-to-hydrated state transition for you:

```tsx
import {buildProviderWithDefinition} from '@coveo/headless-react/ssr-commerce';
import {engineDefinition} from '../lib/commerce-engine';

export const ListingProvider = buildProviderWithDefinition(
  engineDefinition.listingEngineDefinition
);
```

You can then use this provider in your server-rendered page to wrap your components:

```tsx
import {engineDefinition} from '../lib/commerce-engine';
import {ListingProvider} from '../components/ListingProvider';
import {ProductList} from '../components/ProductList';

const {listingEngineDefinition} = engineDefinition;

export default async function ListingPage() {
  const staticState = await listingEngineDefinition.fetchStaticState();

  return (
    <ListingProvider staticState={staticState}>
      <ProductList />
    </ListingProvider>
  );
}
```

## Samples

- [Commerce SSR with Next.js](https://github.com/coveo/ui-kit/tree/main/samples/headless-ssr/commerce-nextjs) — Demonstrates `@coveo/headless-react/ssr-commerce` with Next.js.
- [Commerce SSR with React Router](https://github.com/coveo/ui-kit/tree/main/samples/headless-ssr/commerce-react-router) — Demonstrates `@coveo/headless-react` with React Router 7.

## What's next?

- [Commerce SSR documentation](https://docs.coveo.com/en/obif0156/) — Advanced commerce SSR topics such as product listing pages, recommendations, and facets.
- [Commerce controller hooks](../Commerce_Controller_hooks.html) — Detailed reference for all available commerce controller hooks.
