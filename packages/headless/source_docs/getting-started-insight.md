---
title: Getting Started with Insight
group: Getting Started
slug: getting-started/getting-started-insight
---
# Getting Started with Insight

The Insight engine powers search interfaces embedded within service agent consoles, helping agents find relevant information to resolve customer cases.

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the Insight sub-package:

```typescript
import { 
    buildInsightEngine, 
    getSampleInsightEngineConfiguration 
} from '@coveo/headless/insight';
```

## Use via CDN

If you prefer not to use a package manager, you can load Headless Insight directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    buildInsightEngine,
    getSampleInsightEngineConfiguration,
  } from 'https://static.cloud.coveo.com/headless/v3/insight/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/insight/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadlessInsight object.
  const { buildInsightEngine, getSampleInsightEngineConfiguration } = CoveoHeadlessInsight;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example builds an Insight engine using the built-in sample configuration, executes a search, and logs the number of results.

### In a Module Bundler or Node.js Project

```typescript
import {
  buildInsightEngine,
  buildResultList,
  getSampleInsightEngineConfiguration,
} from '@coveo/headless/insight';

const engine = buildInsightEngine({
  configuration: getSampleInsightEngineConfiguration(),
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
    <title>Headless Insight Getting Started</title>
  </head>
  <body>
    <h1>Insight Quick Start</h1>
    <ul id="results"></ul>

    <script type="module">
      import {
        buildInsightEngine,
        buildResultList,
        getSampleInsightEngineConfiguration,
      } from 'https://static.cloud.coveo.com/headless/v3/insight/headless.esm.js';

      const engine = buildInsightEngine({
        configuration: getSampleInsightEngineConfiguration(),
      });

      const resultList = buildResultList(engine);
      const list = document.getElementById('results');

      resultList.subscribe(() => {
        const { results } = resultList.state;
        list.innerHTML = '';
        results.forEach((r) => {
          const li = document.createElement('li');
          li.textContent = r.title;
          list.appendChild(li);
        });
      });

      engine.executeFirstSearch();
    </script>
  </body>
</html>
```

If the installation is working, you should see a list of result titles rendered on the page (or logged in your console).

## Next Steps

Now that the Insight engine is installed and running, explore the following resources:

- [Usage](../usage/index.html) — Learn about engines, controllers, and state management.
