---
title: Commerce Controller hooks
---

# Hooks

This package provides React hooks for controllers defined in the Engine Definition. Hooks allow you to access controller state and methods easily within your React components.
Without these hooks, you would need to manually pass down props through every component or implement your own provider solution, which can be cumbersome and error-prone.

See [Headless commerce usage (SSR): Define the commerce engine and controllers](https://docs.coveo.com/en/obif0156/#define-the-commerce-engine-and-controllers)

## Usage

1. Create an engine configuration

Define the controllers you need in your engine configuration. This example includes `Summary`, `ProductList` and `Cart` controllers:

```
import {
  CommerceEngineDefinitionOptions,
  defineSummary,
  defineProductList,
  defineCart,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless-react/ssr-commerce';

const config : CommerceEngineDefinitionOptions {
    configuration: {
    ...getSampleCommerceEngineConfiguration(),
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList(),
    cart: defineCart(),
  }
}
```

2. Define the engine

Use `defineCommerceEngine` to define the engine with your configuration:

```
export const engineDefinition = defineCommerceEngine(engineConfig);
```

3. Export hooks

Extract hooks for each controller from the engine definition.

```
export const {
  useSummary,
  useProductList,
  useCart
} = engineDefinition.controllers;
```

4. Use Hooks in Components

Access controller methods and state in your components through the hooks.
The controller methods and state attributes exposed through controller hooks are the same as the ones exposed by the controllers.
For details, see the relevant controller [reference documentation](../../modules/SSR_Commerce.index.html).

```
export default function ProductList() {
  const {state, methods} = useProductList();
  const {state: cartState, methods: cartMethods} = useCart();

  return (
    <ul aria-label="Product List">
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <ProductButtonWithImage methods={methods} product={product} />

          <button
            onClick={() => addToCart(cartMethods!, cartState, product, methods)}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
```
