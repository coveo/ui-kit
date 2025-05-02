# @coveo/shopify

The `@coveo/shopify` package provides utilities to integrate Shopify with Coveo's commerce engine.

It includes functions to fetch app proxy configurations and build a commerce engine tailored for Shopify.

## Benefits

Using the `@coveo/shopify` package ensures that the commerce engine will emit events using the same `clientId` both inside and outside Shopify Web Pixels. This provides consistent tracking and analytics across the entire Shopify ecosystem.

## Installation

Install the package using npm or yarn:

```bash
npm install @coveo/shopify
# or
yarn add @coveo/shopify
```

## Features

### `fetchAppProxyConfig`

Fetches the app proxy configuration for a given Shopify market.

#### Parameters

- `marketId` (required): The market identifier.
- `appProxyUrl` (optional): The URL of the app proxy. Defaults to `'/apps/coveo'`.

#### Returns

A promise that resolves to an object containing:

- `accessToken`: The access token for the app proxy.
- `organizationId`: The organization ID.
- `environment`: The environment configuration.
- `trackingId`: The tracking ID.

#### Example

```typescript
import {fetchAppProxyConfig} from '@coveo/shopify/headless';

const config = await fetchAppProxyConfig({
  marketId: 'market_123432',
});
console.log(config);
```

### `buildShopifyCommerceEngine`

Builds a commerce engine instance configured for Shopify.

#### Parameters

- `shop` (required): The Shopify shop name.
- `commerceEngineOptions` (required): Options for the commerce engine.
- `environment` (optional): A custom environment configuration (useful for testing & SSR).

#### Returns

A configured commerce engine instance.

#### Example

```typescript
<script type="module">
import {buildShopifyCommerceEngine, fetchAppProxyConfig} from 'https://static.cloud.coveo.com/shopify/v1/headless.esm.js';

const config = await fetchAppProxyConfig({ marketId: 'market_123432' });
const engine = buildShopifyCommerceEngine({
  shop: 'my-shop.shopify.com',
  commerceEngineOptions: {
    configuration: {
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
              productId: item.product_id,
              name: item.title,
              price: item.final_price,
              quantity: item.quantity,
            };
          }),
        }
    },
  },
});
</script>
```

---
