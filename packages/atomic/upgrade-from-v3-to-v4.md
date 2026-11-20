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

## Removals

### Interface components

| Removed                                                                                                                            | Replacement                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scrollToTop()` on `atomic-search-interface` and `atomic-commerce-interface`                                                       | `scrollIntoView()` on the element that `scroll-container` selects <!-- decided 2026-10-31, not yet built -->                                                                                    |
| `store` and `registerFieldsToInclude()` on `atomic-insight-interface`                                                              | The `store` of the bindings that `initializeBindings` returns, and `loadFieldActions(engine).registerFieldsToInclude` from `@coveo/headless/insight` <!-- decided 2026-10-31, not yet built --> |
| The `updateLocale(language, country, currency)` form on `atomic-commerce-interface` and `atomic-commerce-recommendation-interface` | `updateLocale({language, country, currency})`, where each property is optional <!-- decided 2026-10-31, not yet built -->                                                                       |

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
