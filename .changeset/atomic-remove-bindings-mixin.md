---
'@coveo/atomic': patch
---

`atomic-pager`, `atomic-query-summary`, `atomic-insight-query-summary`, `atomic-results-per-page`, `atomic-notifications`, `atomic-automatic-facet`, `atomic-result-number`, `atomic-result-rating`, `atomic-result-timespan`, `atomic-modal`, `atomic-ipx-modal` and `atomic-smart-snippet-collapse-wrapper` now get their bindings only from the `@bindings()` decorator. A component that starts outside of an Atomic interface and is moved into one later now initializes and renders, instead of keeping a stale missing-interface error. These components also no longer run their setup again each time they are removed from the page and added back.

Components inside an `atomic-external` that connects after its interface is ready now receive their bindings. Previously, `atomic-external` didn't pass the interface bindings to components that use the `@bindings()` decorator in that case, so they never initialized.
