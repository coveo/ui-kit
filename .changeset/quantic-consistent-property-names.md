---
"@coveo/quantic": minor
---

Added consistent names for three properties and deprecated the old ones, which now log a console warning and will be removed in the next major version. In `quantic-result-link`, use `field` instead of `displayedField`. In `quantic-refine-toggle`, use `buttonTooltip` instead of `title`. In `quantic-smart-snippet`, use `maxCollapsedHeight` instead of `maximumSnippetHeight`. The internal `searchBoxStyle` style module is renamed to `quanticSearchBoxStyles` so it can no longer collide with a component in the `c` namespace.
