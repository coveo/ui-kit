---
title: Getting Started with SSR Commerce
group: Getting Started
slug: getting-started/getting-started-ssr-commerce
---
# Getting Started with SSR Commerce

> [!NOTE]
>
> If you are using a React framework, use [`@coveo/headless-react`](https://docs.coveo.com/en/headless-react/latest/reference/index.html) instead.
> It provides React-specific SSR utilities (hooks, context providers, and hydration helpers) built on top of `@coveo/headless`.

The SSR Commerce engine enables server-side rendering of commerce interfaces — including product listing and search.

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the SSR Commerce sub-package:

```typescript
import {
  defineCommerceEngine,
  defineProductList,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce';
```

## Use via CDN

If you prefer not to use a package manager, you can load the SSR Commerce bundle directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    defineCommerceEngine,
    getSampleCommerceEngineConfiguration,
  } from 'https://static.cloud.coveo.com/headless/v3/ssr-commerce/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/ssr-commerce/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadlessCommerceSSR object.
  const { defineCommerceEngine, getSampleCommerceEngineConfiguration } =
    CoveoHeadlessCommerceSSR;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example defines a commerce engine with a product list controller.
SSR engines use a declarative definition pattern — you define the engine and its controllers up front, then use the definition to fetch static state on the server and hydrate on the client.

```typescript
import {
  defineCommerceEngine,
  defineProductList,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce';

const engineDefinition = defineCommerceEngine({
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://example.com/browse/products',
      },
    },
  },
  controllers: {
    productList: defineProductList(),
  },
});

export const {
  listingEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
} = engineDefinition;
```

> [!NOTE]
>
> The definition exposes `fetchStaticState` and `hydrateStaticState` methods for server/client rendering.
> See the [SSR usage docs](../usage/server-side-rendering/index.html) for framework integration details.

## Next Steps

Now that the SSR Commerce package is installed, explore the following resources:

- [SSR Usage](../usage/server-side-rendering/index.html) — Learn how to integrate SSR engine definitions with your framework.
- [SSR Commerce with Express](https://github.com/coveo/ui-kit/tree/main/samples/headless-ssr/commerce-express) — A framework-agnostic SSR commerce implementation with Express.
