---
title: Getting Started with Search
group: Getting Started
slug: getting-started/getting-started-search
---
# Getting Started with Search

This guide walks you through installing the Coveo Headless library and running a minimal example to confirm that everything is working.

## Prerequisites

Headless requires Node.js version 20.9.0 or later when used in a Node.js environment.

> [!NOTE]
>
> If you use TypeScript, note that Headless doesn't support the `classic` or `node10`/`node` `moduleResolution` options.
> See [TypeScript module resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution).

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the package in your project:

```typescript
import { 
    buildSearchEngine, 
    getSampleSearchEngineConfiguration
} from '@coveo/headless';
```

## Use via CDN

If you prefer not to use a package manager, you can load Headless directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    buildSearchEngine,
    getSampleSearchEngineConfiguration,
  } from 'https://static.cloud.coveo.com/headless/v3/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadless object.
  const { buildSearchEngine, getSampleSearchEngineConfiguration } = CoveoHeadless;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example builds a search engine using the built-in sample configuration, executes a search, and logs the number of results.
This is the quickest way to confirm that Headless is installed and working correctly.

### In a Module Bundler or Node.js Project

```typescript
import {
  buildSearchEngine,
  buildResultList,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';

const engine = buildSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
});

const resultList = buildResultList(engine);

resultList.subscribe(() => {
  const { results } = resultList.state;
  if (results.length) {
    console.log(`Received ${results.length} results.`);
    console.log('First result:', results[0].title);
  }
});

engine.executeFirstSearch();
```

### In an HTML Page (CDN)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Headless Getting Started</title>
  </head>
  <body>
    <h1>Headless Quick Start</h1>
    <ul id="results"></ul>

    <script type="module">
      import {
        buildSearchEngine,
        buildResultList,
        getSampleSearchEngineConfiguration,
      } from 'https://static.cloud.coveo.com/headless/v3/headless.esm.js';

      const engine = buildSearchEngine({
        configuration: getSampleSearchEngineConfiguration(),
      });

      const resultList = buildResultList(engine);
      const list = document.getElementById('results');

      resultList.subscribe(() => {
        const { results } = resultList.state;
        list.innerHTML = '';
        results.forEach((r) => {
          const item = document.createElement('li');
          item.textContent = r.title;
          list.appendChild(item);
        });
      });

      engine.executeFirstSearch();
    </script>
  </body>
</html>
```

If the installation is working, you should see a list of result titles rendered on the page (or logged in your console).

## Next Steps

Now that Headless is installed and running, explore the following resources:

- [Usage](../usage/index.html) — Learn about engines, controllers, and state management.
- [Code Samples](../code-samples.html) — See interactive examples using React and other frameworks.
- [Headless Search with React](https://github.com/coveo/ui-kit/tree/main/samples/headless/search-react) — A complete search interface built with Headless and React.
