# Headless Custom Context Native

This sample demonstrates how to use the `setCustom()` method on the Headless Commerce `buildContext` controller in vanilla JavaScript.

It showcases [context mappings](https://docs.coveo.com/en/q3bc0472/coveo-for-commerce/use-context-mappings) — custom fields sent at query time that the Commerce API validates and routes to configured destinations.

## Context Mappings Used

This sample assumes the target tracking ID has the following context mappings configured (matching the [List context mappings](https://docs.coveo.com/en/q3bc0472/coveo-for-commerce/use-context-mappings#list-context-mappings) example in the docs):

| Key               | Type           | Destinations                           | Purpose                                 |
| ----------------- | -------------- | -------------------------------------- | --------------------------------------- |
| `fitmentProducts` | `PRODUCT_LIST` | `QUERY_PIPELINE_CONTEXT`               | Filter results to compatible parts      |
| `shoppingIntent`  | `STRING`       | `ML_CONTEXT`, `QUERY_PIPELINE_CONTEXT` | Influence ML relevance + pipeline rules |
| `storeId`         | `STRING`       | `FIELD_ALIASES` (`price_dict`)         | Resolve store-specific pricing          |

## Technology Stack

- **ESM JavaScript** (no build tools)

## Prerequisites

- Node.js 22+

> **NOTE:** Node.js is only required to run the local dev server via `npm start`. The client-side code runs directly in the browser using CDN imports.

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run the server:

   ```bash
   pnpm run start
   ```

3. Open your browser to `http://localhost:3000`

## Usage

1. Select a **Shopping Intent** (e.g., "Fishing", "Camping").
2. Choose a **Store Location** to set the `storeId` for price resolution.
3. Click **Apply Context & Search** to call `setCustom()` and execute a search.

The page shows:

- **Context State** — the full context object including custom values, updated live.
- **Search Results** — products returned by the Commerce API with the applied context.

## How It Works

```js
const contextController = buildContext(engine);

contextController.setCustom({
  shoppingIntent: 'fishing',
  storeId: '10010',
  fitmentProducts: ['SP-00301', 'SP-01202', 'SP-04502'],
});
```

The `setCustom()` call updates `context.custom` in all subsequent Commerce API requests (search, listing, recommendations). The Commerce API validates each value against its configured type and routes it to the specified destinations.
