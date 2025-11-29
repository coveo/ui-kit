---
title: Coveo UA
group: Usage
category: Usage Analytics
slug: usage/usage-analytics/coveo-ua
---
# Coveo UA

When used correctly, Headless controllers take care of logging standard Coveo UA search and click [Coveo Analytics events](https://docs.coveo.com/en/260/) for you.
This article covers various topics that you may find helpful if you require further customization when using the Coveo UA protocol with Headless.

<dl><dt><strong>📌 Notes</strong></dt><dd>

* For brevity, this article mainly focuses on the [`Search Engine`](https://docs.coveo.com/en/headless/latest/reference/modules/Search.html).
However, similar logic applies when configuring UA for other Headless engines (except the Commerce Engine, which only supports [Event Protocol](https://docs.coveo.com/en/o3r90189/)).
* Take a look at the [Log view events with Coveo UA](https://docs.coveo.com/en/headless/latest/usage/headless-usage-analytics/headless-view-events/) article to understand how to log view events.
View event tracking with the Coveo UA protocol requires the `coveoua.js` script rather than the [Atomic](https://docs.coveo.com/en/lcdf0264/) or Headless libraries.
</dd></dl>

## Modify the metadata to send with UA events

It can be useful to add or modify metadata to send along with the standard UA events logged by Headless controllers.
You can leverage the `analyticsClientMiddleware` property of an [`AnalyticsConfiguration`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.AnalyticsConfiguration.html) to hook into an analytics event payload before Headless sends it to Coveo.
By default, Headless v3 uses [Event Protocol](https://docs.coveo.com/en/o9je0592/) to track events instead of the Coveo UA protocol.
The Event Protocol doesn’t support the `analyticsClientMiddleware` property.
To use this property in Headless v3, you need to [set the `analyticsMode` to `legacy`](https://docs.coveo.com/en/headless/latest/headless-upgrade-from-v2/#removal-of-analyticsclientmiddleware-function) during the initialization.

The following example shows how to customize metadata using `analyticsClientMiddleware`:

```jsx
const analyticsClientMiddleware = (eventName, payload) => { ②
    if (payload.visitorId == "") { ③
        payload.customData['loggedIn'] = false          // new metadata field added
        payload.customData['context_role'] = "Anonymous"
    } else {
        payload.customData['loggedIn'] = true
        payload.customData['context_role'] = "Visitor"
    }
    return payload;
};

export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: "<ORGANIZATION_ID>",
    accessToken: "<ACCESS_TOKEN>",
    analytics: {
      analyticsClientMiddleware ①
    },
  }
})
```

1. The `analyticsClientMiddleware` is a function that needs to be defined if we want to add or modify event data (see [analytics.ts](https://github.com/coveo/coveo.analytics.js/blob/master/src/client/analytics.ts)).
2. The function takes as input an `eventName` and the event `payload`.
3. Within this function, you can access the `payload` data and modify it.
In the example above, we check to see if `visitorId` is an empty string.
We add a new field (`loggedIn`) and a new custom context field (`context_role`)  to `customData`.
If `visitorId` is empty, `loggedIn` is set to `false` and `context_role` to `Anonymous`.
On the other hand, if `visitorId` is not empty, `loggedIn` is set to `true` and `context_role` to `Visitor`.

## Send click events

Click events are intended to record item view and preview actions, such as:

* Opening a result link
* Opening a result Quick view

<dl><dt><strong>⚠️ WARNING</strong></dt><dd>

We strongly recommend using the [`InteractiveResult`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.InteractiveResult.html) controller when implementing your result components.
The controller can automatically extract relevant data from result items and log click events for you, as in the following interactive example.
</dd></dl>

<iframe src="https://stackblitz.com/github/coveo/headless-documentation-material-ui-react-codesandbox/tree/main?embed=1&view=split&file=src%2FComponents%2FResultLink.tsx"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
   ></iframe>

To learn more about using the `InteractiveResult` component in your result list implementation, see [Lesson 3](https://levelup.coveo.com/learn/courses/headless-commerce-tutorial/lessons/lesson-3-usage-analytics#_click_events) of the Coveo Headless Tutorial.

### Send your own click events

It’s also technically possible to send your own click events, without the `InteractiveResult` controller, by [dispatching](https://docs.coveo.com/en/headless/latest/usage#dispatch-actions) [`ClickAnalyticsActions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.ClickAnalyticsActionCreators.html) or [`GenericAnalyticsActions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GenericAnalyticsActionCreators.html).

However, we recommend against doing so because it’s very error prone.
For UA reports and ML models to function properly, click events need to contain all the metadata that the `InteractiveResult` controller extracts from results.

If you need to customize your click events, we rather recommend [using the `analyticsClientMiddleware` property](#modify-the-metadata-to-send-with-ua-events) and listening to the [target action](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.ClickAnalyticsActionCreators.html), as in the following example.

```jsx
export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: "<ORGANIZATION_ID>",
    accessToken: "<ACCESS_TOKEN>",
    analytics: {
      analyticsClientMiddleware: (eventName: string, payload: any) => {
        if (payload.actionCause === 'documentOpen') { ①
          const matchingResult = headlessEngine.state.search.results[payload.documentPosition - 1];
          payload.customData['intent'] = matchingResult.raw['docsintent']; ②
        }
        return payload;
      };
    },
  }
})
```

1. If a UA event is dispatched with the [`logDocumentOpen`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.ClickAnalyticsActionCreators.html#logDocumentOpen) cause, add the target metadata.
2. You can access result item fields when logging metadata.
Concretely, you can use the populated default item fields, plus the ones specified through the [`fieldsToInclude`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.ResultListOptions.html) parameter.
You can inspect search request responses in your search interface to see the currently available fields:

![Inspecting response fields](https://docs.coveo.com/en/assets/images/build-a-search-ui/inspect-fields.png)

## Send search events

Search events are intended to record end-user interactions that trigger queries, such as:

* Submitting a search request from the search box
* Selecting a facet value

You generally shouldn’t have to worry about logging search events, because standard search controllers such as [`SearchBox`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchBox.html) and [`facet`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Facet.html) controllers take care of automatically logging such interactions.

### Send your own search events

If you need to send additional search events, you can do so by [dispatching actions](https://docs.coveo.com/en/headless/latest/usage#dispatch-actions).
We recommend using controllers over dispatching actions directly.
However, the latter is still possible and can be helpful in specific use cases that controllers don’t cover, such as when you need to send your own UA events.

Depending on your use case, there are two ways to send your own search events.
A search event can either be sent via [`SearchAnalyticsActions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchAnalyticsActionCreators.html) or [`GenericAnalyticsActions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GenericAnalyticsActionCreators.html).
Both of these are action loaders.

`SearchAnalyticsActions` are for specific search events for which the _cause_ is recognized by Coveo, such as `logFacetClearAll` or `logInterfaceLoad`.
These events are used by Coveo ML.

`GenericAnalyticsActions` lets you send any type of custom search event using the `logSearchEvent` action creator.
The _cause_ of this event is unknown to Coveo, so it can’t be used by Coveo ML.

If you want to use `SearchAnalyticsActions`, we recommend implementing logic such as in the following example.

```jsx
import {headlessEngine} from '../engine'; ①
import {loadSearchActions} from '@coveo/headless'; ②
import {loadSearchAnalyticsActions} from '@coveo/headless'; ③

const searchAction = () => {
    const {executeSearch} = loadSearchActions(headlessEngine); ④
    const {logInterfaceLoad} = loadSearchAnalyticsActions(headlessEngine); ⑤
    headlessEngine.dispatch(executeSearch(logInterfaceLoad())); ⑥
};

export const CustomComponent = () => {
    return (
        <button onClick={searchAction}>Load Search Interface</button>
    )
};
```

1. Import a local initialized search engine from your `engine.ts` file.
2. Import `loadSearchActions` from the Headless package.
This lets you create an action to execute a search query.
3. Import `loadSearchAnalyticsActions` from the Headless package.
This will lets you return a dictionary of possible search analytics action creators.
4. Get the `executeSearch` action creator to execute a search query.
5. Get a specific action creator, `logInterfaceLoad` in this scenario.
This is the analytics event you will log.
6. Dispatch an action to execute a search query, with the search analytic action passed in as input to log it.

<dl><dt><strong>📌 Note</strong></dt><dd>

Take a look at [Custom events](#send-custom-events) to see a code example of how to log a search event using `GenericAnalyticsActions`.
</dd></dl>

## Send custom events

Custom events are intended to record end-user interactions that don’t trigger a query or open a query result, such as:

* Updating end-user preferences
* Changing the result list layout

`GenericAnalyticsActions` lets you send any type of custom event using the `logCustomEvent` action creator.
The _cause_ of this event is unknown to Coveo, so it can’t be used by Coveo ML.

If you want to use `GenericAnalyticsActions`, we recommend implementing logic such as in the following example.

```jsx
import {headlessEngine} from '../engine'; ①
import {loadGenericAnalyticsActions} from '@coveo/headless'; ②

const genericCustomAction = () => {
    const {logCustomEvent} = loadGenericAnalyticsActions(headlessEngine) ③
    const payload = { ④
        evt: '<EVT>',
        type: '<TYPE>'
    }
    headlessEngine.dispatch(logCustomEvent(payload)) ⑤
}

export const CustomComponent = () => {
    return (
        <button onClick={genericCustomAction}>Click me</button>
    )
};
```

1. Import a local initialized search engine from your `engine.ts` file.
2. Import `loadGenericAnalyticsActions` from the Headless package.
This lets you return a dictionary of possible generic analytics action creators.
3. Get a specific action creator, `logCustomEvent` in this scenario.
4. Create a `payload` object to be sent to Coveo when logging a custom event.
This payload will describe the details of which event led to the action being triggered.
5. Dispatch the action to log the custom event.

## User tracking and anonymizing UA Data

By default, the Usage Analytics Write API will extract the `name` and `userDisplayName`, if present, from the [search token](https://docs.coveo.com/en/56/).
If the users of your search interface are authenticated, you may want to hash their identities to ensure that they can’t be clearly identified in UA data.
You can do so when initializing an engine instance by setting the `anonymous` property of the `AnalyticsConfiguration` as in the example below.

```jsx
export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: "<ORGANIZATION_ID>",
    accessToken: "<ACCESS_TOKEN>",
    analytics: {
      anonymous: true
    },
  }
})
```

While we recommend the use of a search token for request authentication, it’s still possible to send user information if users are logged in, and you’re utilizing an [API key](https://docs.coveo.com/en/105/) for authentication.

When using an API key, user information can be sent to Coveo by [modifying the UA event](#modify-the-metadata-to-send-with-ua-events), as shown in the following code snippet:

<dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

When you [create the API Key](https://docs.coveo.com/en/1718#create-an-api-key), use the **Anonymous search** [template](https://docs.coveo.com/en/1718#api-key-templates).
It will provide the right [privileges](https://docs.coveo.com/en/228/) for this use case.
</dd></dl>

```typescript
export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: "<ORGANIZATION_ID>",
    accessToken: "<ACCESS_TOKEN>",
    analytics: {
      analyticsClientMiddleware: (eventName: string, payload: any) => {
        if isLoggedIn { ①
          payload.username = <USERNAME>;
          payload.userDisplayName = <USER>;
        }
        return payload;
      };
    },
  }
});
```
1. Use a custom `isLoggedIn` variable to determine whether the user is logged in.
Extract the `username` and `userDisplayName` from your user object and add them to the payload.

## Send events externally

If you want to log UA events to an external service, such as [Google Analytics](https://analytics.google.com/), we recommend leveraging the `analyticsClientMiddleware` property in your [`AnalyticsConfiguration`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.AnalyticsConfiguration.html) to hook into an analytics event payload, as in the following example.

```jsx
const pushToGoogleDataLayer = (payload: Record<string, unknown>) => {
  // For implementation details, see the Google documentation
  // (https://developers.google.com/tag-platform/tag-manager/web/datalayer#datalayer)
};
// ...
(async () => {
        await customElements.whenDefined('atomic-search-interface');
        const searchInterface = document.querySelector('atomic-search-interface');
        await searchInterface.initialize({
            accessToken: '<ACCESS_TOKEN>',
            organizationId: '<ORGANIZATION_ID>',
            analytics: {
                analyticsClientMiddleware: (eventType, payload) => {
                    pushToGoogleDataLayer(payload);
                    return payload;
                },
            }
        }),
})();
```

## Disable and enable analytics

Coveo front-end libraries use the `coveo_visitorId` cookie to track individual users and sessions.

<dl><dt><strong>📌 Note</strong></dt><dd>

Coveo now uses the [client ID](https://docs.coveo.com/en/lbjf0131/) value to track individual users and sessions.
For compatibility with legacy implementations, however, the associated cookie and local storage value are [still labeled `visitorID`](https://docs.coveo.com/en/mc2e2218#why-do-i-still-see-the-name-visitor-id-in-the-local-storage).
</dd></dl>

When implementing a cookie policy, you may need to disable UA tracking for end-users under specific circumstances (for example, when a user opts out of cookies).
To do so, call the [`disableAnalytics`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html#disableAnalytics) method on an engine instance.

To re-enable UA tracking, call the [`enableAnalytics`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html#enableAnalytics) method.

```typescript
// initialize an engine instance
const headlessEngine = buildSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
});

headlessEngine.disableAnalytics()
// Or, headlessEngine.enableAnalytics();
```

## doNotTrack property

[`doNotTrack`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack) is a browser property which reflects the value of the [`DNT`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/DNT) HTTP header.
It’s used to indicate whether the user is requesting sites and advertisers not to track them.

<dl><dt><strong>📌 Note</strong></dt><dd>

This property is deprecated, but it’s still supported in many browsers.
</dd></dl>

Headless v2 complies with the value of this property.
It automatically disables analytics tracking whenever `DNT` is enabled.

<dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

Headless v3 will no longer support this property.
</dd></dl>

<dl><dt><strong>📌 NOTE</strong></dt><dd>

To understand how Coveo Usage Analytics tracks users and sessions, see [What’s a user visit?](https://docs.coveo.com/en/1873/).
</dd></dl>