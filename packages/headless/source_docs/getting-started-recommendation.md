---
title: Getting Started with Recommendation
group: Getting Started
slug: getting-started/getting-started-recommendation
---

# Getting Started with Recommendation

The Recommendation engine powers content recommendation interfaces that suggest relevant items to users based on their behavior and context.

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the recommendation sub-package:

```typescript
import {
  buildRecommendationEngine,
  getSampleRecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
```

## Use via CDN

If you prefer not to use a package manager, you can load Headless Recommendation directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    buildRecommendationEngine,
    getSampleRecommendationEngineConfiguration,
  } from 'https://static.cloud.coveo.com/headless/v3/recommendation/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/recommendation/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadlessRecommendation object.
  const {
    buildRecommendationEngine,
    getSampleRecommendationEngineConfiguration,
  } = CoveoHeadlessRecommendation;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example builds a recommendation engine using the built-in sample configuration, fetches recommendations, and logs the results.
This is the quickest way to confirm that Headless Recommendation is installed and working correctly.

### In a Module Bundler or Node.js Project

```typescript
import {
  buildRecommendationEngine,
  buildRecommendationList,
  getSampleRecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';

const engine = buildRecommendationEngine({
  configuration: getSampleRecommendationEngineConfiguration(),
});

const recommendationList = buildRecommendationList(engine);

recommendationList.subscribe(() => {
  const {recommendations} = recommendationList.state;
  if (recommendations.length) {
    console.log(`Received ${recommendations.length} recommendations.`);
    console.log('First recommendation:', recommendations[0].title);
  }
});

recommendationList.refresh();
```

### In an HTML Page (CDN)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Headless Recommendation Getting Started</title>
  </head>
  <body>
    <h1>Recommendation Quick Start</h1>
    <ul id="recommendations"></ul>

    <script type="module">
      import {
        buildRecommendationEngine,
        buildRecommendationList,
        getSampleRecommendationEngineConfiguration,
      } from 'https://static.cloud.coveo.com/headless/v3/recommendation/headless.esm.js';

      const engine = buildRecommendationEngine({
        configuration: getSampleRecommendationEngineConfiguration(),
      });

      const recommendationList = buildRecommendationList(engine);
      const list = document.getElementById('recommendations');

      recommendationList.subscribe(() => {
        const {recommendations} = recommendationList.state;
        list.innerHTML = '';
        recommendations.forEach((r) => {
          const item = document.createElement('li');
          item.textContent = r.title;
          list.appendChild(item);
        });
      });

      recommendationList.refresh();
    </script>
  </body>
</html>
```

If the installation is working, you should see a list of recommended item titles rendered on the page (or logged in your console).

## Next Steps

Now that Headless Recommendation is installed and running, explore the following resources:

- [Usage](../usage/index.html) — Learn about engines, controllers, and state management.
