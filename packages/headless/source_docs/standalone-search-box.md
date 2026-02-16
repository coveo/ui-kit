---
title: Use a standalone search box
group: Usage
slug: usage/use-a-standalone-search-box
---
# Use a standalone search box
As an example, take the search box at the top of this page.
It allows you to start your search while on this page before redirecting you to the full search page.
Because such a search experience involves two pages, some data needs to be shared between them so that the query response is correct, and so that you log the proper [Coveo Analytics events](https://docs.coveo.com/en/260/).

This article walks you through the implementation of such a search experience.

## Create the page with the standalone search box

If you’ve already worked with [Coveo Headless controllers](https://docs.coveo.com/en/headless/latest/usage#use-headless-controllers), this step should already be familiar to you.
You need to create a search engine, instantiate a standalone search box controller and connect it to the search box DOM element.
A React example implementation is available [here](https://github.com/coveo/ui-kit/blob/master/packages/samples/headless-react/src/components/standalone-search-box/standalone-search-box.fn.tsx).

## Communicate between the two pages

When a visitor makes a search request using the standalone search box, the query and analytics data need to be stored before redirecting the user, to ensure that the full search page receives this stored query and analytics data.
You should use [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) as the browser storage mechanism, because the [client ID](https://docs.coveo.com/en/masb0234/) used by [Coveo Analytics](https://docs.coveo.com/en/182/) is kept in local storage.
For example, in the page with the standalone search box, you would include the following:

```typescript
searchBox.subscribe(() => {
    const {redirectTo, value, analytics} = searchBox.state;
​
    if (redirectTo) {
        const data = {value, analytics};
        localStorage.setItem('coveo_standalone_search_box_data', JSON.stringify(data));
​
        // perform redirect
        window.location.href = redirectTo;
    }
})
```

## Create the full search page

Prior to executing the first search on the full search page, you should configure `[originLevel3](https://docs.coveo.com/en/1339/)` so that your queries are logged correctly.
You also need to set the correct query.

You can configure `originLevel3` using the `document.referrer` value when initializing the engine, as shown below:

```typescript
import { buildSearchEngine } from '@coveo/headless';
​
const engine = buildSearchEngine({
  configuration: {
    // ...
    analytics: {
      originLevel3: document.referrer,
    },
  },
});
```

In your full search page, you can set the query using the [`updateQuery`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.QueryActionCreators.html#updateQuery) action, as shown below:

```typescript
import {loadQueryActions} from '@coveo/headless';
​
const {updateQuery} = loadQueryActions(engine);
const data = localStorage.getItem('coveo_standalone_search_box_data');
const {value} = JSON.parse(data);
​
engine.dispatch(updateQuery({q: value}));
```

The final steps are to delete the data in local storage and to handle the case where someone reaches the search interface without using the standalone search box (in which case there’s no data in `localstorage`).

If you do all of this, here’s what the code for your full search page will look like:

```typescript
import {buildSearchEngine, loadQueryActions, loadSearchAnalyticsActions} from '@coveo/headless';
​
const engine = buildSearchEngine({
  configuration: {
    // ...
    analytics: {
      originLevel3: document.referrer,
    },
  },
});
​
const {updateQuery} = loadQueryActions(engine);
const data = localStorage.getItem('coveo_standalone_search_box_data');
​
if (data) {
  localStorage.removeItem('coveo_standalone_search_box_data');
  const {value, analytics} = JSON.parse(data);
​  engine.dispatch(updateQuery({q: value}));
  engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
} else {
  engine.executeFirstSearch();
}
```

There you go!
If you’ve made it this far, you’ve set up a standalone search box that’s sending the necessary analytics events, which can be leveraged by reporting [dashboards](https://docs.coveo.com/en/256/) and [Coveo Machine Learning (Coveo ML)](https://docs.coveo.com/en/188/).