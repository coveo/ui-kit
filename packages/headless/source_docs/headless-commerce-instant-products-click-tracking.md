---
title: Click tracking for Instant Products
group: Guides
category: Usage Analytics
slug: usage/usage-analytics/instant-products-click-tracking
---

# Click tracking for Instant Products

When building a commerce search experience with [Instant Products](../../../interfaces/Commerce.InstantProducts.html) (product suggestions that appear as the user types), you must use the `InteractiveProduct` sub-controller to track click events.

This article explains why manual event emission doesn't work for Instant Products and provides the recommended implementation approach.

## Why Instant Products require a different approach

For Search and Product Listing controllers, the `responseId` is exposed directly in the controller state.
This means you _could_ manually construct an analytics event payload and emit it via Relay, because you have access to all the required metadata.

The Instant Products controller is different.
It does not expose the `responseId` in its state.
As a result, if you attempt manual event emission (for example, `relay.emit('ec.productClick', ...)`), the `responseId` field will be `undefined`, producing an invalid analytics event.

> [!IMPORTANT]
>
> Do not use manual `relay.emit('ec.productClick', ...)` calls for products returned by the Instant Products controller.
> The required metadata is not available in the controller state for manual construction.

## Recommended approach: the `InteractiveProduct` sub-controller

The [`InteractiveProduct`](../../../interfaces/Commerce.InteractiveProduct.html) sub-controller is available on the Instant Products controller via the [`interactiveProduct`](../../../interfaces/Commerce.InstantProducts.html#interactiveproduct-1) method.

When you call `select()` on this sub-controller, it automatically:

- Attaches the correct `responseId` from the underlying product suggestion response.
- Includes all required product metadata in the analytics event.
- Logs a valid click event through the [Event Protocol](https://docs.coveo.com/en/o9je0592/).

This is the same `InteractiveProduct` pattern used for Search and Product Listing controllers, but it's **required** for Instant Products because the metadata cannot be assembled manually.

## Implementation

Use the `interactiveProduct` method on the `InstantProducts` controller, passing the product the user clicked, and then call `select()`.

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

A common implementation error is to reuse the same manual Relay emission pattern that works for Search and Product Listing:

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

The above code fails because `instantProductsState.responseId` does not exist.
The `responseId` for product suggestions is managed internally by Headless and is only accessible through the `InteractiveProduct` sub-controller.

> [!IMPORTANT]

> Always use the `interactiveProduct` sub-controller to ensure valid analytics events.

```typescript
// ✅ CORRECT: Use the InteractiveProduct sub-controller
controller.interactiveProduct({options: {product}}).select();
```

## Summary

| Controller       | `responseId` in state | Manual event emission       | `InteractiveProduct` sub-controller |
| ---------------- | --------------------- | --------------------------- | ----------------------------------- |
| Search           | ✅ Yes                | Works (but not recommended) | ✅ Recommended                      |
| Product Listing  | ✅ Yes                | Works (but not recommended) | ✅ Recommended                      |
| Instant Products | ❌ No                 | ❌ Produces invalid events  | ✅ Required                         |

## Related resources

- [Displaying products (CSR)](https://docs.coveo.com/en/o8ce0239/) — Covers the `InteractiveProduct` pattern for Search and Listing
- [Implement filter suggestions and instant products (CSR)](https://docs.coveo.com/en/o8ce0240/) — Full Instant Products implementation guide
- [Event tracking with Headless (CSR)](https://docs.coveo.com/en/p3qc4311/) — Overview of commerce event tracking
- [`InstantProducts` interface reference](../../../interfaces/Commerce.InstantProducts.html)
- [`InteractiveProduct` interface reference](../../../interfaces/Commerce.InteractiveProduct.html)
