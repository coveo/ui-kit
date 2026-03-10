---
title: Getting Started with SSR Search
group: Getting Started
slug: getting-started/getting-started-ssr-search
---
# Getting Started with SSR Search

> [!NOTE]
>
> If you are using a React framework, use [`@coveo/headless-react`](https://docs.coveo.com/en/headless-react/latest/reference/index.html) instead.
> It provides React-specific SSR utilities (hooks, context providers, and hydration helpers) built on top of `@coveo/headless`.

The SSR Search engine enables server-side rendering of search interfaces.

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the SSR sub-path in your project:

```typescript
import { 
    defineSearchEngine, 
    getSampleSearchEngineConfiguration 
} from '@coveo/headless/ssr';
```

## Use via CDN

If you prefer not to use a package manager, you can load Headless SSR directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    defineSearchEngine,
    getSampleSearchEngineConfiguration,
  } from 'https://static.cloud.coveo.com/headless/v3/ssr/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/ssr/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadlessSSR object.
  const { defineSearchEngine, getSampleSearchEngineConfiguration } = CoveoHeadlessSSR;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example defines a search engine with a result list controller using the built-in sample configuration.

```typescript
import {
  defineSearchEngine,
  defineResultList,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
  controllers: {
    resultList: defineResultList(),
  },
});
```

> [!NOTE]
>
> SSR engines use a declarative `define*` pattern rather than the imperative `build*` pattern used in client-side Headless.
> See the [SSR usage documentation](../usage/server-side-rendering/index.html) for framework integration details.

## Next Steps

Now that Headless SSR is installed, explore the following resources:

- [SSR Usage](../usage/server-side-rendering/index.html) — Learn how to integrate SSR engine definitions with your framework.
