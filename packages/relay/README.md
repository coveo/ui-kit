# @coveo/relay

Relay is a compact library for emitting Event Protocol analytics events. It simplifies tracking relevant user interactions. This analytics data powers reports and helps train Coveo Machine Learning models.

## Usage

First, create an instance of Relay in your project. This instance can then be used to emit an event or perform other actions.

```js
import { createRelay } from "@coveo/relay";

const config = {...};
const relay = createRelay(config);

const payload = {...};
relay.emit('itemView', payload);
```

## Official documentation

- [Learn more about Relay](https://docs.coveo.com/en/relay/latest/)
- [List of Event API schemas and reference types](https://docs.coveo.com/en/n9da0377/build-a-search-ui/event-api-reference)
