# Thermidor schema-contract React sample

This sample proves the client-side path for the v0.9 Thermidor Commerce Catalog contract:

`ConverseController` → normalized Thermidor `Activity` → sample-owned A2-UI adapter → sample-owned component catalog.

Thermidor only exposes opaque activity `kind` and `payload` values. The sample is the layer that recognizes the `a2ui-surface` kind and renders the `ProductCarousel` and `Cart` components advertised by the schema catalog.

## Run with the contract mock

From `integration/ui-kit`, start the mock API in one terminal:

```bash
pnpm --filter @coveo/mock-converse-api build
pnpm --filter @coveo/mock-converse-api start
```

Copy `.env.example` to `.env`, fill the Coveo configuration values, then start the sample in another terminal:

```bash
pnpm --filter @samples/thermidor-schema-contract-react dev:mock
```

Submit **Show the Thermidor catalog**. The mock streams the catalog example from `thermidor-schema`, including the controller advertisements and concrete product-list/cart state.
