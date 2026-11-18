---
'@coveo/atomic': minor
---

The `updateLocale` method of `atomic-commerce-interface` and `atomic-commerce-recommendation-interface` now accepts an object, for example `updateLocale({language: 'fr', country: 'CA', currency: 'CAD'})`. Calling it with separate arguments still works but is deprecated. The `scrollToTop` method of `atomic-search-interface` and `atomic-commerce-interface`, and the `store` property and `registerFieldsToInclude` method of `atomic-insight-interface`, are deprecated because they are internal: call `scrollIntoView()` on the element that `scroll-container` selects, use the `store` of the bindings that `initializeBindings` returns, and use `loadFieldActions(engine).registerFieldsToInclude` from `@coveo/headless/insight` instead. Each of these logs a warning through the engine logger, once per engine, when your code uses it. Version 4 removes them.
