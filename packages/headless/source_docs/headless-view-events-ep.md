---
title: Log view events with EP
group: Usage
category: Usage Analytics
slug: usage/usage-analytics/log-view-events-with-ep
---
# Log view events with EP

You can use Headless controllers to handle Search API requests and leverage [Coveo Analytics](https://docs.coveo.com/en/182/).
Headless-powered search UI components can automatically click [events](https://docs.coveo.com/en/260/) for user interactions in your [search interfaces](https://docs.coveo.com/en/2741/).
These events let you track user interactions with your [search interfaces](https://docs.coveo.com/en/2741/) so that you can optimize your Coveo solution.
Search and click [events](https://docs.coveo.com/en/260/) provide the data to power most [Coveo Machine Learning (Coveo ML)](https://docs.coveo.com/en/188/) [models](https://docs.coveo.com/en/1012/), except for [Content Recommendations (CR)](https://docs.coveo.com/en/1016/).

The output of a CR model depends on [view](https://docs.coveo.com/en/2949#view) events and the user’s action history.
Headless doesn’t log these events for you, so you should ensure that you’re [sending view events](#send-view-events-with-relay) for each page that you want to be able to recommend.

The [Relay library](https://docs.coveo.com/en/relay/latest/), which is included in Headless, lets you send EP view events to Coveo.

<dl><dt><strong>💡 TIP: Leading practice</strong></dt><dd>

Start sending view events as soon as you can to gather data that your CR models can learn from.
</dd></dl>

## Send view events with Relay

Use the `relay.emit` function on your Engine to send events to Coveo.
The `emit` function accepts two parameters: the event type and the event payload.

The event type is the `string` name of the event, in this case `itemView`, and the event payload is a JSON object containing the data to be sent to Coveo.

```js
export const searchEngine = buildSearchEngine({
    configuration: {
        // ...
        analytics: {
          trackingId: "sports",
          analyticsMode: "next",
        },
    },
});

searchEngine.relay.emit('itemView', { ①
    itemMetadata: { ②
        uniqueFieldName: "permanentid",
        uniqueFieldValue: "kayak-paddle-01",
        author: "Barca Sports",
        url: "https://www.mydomain.com/l/products/kayak-paddle-01",
        title: "Bamboo Kayak Paddle"
    },
});
```
1. Pass in the name of the event as the first parameter of the `emit` function.
2. Pass in the event payload required for the [`itemview`](https://docs.coveo.com/en/n9da0377#itemview) event.
No need to send the `meta` object, as it’s automatically handled by Relay.

You can also use the Relay library directly to log view events on pages you want to be able to recommend but on which you don’t use Headless.
See the [Relay library documentation](https://docs.coveo.com/en/relay/latest/).