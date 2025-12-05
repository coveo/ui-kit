---
title: Extend controllers
group: Usage
slug: usage/extend-controllers
---
# Extend controllers
When you call a method, Headless dispatches one or more low-level actions.
For example, calling the [`submit`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchBox.html#submit) method on the `SearchBox` controller dispatches actions to:

* update the [query](https://docs.coveo.com/en/231/)
* clear active [facet](https://docs.coveo.com/en/198/) values
* reset the result page to the first page
* perform a query
* log the appropriate [Coveo Analytics event](https://docs.coveo.com/en/260/)

Controllers embed user experience decisions that we believe are best-practices for creating great search experiences.
For example, submitting a query from a search box resets selected facet values to reduce the odds of seeing no results.
However, it’s possible to change the default behaviors by overriding or adding new methods that dispatch a different set of actions.
The following sample shows how to add a new method to the search box controller to perform a search request without resetting active facet values:

```javascript
import {
  buildSearchBox,
  loadQueryActions,
  loadPaginationActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
} from '@coveo/headless'
 
function buildCustomSearchBox(engine: SearchEngine, id: string) {
  const baseSearchBox = buildSearchBox(engine, {options: {id}});
  const {updateQuery} = loadQueryActions(engine);
  const {updatePage} = loadPaginationActions(engine);
  const {executeSearch} = loadSearchActions(engine);
  const {logSearchboxSubmit} = loadSearchAnalyticsActions(engine);
 
  return {
    ...baseSearchBox,
 
    submitWithoutFacetReset() {
      const query = engine.state.querySet![id];
 
      updateQuery({q: query});
      updatePage(1);
      executeSearch(logSearchboxSubmit());
    }
  }
}
```

You can extend any Headless controller this way.
It’s possible to override existing methods, or add new ones that dispatch different sets of action