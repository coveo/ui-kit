# Thermidor schema-contract React sample

This sample proves the client-side path for the v0.9 Thermidor Commerce Catalog contract:

`AG-UI STATE_SNAPSHOT` → Thermidor Engine state → advertised controller; `ACTIVITY_SNAPSHOT` → raw A2-UI messages → CopilotKit renderer/catalog.

Thermidor normalizes AG-UI state snapshots into the active turn's Engine-backed `agentResponse.state` and retains A2-UI activities as opaque `kind` and `payload` values. The sample passes `a2ui-surface` operations to CopilotKit unchanged. Its local `ProductCarousel` and `Cart` renderers select the matching advertised `controllerId` slice from Thermidor Engine state and subscribe to future Engine updates. CopilotKit provides only renderer and catalog state; it does not replace Thermidor's conversational endpoint or runtime.

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
