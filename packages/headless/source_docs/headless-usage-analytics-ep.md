---
title: Event Protocol
group: Usage
category: Usage Analytics
slug: usage/usage-analytics/event-protocol
---
# Event Protocol with Headless

<dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

[Event Protocol](https://docs.coveo.com/en/o9je0592/) is currently in open beta.
If you’re interested in using Event Protocol, reach out to your Customer Success Manager (CSM).
</dd></dl>

Since the Headless V3 release, [Event Protocol](https://docs.coveo.com/en/o9je0592/) is the default tracking protocol.

<dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

Only [Coveo for Commerce](https://docs.coveo.com/en/1499/) supports EP at the moment.
For every other kind of implementation, set `analyticsMode` to `legacy` for the time being.
</dd></dl>

```ts
const engine = buildSearchEngine({
    configuration: {
        // ...rest of configuration
        analytics: {analyticsMode: 'legacy'},
    }
})
```

To learn more about whether you should migrate to EP, see [Migrate to Event Protocol](https://docs.coveo.com/en/o88d0509/).

## Log events

EP is simpler to use and more streamlined than the legacy Coveo UA protocol.
EP doesn’t support custom events, custom data, or custom context.
Search events are sent server-side, so you don’t need to log them client-side.
Headless controllers, when used correctly, also log click events for you.

As a result, you generally won’t need to tinker with search or click events yourself.

<dl><dt><strong>⚠️ WARNING</strong></dt><dd>

We strongly recommend using the [`InteractiveResult`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.InteractiveResult.html) controller when implementing your result components.
The controller can automatically extract relevant data from result items and log click events for you, as in the following interactive example.
</dd></dl>

<iframe src="https://stackblitz.com/github/coveo/headless-documentation-material-ui-react-codesandbox/tree/main?embed=1&file=src%2FComponents%2FResultLink.tsx"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
   ></iframe>

<dl><dt><strong>📌 Note</strong></dt><dd>

For the purpose of using [content recommendations](https://docs.coveo.com/en/1016/) models however, you must log [view events](https://docs.coveo.com/en/headless/latest/usage/headless-usage-analytics/headless-view-events-ep/).
Headless controllers won’t log view events for you.
Use the [Relay library](https://docs.coveo.com/en/headless/latest/usage/headless-usage-analytics/headless-view-events-ep/).
</dd></dl>

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