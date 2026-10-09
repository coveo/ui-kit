---
'@coveo/quantic': patch
---

Fixed the `QuanticSearchBox` and `QuanticStandaloneSearchBox` placeholder being empty by default. When no `placeholder` is set, it now falls back to the new `quantic_SearchBoxPlaceholder` custom label, which can be overridden independently of the `quantic_Search` label used by facet search inputs.
