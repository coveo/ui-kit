---
title: Getting Started with Commerce
group: Getting Started
slug: getting-started/getting-started-commerce
---

# Getting Started with Commerce

The Commerce engine powers commerce-specific search, product listing, and recommendation experiences.
This guide walks you through installing and verifying a minimal Commerce setup.

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the Commerce sub-package:

```typescript
import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
```

## Use via CDN

If you prefer not to use a package manager, you can load the Commerce bundle directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    buildCommerceEngine,
    getSampleCommerceEngineConfiguration,
  } from 'https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/commerce/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadlessCommerce object.
  const {buildCommerceEngine, getSampleCommerceEngineConfiguration} =
    CoveoHeadlessCommerce;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example builds a commerce engine using the built-in sample configuration, executes a search, and logs the results.
This is the quickest way to confirm that the Commerce bundle is installed and working correctly.

### In a Module Bundler or Node.js Project

```typescript
import {
  buildCommerceEngine,
  buildSearch,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';

const engine = buildCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
});

const search = buildSearch(engine);

search.subscribe(() => {
  const {products} = search.state;
  if (products.length) {
    console.log(`Received ${products.length} products.`);
    console.log('First product:', products[0].ec_name);
  }
});

search.executeFirstSearch();
```

### In an HTML Page (CDN)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Headless Commerce Getting Started</title>
  </head>
  <body>
    <h1>Commerce Quick Start</h1>
    <ul id="results"></ul>

    <script type="module">
      import {
        buildCommerceEngine,
        buildSearch,
        getSampleCommerceEngineConfiguration,
      } from 'https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js';

      const engine = buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      });

      const search = buildSearch(engine);
      const list = document.getElementById('results');

      search.subscribe(() => {
        const {products} = search.state;
        list.textContent = '';
        products.forEach((p) => {
          const item = document.createElement('li');
          item.textContent = p.ec_name;
          list.appendChild(item);
        });
      });

      search.executeFirstSearch();
    </script>
  </body>
</html>
```

If the installation is working, you should see a list of product names rendered on the page (or logged in your console).

## Next Steps

Now that the Commerce engine is installed and running, explore the following resources:

- [Usage](../usage/index.html) — Learn about engines, controllers, and state management.
- [Headless Commerce with React](https://github.com/coveo/ui-kit/tree/main/samples/headless/commerce-react) — A complete commerce interface built with Headless and React.
- [Headless commerce usage (client-side rendering)](https://docs.coveo.com/en/o6r70022) — A complete guide to create a Coveo commerce search interface with Headless.
