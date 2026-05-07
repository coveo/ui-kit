---
title: Click tracking for Instant Products
group: Guides
category: Usage Analytics
slug: usage/usage-analytics/instant-products-click-tracking
---

# Click tracking for Instant Products

When building a commerce search experience with [Instant Products](../../../interfaces/Commerce.InstantProducts.html) (product suggestions that appear as the user types), use the `InteractiveProduct` sub-controller to track click events.

## How click tracking works for Instant Products

The [`InteractiveProduct`](../../../interfaces/Commerce.InteractiveProduct.html) sub-controller is available on the Instant Products controller via the [`interactiveProduct`](../../../interfaces/Commerce.InstantProducts.html#interactiveproduct-1) method.

When you call `select()` on this sub-controller, it automatically:

- Attaches the correct `responseId` from the underlying product suggestion response.
- Includes all required product metadata in the analytics event.
- Logs a valid click event through the [Event Protocol](https://docs.coveo.com/en/o9je0592/).

This is the same `InteractiveProduct` pattern used for Search and Product Listing controllers.

## Implementation

Use the `interactiveProduct` method on the `InstantProducts` controller, passing the product the user clicked, then call `select()`.

### Basic usage

{ @includeCode ../../../samples/headless/commerce-react/src/components/instant-products/actions/on-click-product.ts }

### React component example

The following example demonstrates a complete Instant Products component that correctly tracks click events:

{ @includeCode ../../../samples/headless/commerce-react/src/components/instant-products/instant-products.tsx }

[View the full example on GitHub](https://github.com/coveo/ui-kit/blob/main/samples/headless/commerce-react/src/components/instant-products/instant-products.tsx)

### Handling delayed selections

The `InteractiveProduct` sub-controller also supports [`beginDelayedSelect`](../../../interfaces/Commerce.InteractiveProduct.html#begindelayedselect) and [`cancelPendingSelect`](../../../interfaces/Commerce.InteractiveProduct.html#cancelpendingselect) for hover interactions where you want to track a selection only if the user lingers on a product long enough:

{ @includeCode ../../../samples/headless/commerce-react/src/components/instant-products/actions/on-delayed-select-product.ts }

## Common mistake: reusing the Search/Listing analytics pattern

A common implementation error is to attempt manually emitting an `ec.productClick` event using the product data from Instant Products state:

```typescript
// ❌ WRONG: This does NOT work for Instant Products
const product = instantProductsState.products[0];
relay.emit('ec.productClick', {
  product: {
    productId: product.ec_product_id,
    name: product.ec_name,
    price: product.ec_price,
  },
  responseId: instantProductsState.responseId, // undefined!
});
```

This fails because `instantProductsState.responseId` does not exist — the `responseId` for product suggestions is managed internally by Headless and is only accessible through the `InteractiveProduct` sub-controller.

Always use the `interactiveProduct` sub-controller instead:

```typescript
// ✅ CORRECT
controller.interactiveProduct({options: {product}}).select();
```

## Related resources

- [Displaying products (CSR)](https://docs.coveo.com/en/o8ce0239/) — Covers the `InteractiveProduct` pattern for Search and Listing
- [Implement filter suggestions and instant products (CSR)](https://docs.coveo.com/en/o8ce0240/) — Full Instant Products implementation guide
- [Event tracking with Headless (CSR)](https://docs.coveo.com/en/p3qc4311/) — Overview of commerce event tracking
- [`InstantProducts` interface reference](../../../interfaces/Commerce.InstantProducts.html)
- [`InteractiveProduct` interface reference](../../../interfaces/Commerce.InteractiveProduct.html)
