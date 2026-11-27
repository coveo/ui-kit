# Upgrade from v3 to v4

[Atomic](https://docs.coveo.com/en/atomic/latest/) v4 removes the members that v3 deprecated. Each v3 deprecation logs a warning through the engine logger, which names the replacement, so you can find and fix your uses before you upgrade.

> [!IMPORTANT]
>
> The following are breaking changes from Atomic v3 to v4.

## Requirements

<!-- TODO: KIT-6388 -->

The minimum versions that Atomic v4 requires will be listed here.

## Modified behaviors

<!-- TODO: KIT-6388 -->

Modified behaviors will be listed here.

### Components

#### `error` on Atomic components <!-- KIT-6755 -->

The `error` property of every Atomic component that can receive an error is now typed `Error | undefined`, where `undefined` means that the component has no error, and a change to it re-renders the component.

**Atomic Version 3**

```ts
const facet = document.querySelector('atomic-facet')!;
console.error(facet.error.message);
```

**Atomic Version 4**

```ts
const facet = document.querySelector('atomic-facet')!;
if (facet.error) {
  console.error(facet.error.message);
}
```

Check that `error` is defined before you read it, and compare it with `undefined` rather than `null`.

#### Component errors that used to be swallowed <!-- KIT-6756 -->

These components received errors without displaying them, so an invalid configuration went unnoticed. They now replace their content with the error box and log the error, like the other Atomic components:

- `atomic-insight-result`
- `atomic-insight-result-quickview-action`
- `atomic-insight-user-actions-session`
- `atomic-insight-user-actions-timeline`
- `atomic-ipx-tab`
- `atomic-quickview`
- `atomic-recs-result`
- `atomic-result`

`atomic-tab-manager` now shows the error of an invalid `atomic-tab` child, and an `atomic-sort-expression` outside an `atomic-sort-dropdown` now holds its error in `error`. The timeframe facets are ready to display the error of an invalid `atomic-timeframe` child, which shows once `atomic-timeframe` validation becomes fatal.

**Atomic Version 3**

```html
<!-- Renders the quickview button and ignores the invalid sandbox. -->
<atomic-quickview sandbox="allow-scripts"></atomic-quickview>
```

**Atomic Version 4**

```html
<!-- Without allow-same-origin, the component shows the error box. -->
<atomic-quickview sandbox="allow-scripts allow-same-origin"></atomic-quickview>
```

Fix the configuration that the error in the console names.

#### Component errors shown once the interface initializes <!-- KIT-6756 -->

These components displayed their error as soon as they received it, even before their interface initialized. Like the other Atomic components, they now display it once the interface initializes, and render nothing before that:

- `atomic-commerce-query-error`
- `atomic-commerce-refine-toggle`
- `atomic-commerce-sort-dropdown`
- `atomic-generated-answer-feedback-modal`
- `atomic-insight-full-search-button`
- `atomic-insight-generate-answer-button`
- `atomic-insight-query-error`
- `atomic-insight-refine-toggle`
- `atomic-insight-result-action`
- `atomic-insight-result-attach-to-case-action`
- `atomic-insight-result-attach-to-case-indicator`
- `atomic-insight-result-children`
- `atomic-insight-search-box`
- `atomic-insight-smart-snippet`
- `atomic-insight-smart-snippet-feedback-modal`
- `atomic-insight-smart-snippet-suggestions`
- `atomic-insight-tab`
- `atomic-insight-user-actions-modal`
- `atomic-insight-user-actions-toggle`
- `atomic-ipx-refine-toggle`
- `atomic-product-description`
- `atomic-product-numeric-field-value`
- `atomic-product-price`
- `atomic-query-error`
- `atomic-recs-error`
- `atomic-refine-toggle`
- `atomic-result-badge`
- `atomic-result-children`
- `atomic-segmented-facet-scrollable`
- `atomic-smart-snippet-collapse-wrapper`
- `atomic-smart-snippet-expandable-answer`
- `atomic-smart-snippet-feedback-modal`
- `atomic-smart-snippet-source`
- `atomic-smart-snippet-suggestions`
- `atomic-sort-dropdown`

If a test waits for the error box of one of these components, initialize the interface first.

## Removals

### Components

| Removed                                                                                                                                            | Replacement                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `error` on `atomic-commerce-recommendation-interface`, `atomic-commerce-layout`, `atomic-insight-layout`, `atomic-search-layout` <!-- KIT-6756 --> | None: nothing sets it, so these components never hold an error |

### Interface components

| Removed                                                                                                                            | Replacement                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scrollToTop()` on `atomic-search-interface` and `atomic-commerce-interface`                                                       | `scrollIntoView()` on the element that `scroll-container` selects <!-- decided 2026-10-31, not yet built -->                                                                                    |
| `store` and `registerFieldsToInclude()` on `atomic-insight-interface`                                                              | The `store` of the bindings that `initializeBindings` returns, and `loadFieldActions(engine).registerFieldsToInclude` from `@coveo/headless/insight` <!-- decided 2026-10-31, not yet built --> |
| The `updateLocale(language, country, currency)` form on `atomic-commerce-interface` and `atomic-commerce-recommendation-interface` | `updateLocale({language, country, currency})`, where each property is optional <!-- decided 2026-10-31, not yet built -->                                                                       |
| The `language` property and attribute on `atomic-commerce-interface` and `atomic-commerce-recommendation-interface`                | The `language` of the `context` in the engine configuration, then `updateLocale({language})` to change it <!-- decided 2026-11-24, not yet built -->                                            |

### Facets

| Removed                           | Replacement                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `atomic-popover`                  | `atomic-facet-popover`, which takes the same slotted facet and exposes the same parts <!-- decided 2026-10-31, not yet built --> |
| `atomic-commerce-timeframe-facet` | None: the Commerce API removes date range facets in June 2027 <!-- decided 2026-11-18, not yet built -->                         |

### Search box suggestions

| Removed                                                              | Replacement                                                                               |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A Stencil `VNode` as the `content` of a `SearchBoxSuggestionElement` | An `Element`, as the built-in suggestions pass <!-- decided 2026-10-31, not yet built --> |
| `atomic-suggestion-renderer`                                         | None: it is internal to the search boxes <!-- decided 2026-10-31, not yet built -->       |

### Custom components

| Removed          | Replacement                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resultContext`  | `fetchResultContext` from `@coveo/atomic`, which takes the same element and returns the same promise <!-- decided 2026-11-23, not yet built -->  |
| `productContext` | `fetchProductContext` from `@coveo/atomic`, which takes the same element and returns the same promise <!-- decided 2026-11-23, not yet built --> |
