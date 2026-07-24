# Technical Overview of coveo.analytics.js

Here is a brief document explaining some design decisions in the project.

## Replicating the Google Measurement Protocol

When Coveo wanted to start tracking Commerce events, we decided to stick to an existing format instead of designing our own. This lead to the usage of Google's [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/v1/reference) with the "Enhanced ECommerce" capabilities.

The idea was to allow people that already use this format to very quickly switch (or use with) the coveo.analytics.js library for commerce tracking.

On the Coveo Usage Analytics side, a new endpoint was created to accept this format and is called the `collect` endpoint.

## Project Structure

### src/client

The client section holds the analytics client that can be constructed and used as a standard client.

The "runtime" is a small wrapper around features that are only available in NodeJS or in the Browser

The "fetchClient" is using a standard "fetch" to send the event.

The "beaconClient" is used to send "beacons" from the navigator. This "beacon" has _no response validation from the browser_ (send and forget), so it is especially useful when the event is sent on an outgoing click.

Everything related to "Measurement Protocol Mapping" contain all the logic to map human-readable attribute to the Measurement Protocol condensed format.

The `analytics.ts` file is the one wrapping everything into a neatly usable client.

### src/coveoua

This section holds the library that is compiled for browser usage. It wraps the "client" (see previous section) into an easy to use `coveoua()` queue.

`simpleanalytics.ts` holds the logic of processing one event from the queue.

`browser.ts` holds the logic of assigning the global variable in the browser.

`plugins.ts` allows registering an external plugin (such as `ec` and `svc`, but both of them are included by default for convenience). See the plugins section for more details.

### src/formatting

This sections holds some formatting methods for metadata.

### src/hook

This section holds "hooks" that are executed on sending a new event. It is mostly used to centralise a specific logic that modifies the event in some way.

`addDefaultValues.ts` ensures that some values are always included

`enhanceViewEvent.ts` ensures that view events include the location, referrer, and also adds the event to the history store.

### src/plugins

This section contains plugins that add specific features and new actions to the standard protocol. E.g. `ec:addProduct`.

`BasePlugin.ts` contains the main logic of updating the `location` and `referrer` on a new `coveoua("send", "pageview")` event, adding some other default values that are required for the Measurement Protocol, and managing the action data.

`ec.ts` and `svc.ts` both register the actions that should use the measurement protocol with `this.client.addEventTypeMapping`, and also register some hooks to properly add some properties with `this.client.registerBeforeSendEventHook`. They also take care of holding some values (such as `products` that are added with `ec:addProduct`) until an event or pageview is sent to the Collect endpoint.

### src/react-native

This section holds the objects related to react-native runtime.

### src/searchPage

`searchPageClient` is a wrapper around the main client that is strongly typed for Search Page events.

### functional

This section holds tests that mimic real user behavior. Some methods are available to get back the request and the response for each call. The goal here is to have as many "real use cases" tests.

### Cypress

This section holds an e2e test that loads the page and sends a pageview. The purpose of this is to monitor that the `coveoua` script can be called from the browser by using the static endpoint at any time.

## Quirks in the Project

### Plugins

The reasons there are "plugins" in the project is to mimic what is done in the `ga.js` library. (In the end, we include our 2 plugins all the time, so maybe this was unnecessary)

### Client Hooks

Since we are using plugins, we needed a way to inject some logic into the main event processing. This was done in a "pipeline" fashion, where multiple processors receive the event from the previous processor and can alter it in any way.

#### resolveParameters

In the `analytics.ts` file, the `resolveParameters` method is used to transform the current parameters, e.g. with `coveoua("send", "event", { page: 'X' })`, you need to process the `{ page: 'X' }` parameters into a specific way depending on the event.

The `processVariableArgumentsNamesStep` is parsing the "variable arguments" of the command. For instance, the `coveoua("send", "event")` can accept multiple optional variables which must be mapped to values. These mappings are added with hooks from the plugins with the `addEventTypeMapping` method. Given the following code:

```ts
this.client.addEventTypeMapping(ECPluginEventTypes.event, {
    newEventType: EventType.collect,
    variableLengthArgumentsNames: ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'],
    addVisitorIdParameter: true,
    usesMeasurementProtocol: true,
});
```

This tells the client that an `event` (`coveoua("send", "event)`) can accept 4 parameters (`eventCategory`, and so on).

`addVisitorIdParameter` tells the script to append the visitorId, and `useMeasurementProtocol` tells to map use the measurement protocol mapper.

So in the end, `coveoua("send", "event", "category", "action")` will be mapped into the following parameters: `{ eventCategory: "category", eventAction: "action" }`.

The next steps are `addVisitorIdStep`, `setAnonymousUserStep`, which pretty self-explanatory.

The last one is `processBeforeSendHooksStep`, this steps is it's own "pipeline" where every `beforeSendHooks` will accept the payload and return a new one. You can technically register any event in this hook to preprocess it. The plugins append their own data by using these (see `registerBeforeSendEventHook` references)

If you try to use `client.getParameters()`, it will return the current parameters for the call you plan on sending. At this point, you can observe all the `location`, `visitorId`, and everything else that are currently set by the method calls.

But this data is not yet ready to be sent to the Usage Analytics endpoint, which is why we must process it into a _payload_.

#### resolvePayload

The job here is to take the current parameter and process them for the endpoint.

It functions in a similar "pipeline" way, where each function processes the payload in some way.

We first `cleanPayloadStep` to remove empty values, then `validateParams` to validate the parameters that only accept a couple of values, then we convert the parameters into the measurement protocol format with `processMeasurementProtocolConversionStep`. We validate that those values all follow the measurement protocol format with `removeUnknownParameters`. The `processCustomParameters` then takes care of "unfolding" any `custom` value in the payload.

The `client.getPayload()` method will give you the result of this step, which should have (almost) all keys in the Measurement Protocol format (the exception being the "Coveo Extension Keys", see section related to that)

#### afterSendHooks

After the event is sent, you can use your own hook to do something with the payload. The `registerAfterSendEventHook` method is there for you.

### Key Mapping, and Coveo Extensions

Some keys are part of the Measurement Protocol and are carefully separated for clarity.

The `baseMeasurementProtocolMapper` includes the mappings to be done for every plugin. `coveoExtensionsKeys` are keys that are "passthrough", meaning that sending `coveoua("send", "event", { "tab": 'x'})` will result in `tab: 'x'` in the final payload.

`commerceMeasurementProtocolMapper` contains all the data to map product, impressions and other commerce keys. It also has the regex validators to ensure that only valid measurement protocol keys are sent as a payload.

`serviceMeasurementProtocolMapper` is similar, but contains stuff for the Service use case.

### Beacon VS Fetch, and the buffer

If you try to send an event with `fetch` and a redirection happens, the event will get canceled because the browser waits for the response and it will never actually send the event. To fix this, you need to use `navigator.sendBeacon`.

To simplify the whole thing, we introduce a mini-buffer that holds the event.".

The trick here is to flush the buffer with a `setTimeout(flush, 0)` so that the event is sent as soon as the thread is available. But on a `beforeunload` event, triggered when a redirection happen, flush the events with the `beacon`.

This ensures that we use `beacon` on the right occasion, and `fetch` for the rest of the times.
