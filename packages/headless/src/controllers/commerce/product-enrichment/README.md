# Product Enrichment Controller

The Product Enrichment controller manages product badges from the product enrichment API.

## Overview

This controller fetches badges for products based on **placement IDs**. The placement IDs determine what type of badges to fetch from the backend - you don't need to specify badge types directly. The backend uses the placement IDs along with the product context (from `context.product` or `context.cart`) to return the appropriate badges.

## Example Usage

```typescript
import {buildProductEnrichment} from '@coveo/headless/commerce';

// Initialize the controller with placement IDs
const productEnrichmentController = buildProductEnrichment(engine, {
  initialState: {
    placementIds: [
      '1c077416-83bf-4b73-a141-97fe37cb4f32',
      '4330a6cb-7adf-4fbc-b9a7-4379a743a5ee',
    ],
  },
});

// Or initialize without initial state
const productEnrichmentController = buildProductEnrichment(engine);

// Subscribe to state changes
productEnrichmentController.subscribe(() => {
  const state = productEnrichmentController.state;
  
  console.log('Badge placements:', state.badgePlacements);
  console.log('Loading:', state.isLoading);
  console.log('Error:', state.error);
});

// Fetch badges using the configured placement IDs
productEnrichmentController.getBadges();

// Or fetch badges with different placement IDs
productEnrichmentController.getBadges([
## How It Works

### Placement IDs
Placement IDs determine **what type of badges** the backend will return. Each placement ID is configured on the backend to return specific badge types (e.g., "Popular Product", "Hot Deal", "Limited Stock"). You only need to provide the placement IDs - the backend handles the rest.

### Product Context
The controller automatically uses product information from the engine's context:

1. **Product context**: If `context.product.productId` is set, badges will be fetched for that specific product
2. **Cart context**: If `context.cart` array is available, badges will be fetched for all products in the cart

You don't need to provide product IDs to the controller. Make sure to set the appropriate context in your engine before calling `getBadges()`:

placementIds will be used to decide what type of badges to fetch from the backend level. Therefore, we do not need to provide what type of badges to fetch.

Make sure to set the appropriate context in your engine before calling `getBadges()`:

```typescript
// Example: Setting product context
engine.dispatch(setContext({
  product: {
    productId: 'SP01051_00003'
  }
}));

// Example: Setting cart context  
engine.dispatch(setContext({
  cart: [
    {productId: 'PRODUCT_1', quantity: 1},
    {productId: 'PRODUCT_2', quantity: 2}
  ]
}));
```

## State Structure

The controller state contains:

```typescript
interface ProductEnrichmentState {
  badgePlacements: BadgePlacement[];
  isLoading: boolean;
  error: string | null;
}

interface BadgePlacement {
  placementId: string;
  badges: Badge[];
}

interface Badge {
  text: string;
  backgroundColor: string;
  textColor: string;
  iconUrl: string | null;
}
```

## API Request

The controller calls the following endpoint:

```
POST /rest/organizations/<orgId>/commerce/v2/tracking-ids/<trackingId>/badges
```

With the following payload structure:

```json
{
  "language": "en",
  "country": "US",
  "currency": "USD",
  "placementIds": [
    "1c077416-83bf-4b73-a141-97fe37cb4f32"
  ],
  "context": {
    "user": {
      "userAgent": "Mozilla/5.0..."
    },
    "view": {
      "url": "https://acme.com/summersale",
      "referrer": "https://example.com/"
    },
    "cart": [],
    "source": [
      "@coveo/headless@2.61.0"
    ],
    "capture": true,
    "product": {
      "productId": "SP01051_00003"
    }
  }
}
**Key Points:**
- **Placement IDs** control which badge types are returned by the backend
- **Product/Cart context** determines which product(s) the badges apply to
- The `product.productId` or `cart` array is automatically included from the engine's context
- You don't manually specify badge types - the backend configuration for each placement ID handles this

**Note:** The `product.productId` in the context is automatically included from the engine's context. You don't need to provide it to the controller. If a product is set in the context, the backend will use it. If no product is set but a cart array is available, the backend will use the cart to determine which products to fetch badges for.

## API Response

The API returns badge placements for the product:

```json
{
  "products": [
    {
      "productId": "SP01051_00003",
      "badgePlacements": [
        {
          "placementId": "1c077416-83bf-4b73-a141-97fe37cb4f32",
          "badges": [
            {
              "text": "Popular! 63 views today!",
              "backgroundColor": "#1cebcf",
              "textColor": "#ffffff",
              "iconUrl": null
            }
          ]
        }
      ]
    }
  ]
}
```
