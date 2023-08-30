# Relay

The Relay repository contains a client-side library and set of related tools for sending events from the browser using Coveo's Event protocol. It consists of multiple components:

- The core relay library in `packages/relay`: Relay is an event agnostic library which is responsible for enriching, packaging and sending browser event streams into Coveo's backend.
- The relay playground in `apps/playground`: The playground is a sample webpage that can be used to experiment with and validate Event Protocol payloads.

Relay can be used standalone, or be embedded in Coveo front end packages as the main client-side logging component.

## Relay design principles and scope

The core relay library should adhere to a few core design principles:

- Relay is responsible for handling any concerns that are relevant to generic event logging, including but not limited to:
  - Enriching events with information that is only present in the browser (e.g. userAgent, local time).
  - Tracking and persisting a unique identifier for a user (e.g. clientId)
  - Configuration of and authentication with logging endpoints.
  - Privacy considerations (e.g. do not track, disable logging).
- Relay is event-agnostic, meaning Relay has no knowledge on the contents of specific type of event payload that is being transmitted. It only handles event content, when that content is applicable to all logged events. In practice this means the following:
  - Event modification code is typically confined to the generic 'meta' key only.
  - Relay will not validate or modify events, since it has no knowledge of the content of individual events.
  - Code should **not** contain event-type specific switches: e.g. `if (event_type = <sometype>) then` code is highly suspect.
  - Code should **not** contain line of business specific switches: e.g. `if (lob = service) then` code is highly suspect.
- While Relay provides hooks which can be used to listen to the emission of events, it will not allow you to modify event content prior to logging. In practice, this functionality will be abused to "fix up" payloads or add "business logic" which makes it really hard to reason about payloads.
- Relay supports all relevant Javascript based environments, including cross-browser support, node support and React native support.
- Relay is **not** responsible for storing the TypeScript definitions of individual event types.

## Event structure

The basic event structure for a generic client side event is as follows:

```
{
  <event parameters>
  meta: {
    type: the event type
    <dynamic meta data added by relay>
    config: {
      <static relay config parameters>
    }
   }
}
```

This means an event payload can be freely defined, with the exception of the reserved keyword 'meta', which is exclusively intended to contain event metadata populated by Relay. Prior to logging events with the Coveo platform, ensure that you create appropriate event schemas in the [schema repository](https://github.com/coveo/analytics_schema).

If you want to log information from a Coveo owned backend service, do not use Relay. Instead, log them on the appropriate server side endpoint, see [this guide](https://coveord.atlassian.net/wiki/spaces/DATA/pages/3175383082/Server+side+event+logging)

## API
