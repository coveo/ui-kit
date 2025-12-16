---
title: Synchronize search parameters with the URL
group: Usage
slug: usage/synchronize-search-parameters-with-the-url
---
# Synchronize search parameters with the URL
Headless provides two controllers to help you keep the URL of your application in sync with your [Headless engine](https://docs.coveo.com/en/headless/latest/usage#configure-a-headless-engine) state.
This article explains how to use those controllers, and why you would choose one over the other.

<dl><dt><strong>📌 Note</strong></dt><dd>

The context where you would make use of those controllers is during the initialization of your Headless application, so you may want to [review how to do so](https://docs.coveo.com/en/headless/latest/usage#initialize-your-interface) before reading this article.
</dd></dl>

## `buildUrlManager`

The [`UrlManager`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.UrlManager.html) controller is the faster option, taking a few minutes to set up.
It monitors the search parameters affecting the result list, and serializes them into a URL-ready string that contains values such as the query, sort criteria and selected facet values.

**Example**

Your search page is in a state where the query is "hello" and where the results are sorted by descending date.
The `UrlManager` would serialize this state as the following string: `q=hello&sortCriteria=date%20descending`.

The `UrlManager` controller can also do the reverse, that is, deserialize a string and update the Headless engine state values accordingly.
However, because the controller manages serialization and deserialization, it doesn’t offer control over the serialization form of the URL.

```javascript
const fragment = window.location.hash.slice(1);
const urlManager = buildUrlManager(engine, { ①
    initialState: {fragment}
})
 
urlManager.subscribe(() => { ②
    const hash = `#${this.urlManager.state.fragment}`;

    if (!this.searchStatus.state.firstSearchExecuted) { ③
        history.replaceState(null, document.title, hash);

        return;
    }

    history.pushState(null, document.title, hash);
});
 
window.addEventListener('hashchange', () => { ④
    const fragment = window.location.hash.slice(1);
    urlManager.synchronize(fragment);
});
```
1. Set the initial search parameters to the values in the URL when a page first loads.
2. Update the hash when search parameters change.
3. Using `replaceState()` instead of `pushState()` in this case ensures that the URL reflects the current state of the search page on the first interface load.
If `pushState()` were used instead, users could possibly enter a history loop, having to click the back button multiple times without being able to return to a previous page.
This situation happens with components such as the `Tab` component, which adds a new state to the browser history stack.
Using `replaceState` instead replaces the current state of the browser history with a new state, effectively updating the URL without adding a new entry to the history stack.
4. Update the search parameters when an end user manually changes the hash.

## `buildSearchParameterManager`

The [`SearchParameterManager`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchParameterManager.html) controller provides the active search parameters as an object rather than a string, giving you full control over how to serialize them.
Conversely, the controller can take in an object with search parameters with which to update the Headless engine state.
The following sample is similar to the one above, but uses custom `serialize` and `deserialize` functions you would define yourself:

```javascript
const url = getUrl();
const parameters = deserialize(url);
const manager = buildSearchParameterManager(engine, { ①
    initialState: {parameters}
})
 
manager.subscribe(() => { ②
    const url = serialize(manager.state.parameters);
    if (!this.searchStatus.state.firstSearchExecuted) { ③
        history.replaceState(null, document.title, hash);

        return;
    }
    history.pushState(null, document.title, url);
});
 
window.addEventListener('hashchange', () => { ④
    const url = getUrl();
    const parameters = deserialize(url);
    manager.synchronize(parameters);
});
 
function serialize(parameters) {
    // ...
}
 
function deserialize(url) {
    // ...
}
```
1. Set the initial search parameters to the values in the URL when a page first loads.
2. Update the URL when search parameters change.
3. This condition handles cases that could cause bugs in some interfaces.
4. Update the search parameters when a user manually changes the URL.

In summary, Headless offers two controllers to synchronize your engine state with the URL.
The `buildUrlManager` controller is faster to set up, but doesn’t let you control the form of the URL.
The `buildSearchParameterManager` controller offers full control over the form of the URL, but takes more time to set up since it does not handle search parameter serialization and deserialization.