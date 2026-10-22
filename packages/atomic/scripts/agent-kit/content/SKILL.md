---
name: coveo-atomic
description: Builds Coveo search, commerce, recommendation and insight interfaces with the @coveo/atomic web components ({{version}}). Use when writing, reviewing or fixing HTML, React or Angular markup that uses atomic-* elements, or when the user mentions Coveo Atomic, a Coveo search page or a Coveo commerce page.
license: Apache-2.0
metadata:
  author: coveo
  version: '{{version}}'
---

# Coveo Atomic

Atomic is a library of {{componentCount}} web components (`atomic-*` custom elements) that render Coveo search, commerce, recommendation and insight experiences. A page declares its markup in HTML; the components query the Coveo platform and manage state through the interface element that wraps them.

{{areas}}

Each area page, `references/<area>.md`, has the page skeleton and the list of its components. Each component page, `references/components/<tag>.md`, has the usage snippets, the attributes, the slots and the CSS parts. Read the area page before writing markup, and the component page before adding an attribute.

## Load the library

From npm:

```js
import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';

defineCustomElements();
```

From the CDN:

```html
<script type="module" src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js"></script>
<link rel="stylesheet" href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css" />
```

## Initialize the interface, then run the first query

Every page has exactly one interface element around all the other components: `atomic-search-interface`, `atomic-commerce-interface`, `atomic-recs-interface`, `atomic-insight-interface`, or `atomic-commerce-recommendation-interface` for product recommendations. Nothing renders until the interface is initialized and the first query runs.

```js
const searchInterface = document.querySelector('atomic-search-interface');
await customElements.whenDefined('atomic-search-interface');
await searchInterface.initialize({organizationId: 'my-org-id', accessToken: 'my-access-token'});
searchInterface.executeFirstSearch();
```

`initialize` takes an organization id and an access token (an API key or a search token). The commerce interface also needs `analytics: {trackingId}` (the tracking id of the commerce configuration) and a `context` (`language`, `country`, `currency` and `view.url`), and its first query is `executeFirstRequest()`. `atomic-recs-interface` runs `getRecommendations()`, and `atomic-insight-interface` also needs an `insightId`.

To share a Headless engine between interfaces, pass it to `initializeWithSearchEngine(engine)` (search), `initializeWithEngine(engine)` (commerce), `initializeWithRecommendationEngine(engine)` (recommendations) or `initializeWithInsightEngine(engine)` (insight) instead. `atomic-commerce-recommendation-interface` has no `initialize`: it only takes a commerce engine through `initializeWithEngine(engine)`.

## Rules the components enforce

1. An item template (`atomic-result-template`, `atomic-product-template`, `atomic-recs-result-template`, `atomic-insight-result-template` and the children templates) must contain a `<template>` element, and the item markup goes inside it. The component renders an error without one, and the children templates also reject an empty `<template>`.
2. An item template must be a direct child of its list: `atomic-result-template` goes in `atomic-result-list`, `atomic-folded-result-list` or `atomic-search-box-instant-results`; `atomic-product-template` goes in `atomic-commerce-product-list`, `atomic-commerce-recommendation-list` or `atomic-commerce-search-box-instant-products`.
3. A `<template>` should use either section components (`atomic-result-section-*`, `atomic-product-section-*`) or plain elements, not both. A `<script>` inside it is ignored, with a console warning.
4. The components that render one field of an item (`atomic-result-text`, `atomic-result-link`, `atomic-field-condition`, `atomic-product-price`, `atomic-product-field-condition`, ...) only work inside the `<template>` of an item template. Search components (`atomic-result-*`) and commerce components (`atomic-product-*`) never share an interface.
5. Attribute names are kebab-case (`display-values-as`, not `displayValuesAs`). A boolean attribute is true when present (`is-collapsed`); omit it for false. Only use the attributes listed on the component page; an unknown attribute is silently ignored.
6. `atomic-layout-section` takes one of these `section` values: `search`, `facets`, `main`, `status`, `results`, `horizontal-facets`, `products`, `pagination`. `main` contains `status`, `results` (or `products`) and `pagination`.

## Check the result

Open the page. A template or placement mistake renders an `atomic-component-error` in place of the component and logs the reason in the browser console. No results usually means the interface was not initialized or the first query never ran.

## Frameworks

- React: `@coveo/atomic-react` exports one component per element (`AtomicSearchInterface`, `AtomicFacet`, `AtomicResultList`, ...). A list takes its item template as a `template` function that returns JSX, instead of a `<template>` element.
- Angular: `@coveo/atomic-angular` exports `AtomicAngularModule`; the elements, attributes and rules above are the same.

## More

- Documentation: https://docs.coveo.com/en/atomic/latest/
- The component pages are generated from the library's custom elements manifest, so they match this version of `@coveo/atomic`.
