---
title: Introduction
group: Usage
category: Usage Analytics
slug: usage/usage-analytics/index
---
# Usage Analytics

Administrators can leverage recorded [Coveo Analytics](https://docs.coveo.com/en/182/) [data](https://docs.coveo.com/en/259/) to evaluate how users interact with a [search interface](https://docs.coveo.com/en/2741/), identify content gaps, and improve relevancy by generating and examining [dashboards](https://docs.coveo.com/en/256/) and [reports](https://docs.coveo.com/en/266/) within the [Coveo Administration Console](https://docs.coveo.com/en/183/) (see [Coveo Analytics overview](https://docs.coveo.com/en/l3bf0598/)).
Moreover, [Coveo Machine Learning (Coveo ML)](https://docs.coveo.com/en/188/) features require UA data to function.

Since version 2.80.0, Coveo Headless supports two tracking protocols: the [Coveo UA Protocol](https://docs.coveo.com/en/headless/latest/usage/headless-usage-analytics/headless-coveo-ua/) and the new [Event Protocol (EP)](https://docs.coveo.com/en/headless/latest/usage/headless-usage-analytics/headless-ep/).

Event Protocol is a new standard for sending analytics [events](https://docs.coveo.com/en/260/) to Coveo.

It simplifies event tracking by reducing the number of events sent to Coveo.
For instance, you no longer need to send any `search` events as they’re logged server-side when you make a request to the Search API.

The protocol also streamlines the event payload, requiring fewer fields.
Such streamlining results in a more efficient and less error-prone event tracking process, yielding better [machine learning](https://docs.coveo.com/en/188/) [models](https://docs.coveo.com/en/1012/) and [Coveo Analytics](https://docs.coveo.com/en/182/) [reports](https://docs.coveo.com/en/266/).

## Coveo UA vs. EP

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