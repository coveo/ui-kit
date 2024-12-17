---
title: Hooks
---

# Hooks

This package provides React hooks for controllers defined in the Engine Definition. Hooks allow you to access controller state and methods easily within your React components.

## Usage

1. Configure the Engine

Define the controllers you need in the engine configuration. This example includes `Summary` and `ProductList` controllers:

```
const config : CommerceEngineDefinitionOptions {
    configuration: {
    ...getSampleCommerceEngineConfiguration(),
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList(),
  }
}
```

2. Create the Engine definition

Use `defineCommerceEngine` to initialize the engine with your configuration:

```
export const engineDefinition = defineCommerceEngine(engineConfig);
```

3. Export Hooks

Extract hooks for each controller from the engine definition. These hooks expose state and methods:

```
export const {
  useSummary,
  useProductList,
} = engineDefinition.controllers;
```

4. Use Hooks in Components

Access controller state and methods in your components and render UI accordingly:

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
