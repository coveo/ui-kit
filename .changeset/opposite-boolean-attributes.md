---
'@coveo/atomic': minor
'@coveo/create-atomic-component-project': patch
---

Boolean options that are on by default now each have an attribute that turns them off: `disable-facet-count-filtering` on the facets, `disable-facet-search` on `atomic-facet` and `atomic-color-facet`, `disable-clear-filters` on the search boxes, `disable-base-path-filtering` on `atomic-category-facet`, `disable-automatic-query-correction` on `atomic-did-you-mean`, `disable-sanitization` on `atomic-html` and `atomic-result-html`, and `disable-hide-self` on `atomic-focus-trap`. Use them instead of setting `filter-facet-count`, `with-search`, `clear-filters`, `filter-by-base-path`, `automatically-correct-query`, `sanitize` or `should-hide-self` to `false`, which v4 won't support.

Turning one of these options off, or `analytics` on the interfaces, now logs a deprecation warning through the engine logger, once per engine, whether it's set as an attribute, as a property or through the React and Angular wrappers. The warning names the attribute to use and follows the configured log level. The `="false"` console warning no longer fires for these options, nor for `reflect-state-in-url`, `enable-relevance-inspector`, `enable-cancel-last-action` and `should-highlight`, which already warn through the engine logger. `atomic-focus-trap` has no engine, so `should-hide-self="false"` still warns in the console and names `disable-hide-self`.

`filter-facet-count="false"` is still ignored on `atomic-numeric-facet`, `atomic-insight-facet` and `atomic-insight-numeric-facet`, and `sanitize="false"` is still ignored on `atomic-html` and `atomic-result-html`, as before. Use `disable-facet-count-filtering` and `disable-sanitization` to turn these options off. The `create-atomic-component-project` template now uses `disable-facet-search` instead of `with-search="false"`.
