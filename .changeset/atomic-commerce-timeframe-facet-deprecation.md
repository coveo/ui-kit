---
'@coveo/atomic': minor
---

`atomic-commerce-timeframe-facet` is deprecated, with no replacement, and the next major version of Atomic removes it. The Commerce API removes date range facets in June 2027, and Headless deprecates the commerce date facet controller that this component displays. `atomic-commerce-facets` still renders date range facets with this component, which now logs a deprecation warning once per engine. If your page uses the component directly or styles its parts, remove that code before you upgrade to the next major version.
