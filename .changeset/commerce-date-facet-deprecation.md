---
'@coveo/headless': minor
---

The commerce date facet is deprecated: `DateFacet`, `DateFacetState`, `DateFacetValue`, `DateRangeRequest`, `buildDateRange`, `loadDateFacetActions` with its action creators and payload types, the `'dateRange'` facet type, and the `df` and `dfExcluded` keys of `Parameters`. The Commerce API removes date range facets in June 2027, with no replacement, and the next major version of Headless removes these members. Nothing changes at runtime, and the date facet members of the search entry point stay as they are. Remove the commerce date facet code from your interface before you upgrade to the next major version.
