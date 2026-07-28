# Thermidor schema-contract React sample

This sample proves the client-side path for the v0.9 Thermidor Commerce Catalog contract:

`ACTIVITY_SNAPSHOT` → A2-UI `updateDataModel` → catalog data bindings → local `functionCall` → Thermidor action request → server `updateDataModel`.

Thermidor retains A2-UI activities as opaque `kind` and `payload` values and passes their operations to CopilotKit unchanged. The local `ProductCarousel` and `Cart` renderers receive controller state through standard A2-UI data bindings. Cart interactions invoke the catalog-declared `thermidor.dispatchControllerAction` function, whose generated runtime API validates the controller/action/payload tuple before the React implementation forwards it through Thermidor's authenticated conversation transport.

The function never writes to the A2-UI data model. The cart remains unchanged while the request is pending and updates only after the mock server returns a replacement `updateDataModel`. No A2-UI `event` or `userAction` is emitted for controller mutations.

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

Submit **Show the Thermidor catalog**. The mock streams the catalog example from `thermidor-schema`, including the controller bindings and concrete product-list/cart state. Use **Set demo quantity to 2** and **Clear cart** to exercise both generated cart actions.
