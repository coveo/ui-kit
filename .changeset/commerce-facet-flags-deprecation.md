---
'@coveo/headless': minor
---

The `isAutoSelected` and `isSuggested` properties of commerce facet values are deprecated, with no replacement: the Commerce API stops returning them in June 2027. The `updateCoreFacetIsFieldExpanded` and `updateAutoSelectionForAllCoreFacets` action creators of `loadCoreFacetActions` are deprecated too, because the Commerce API ignores the request properties they set, and dispatching either one now logs a deprecation warning once per engine. To show more or fewer facet values, use the `showMoreValues` and `showLessValues` methods of the facet controller, and remove any call to `updateAutoSelectionForAllCoreFacets`. The next major version removes these members.
