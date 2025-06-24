# @coveo/shopify

The `@coveo/shopify` package provides utilities to integrate Shopify with Coveo's commerce engine.

It includes functions to fetch app proxy configurations and build a commerce engine tailored for Shopify.

## Benefits

Using the `@coveo/shopify` package ensures that the commerce engine will activate Shopify Web Pixels by emitting an event that contains everything they need to ensure consistent tracking and personalization across storefronts and pixels.

## Installation

Install the package using npm or yarn:

```bash
npm install @coveo/shopify
# or
yarn add @coveo/shopify
```

## Features

### `init`

Initializes the Coveo Shopify integration to ensure that web pixels work correctly. This function should be called on every page of your Shopify store to maintain consistent tracking and personalization.

The `init` function publishes a custom event with the configuration data that the web pixels need to function properly.

#### Parameters

- `options` (required): A `CoveoShopifyOptions` object containing:
  - `accessToken` (required): The access token for the Coveo API.
  - `organizationId` (required): The organization ID.
  - `environment` (required): The environment configuration ('dev', 'stg', 'prod', etc.).
  - `trackingId` (required): The tracking ID for analytics.

#### Returns

This function doesn't return a value but publishes a custom event that web pixels can listen to.

#### Example

```typescript
import {init} from '@coveo/shopify/utilities';

// Initialize on every page
init({
  accessToken: 'your-access-token',
  organizationId: 'your-org-id',
  environment: 'prod',
  trackingId: 'your-tracking-id',
});
```

#### Usage with App Proxy Configuration

You can combine the `init` function with `fetchAppProxyConfig` to initialize the integration:

```typescript
import {init, fetchAppProxyConfig} from '@coveo/shopify/utilities';

const config = await fetchAppProxyConfig({
  marketId: 'market_123432',
});

init(config);
```

### `fetchAppProxyConfig`

Fetches the app proxy configuration for a given Shopify market.

#### Parameters

- `marketId` (required): The market identifier.
- `appProxyUrl` (optional): The URL of the app proxy. Defaults to `'/apps/coveo'`. Useful if implementing your own custom proxy.

#### Returns

A promise that resolves to an object containing:

- `accessToken`: The access token for the app proxy.
- `organizationId`: The organization ID.
- `environment`: The environment configuration.
- `trackingId`: The tracking ID.

#### Example

```typescript
import {fetchAppProxyConfig} from '@coveo/shopify/headless/commerce';

const config = await fetchAppProxyConfig({
  marketId: 'market_123432',
});
console.log(config);
```

### `buildShopifyCommerceEngine`

Builds a commerce engine instance configured for Shopify.

#### Parameters

- `commerceEngineOptions` (required): Options for the commerce engine.

#### Returns

A configured commerce engine instance.

#### Example

```typescript
<script type="module">
import {buildShopifyCommerceEngine, fetchAppProxyConfig} from 'https://static.cloud.coveo.com/shopify/v1/headless/commerce.esm.js';

const config = await fetchAppProxyConfig({marketId: 'market_123432'});
const engine = buildShopifyCommerceEngine({
  commerceEngineOptions: {
    configuration : {
      accessToken: config.accessToken,
      organizationId: config.organizationId,
      environment: config.environment,
      analytics: {
        enabled: true,
        trackingId: config.trackingId,
      },
      context: {
        country: {{ localization.country.iso_code | json }},
        currency: {{  localization.country.currency.iso_code | json }},
        view: {
          url: {{ canonical_url | json }},
        },
        language: {{ request.locale.iso_code | json }},
        cart: {{ cart.items | json }}.map(function (item) {
          return {
            productId: `gid://shopify/ProductVariant/${item.variant_id}`,
            name: item.title,
            price: item.final_price,
            quantity: item.quantity,
          };
        }),
      }
  },
});
console.log(engine);
</script>
```

**Key constants:**

- `COVEO_SHOPIFY_CONFIG_KEY`: The key for the custom event and cookie used to share app proxy configuration (`coveo_shopify_config`).

---
