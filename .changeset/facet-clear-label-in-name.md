---
'@coveo/atomic': patch
---

The accessible name of the facet clear button now contains its visible text in every locale, so it meets WCAG 2.5.3 Label in Name. The `clear-filters-for-facet` i18n key changed in several locales; in English, the singular form now reads "Clear filter for the {{label}} facet" instead of "Clear {{count}} filter for the {{label}} facet". The clear button of a category facet's selected value uses the same key.
