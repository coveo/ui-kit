# Implementation Analysis: Option A vs Option B

## Context

This analysis compares two approaches for structuring the public A2-UI/AG-UI contract schema in Thermidor, from the consumer implementation perspective (`demo-schema-react`).

- **Option A**: The schema exposes controllers (with `controllerId` + `controllerSchema`) on each component. The renderer is responsible for resolving its own state.
- **Option B**: The schema exposes `state` and `actions` directly on the component, with no controller concept. On the SDK side, `buildRemoteController` still exists to encapsulate resolution, validation, and dispatch.

The goal is to verify that **all aspects covered by Option A are covered by Option B**, with the same level of guarantees.

### Key point: the controller is an SDK concept, not a schema concept

The SDK controller **exists in both options**. What changes is only what the public schema exposes:

|                           | Option A                                                                                  | Option B                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Schema exposes            | `controllerId` + `controllerSchema` (which defines state + actions)                       | `state` + `actions` directly                                                                 |
| Transport identifiers     | `controllerId` (in the public schema, also serves as correlation)                         | `surfaceId` (transport correlation) + `componentId` (component type)                         |
| SDK exposes               | `buildRemoteController`                                                                   | `buildRemoteController` (same API, renamed params)                                           |
| Consumer uses             | `useAdvertisedController(source, props.controllers.X)`                                    | `useRemoteController(source, surfaceId, componentId)`                                        |
| Contract resolution       | Server sends `controllerSchema` (URI) → runtime lookup in `ControllerContractsSchema`     | Server sends `componentId` (type) → automatic lookup in `ComponentContractsSchema`           |

---

## Transport vocabulary

| Identifier    | Role                                                                                                     | Sent in                                                    | Visible to the consumer? |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| `surfaceId`   | Unique per-instance identifier. Correlates `updateComponents` ↔ `updateDataModel`. Key in the data model. | Both messages (`updateComponents` and `updateDataModel`)   | Yes (passed to SDK)      |
| `componentId` | Component type (`"Cart"`, `"ProductCarousel"`). Used to resolve the Zod contract.                        | `updateComponents`                                         | Yes (passed to SDK)      |

---

## SDK API: `buildRemoteController` in both options

### Option A (today)

The server sends `controllerId` + `controllerSchema` in the component props. The consumer passes them to `buildRemoteController`:

```typescript
// The contract and identifier come from the schema (component props)
const controller = buildRemoteController({
  source,
  controllerId: props.controllers.cartController.controllerId,
  contract: props.controllers.cartController.controllerSchema,
});

controller.state;  // CartState | undefined (validated by Zod)
controller.dispatch('updateItemQuantity', {item: {...}});  // typed + validated
```

The SDK performs a runtime lookup in `ControllerContractsSchema` (discriminated union on `controllerSchema`) to find the Zod object corresponding to the URI.

### Option B

The server sends `surfaceId` + `componentId` in the `updateComponents` message. The consumer retrieves them via the renderer props (injected by the A2-UI framework). The SDK resolves the contract **automatically** via `componentId`:

```typescript
// surfaceId = unique per-instance identifier (key in the data model)
// componentId = "Cart" → automatic Zod contract lookup in ComponentContractsSchema
const controller = buildRemoteController({
  source,
  surfaceId: props.surfaceId,
  componentId: props.componentId,
});

controller.state;  // CartState | undefined (validated by Zod via the resolved contract)
controller.dispatch('updateItemQuantity', {item: {...}});  // typed + validated
```

The SDK performs an automatic lookup in `ComponentContractsSchema` (discriminated union on `componentId`) — the consumer no longer passes a `contract` explicitly.

**Same encapsulation.** The `RemoteController` handles:

- State resolution from the snapshot (indexed by `surfaceId`)
- Contract lookup via `componentId`
- Zod state validation
- Reference-based cache
- Reactive subscribe
- Dispatch with payload validation + routing

---

## 1. State resolution

### Option A

```tsx
ProductCarousel: ({props}) => {
  const controller = useAdvertisedController(stateSource, props.controllers.productListController);
  const products = controller.state?.products ?? [];
};
```

The renderer knows `controllerId` and `controllerSchema` — they come from its props (public schema).

### Option B

```tsx
ProductCarousel: ({props}) => {
  const controller = useRemoteController(stateSource, props.surfaceId, props.componentId);
  const products = controller.state?.products ?? [];
};
```

The renderer receives a `surfaceId` (key in the data model) and a `componentId` (component type). The SDK resolves the contract automatically.

**Covered** ✅ — Same `buildRemoteController` under the hood. Resolution is identical.

---

## 2. Runtime validation (Zod)

Identical in both options. The `RemoteController` validates state with the Zod contract on each `.state` access:

```typescript
get state() {
  const rawState = selectRemoteControllerState(this.source.state, this.surfaceId);
  if (rawState === this.#lastRawState) return this.#lastValidatedState;
  this.#lastRawState = rawState;
  const result = this.contract.shape.state.safeParse(rawState);
  this.#lastValidatedState = result.success ? result.data : undefined;
  return this.#lastValidatedState;
}
```

**Covered** ✅ — No change in the validation mechanism.

---

## 3. Cache / memoization

Identical. The reference-based cache (`#lastRawState` / `#lastValidatedState`) lives in the `RemoteController`. No change.

**Covered** ✅

---

## 4. Reactive subscription (subscribe / re-render)

Identical. `RemoteController.subscribe()` is framework-agnostic. The consumer-side React hook (`useRemoteController`) uses `useSyncExternalStore` to connect to the render cycle.

**Covered** ✅

---

## 5. State type-safety

### Option A

The type is inferred from the `controllerSchema` (URI) passed as a generic. The lookup in `ControllerContractsSchema` resolves the type:

```typescript
RemoteController<'https://schema.thermidor.coveo.com/controllers/cart.schema.json'>;
// → state: CartState | undefined
```

### Option B

The type is inferred from the `componentId` passed as a generic. The lookup in `ComponentContractsSchema` resolves the type:

```typescript
const controller = buildRemoteController({
  source,
  surfaceId: props.surfaceId,
  componentId: props.componentId, // e.g.: "Cart" → infers CartState
});
// → controller.state: CartState | undefined
```

**Covered** ✅ — Same TS inference mechanism, different discriminant.

---

## 6. Action type-safety

Identical. `controller.dispatch('actionName', payload)` is constrained by the resolved Zod contract — action names and payloads are typed.

**Covered** ✅

---

## 7. Runtime action validation (payload)

Identical. `RemoteController.dispatch()` validates the payload with Zod before sending.

**Covered** ✅

---

## 8. Action routing to the server

### Option A

```typescript
this.source.dispatchAction({
  controllerId: this.controllerId,
  controllerSchema: this.contract.shape.controllerSchema.value,
  action,
  payload: result.data,
});
```

### Option B

```typescript
this.source.dispatchAction({
  surfaceId: this.surfaceId,
  componentId: this.componentId,
  action,
  payload: result.data,
});
```

Same mechanism — identifiers are renamed but dispatch remains identical.

**Covered** ✅

---

## 9. Handling `undefined` state

Identical — `controller.state` returns `TState | undefined`.

**Covered** ✅

---

## 10. Transport correlation (updateComponents ↔ updateDataModel)

### Option A

The server sends `controllerId` in the component props (public schema). The frontend uses it to index `state.controllers[controllerId]`.

### Option B

The server sends `surfaceId` in the `updateComponents` message. The same `surfaceId` is the key in `updateDataModel`. The frontend uses `surfaceId` to index `state.components[surfaceId]`.

**Covered** ✅ — Same mechanism, `surfaceId` replaces `controllerId` as the correlation key.

---

## 11. Runtime discriminant (contract validation)

### Option A

The `controllerSchema` URI is sent by the server in the props. The SDK performs a lookup in the `ControllerContractsSchema` discriminated union:

```typescript
// controllerSchema comes dynamically from the component props
const schemaId = props.controllers.productListController.controllerSchema;
// → 'https://schema.thermidor.coveo.com/controllers/product-list.schema.json'

// Lookup in the discriminated union
const contract = ControllerContractsSchema.options.find(
  (c) => c.shape.controllerSchema.value === schemaId
);
```

### Option B

The `componentId` (component type) is sent by the server in `updateComponents`. The SDK performs a lookup in the `ComponentContractsSchema` discriminated union:

```typescript
// componentId comes from the updateComponents message
const componentId = props.componentId;
// → 'ProductCarousel'

// Lookup in the discriminated union (automatic in the SDK)
const contract = ComponentContractsSchema.options.find(
  (c) => c.shape.componentId.value === componentId
);
```

`ComponentContractsSchema` is auto-generated by the same script as `ControllerContractsSchema`:

```typescript
// @coveo/thermidor-schema — auto-generated
export const ComponentContractsSchema = z.discriminatedUnion('componentId', [
  z.strictObject({
    componentId: z.literal('ProductCarousel'),
    state: ProductListStateSchema,
    actions: ProductListControllerContractActionsSchema,
  }),
  z.strictObject({
    componentId: z.literal('Cart'),
    state: CartStateSchema,
    actions: CartControllerContractActionsSchema,
  }),
  z.strictObject({
    componentId: z.literal('NextActions'),
    state: NextActionsStateSchema,
    actions: NextActionsControllerContractActionsSchema,
  }),
  // ...
]);
export type ComponentContracts = z.infer<typeof ComponentContractsSchema>;
```

**Covered** ✅ — Same pattern (discriminated union + automatic lookup), more natural discriminant (`componentId` vs URI).

---

## Summary

| Aspect                      | Option A                                                         | Option B                                               | Change?                    |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| SDK (`buildRemoteController`) | ✅                                                             | ✅                                                     | Params renamed             |
| Zod state validation        | ✅                                                               | ✅                                                     | None                       |
| Reference-based cache       | ✅                                                               | ✅                                                     | None                       |
| Reactive subscribe          | ✅                                                               | ✅                                                     | None                       |
| State type-safety           | Via `controllerSchema` generic                                   | Via `componentId` generic                              | Different discriminant     |
| Action type-safety          | `dispatch<TAction>`                                              | `dispatch<TAction>`                                    | None                       |
| Payload validation          | Zod in `dispatch()`                                              | Zod in `dispatch()`                                    | None                       |
| Server routing              | `controllerId` + `controllerSchema`                              | `surfaceId` + `componentId`                            | Names changed              |
| Instance identifier source  | `controllerId` (public schema)                                   | `surfaceId` (A2-UI transport)                          | **Changed**                |
| Contract resolution         | `controllerSchema` URI → lookup in `ControllerContractsSchema`   | `componentId` → lookup in `ComponentContractsSchema`   | **Changed**                |
| Public schema               | Exposes `controllers` with `controllerId` + `controllerSchema`   | Exposes `state` + `actions` directly                   | **Changed**                |

---

## Concrete changes in `demo-schema-react`

### Transport messages

```diff
 // updateComponents — describes the component
 {
-  "surfaceId": "s1",
-  "components": [{
-    "type": "ProductCarousel",
-    "props": {
-      "controllers": {
-        "productListController": {
-          "controllerId": "product-list-1",
-          "controllerSchema": "https://schema.thermidor.coveo.com/controllers/product-list.schema.json"
-        }
-      }
-    }
-  }]
+  "surfaceId": "s1",
+  "componentId": "ProductCarousel",
+  "components": [...]
 }

 // updateDataModel — the state (indexed by surfaceId)
 {
   "surfaceId": "s1",
   "path": "/",
-  "value": { "products": [...] }
+  "value": { "products": [...] }
 }
```

### Consumer hook (`a2ui/controllers.tsx`)

```diff
-// Option A — controllerId and controllerSchema come from props
-export function useAdvertisedController<TSchema extends RemoteControllerSchemaId>(
-  source: RemoteControllerSource,
-  {controllerId, controllerSchema: contract}: {controllerId: string; controllerSchema: TSchema}
-) {
-  return useMemo(() => buildRemoteController({source, controllerId, contract}), [...]);
-}

+// Option B — surfaceId and componentId come from props, contract resolved automatically
+export function useRemoteController<TComponentId extends ComponentId>(
+  source: RemoteControllerSource,
+  surfaceId: string,
+  componentId: TComponentId
+) {
+  return useMemo(() => buildRemoteController({source, surfaceId, componentId}), [...]);
+}
```

### Catalog (`a2ui/components.tsx`)

```diff
 ProductCarousel: ({props}) => {
-  const controller = useAdvertisedController(stateSource, props.controllers.productListController);
+  const controller = useRemoteController(stateSource, props.surfaceId, props.componentId);
   const products = controller.state?.products ?? [];
 }

 Cart: ({props}) => {
-  const controller = useAdvertisedController(stateSource, props.controllers.cartController);
+  const controller = useRemoteController(stateSource, props.surfaceId, props.componentId);
   const items = controller.state?.items ?? [];
 }
```

### Props schemas (`a2ui/components.tsx`)

```diff
-export const productCarouselPropsSchema = z.strictObject({
-  controllers: z.strictObject({
-    productListController: z.strictObject({
-      controllerId: z.string(),
-      controllerSchema: z.literal(PRODUCT_LIST_SCHEMA_ID),
-    }),
-  }),
-});

+export const productCarouselPropsSchema = z.strictObject({
+  surfaceId: z.string(),
+  componentId: z.literal("ProductCarousel"),
+});

-export const cartPropsSchema = z.strictObject({
-  controllers: z.strictObject({
-    cartController: z.strictObject({
-      controllerId: z.string(),
-      controllerSchema: z.literal(CART_SCHEMA_ID),
-    }),
-  }),
-});

+export const cartPropsSchema = z.strictObject({
+  surfaceId: z.string(),
+  componentId: z.literal("Cart"),
+});
```

### Impacted files

| File                                      | Change                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `a2ui/controllers.tsx`                    | `useAdvertisedController` → `useRemoteController` (signature: `surfaceId` + `componentId`)                                   |
| `a2ui/components.tsx`                     | Simplified renderers. Simplified props schemas. No more `SCHEMA_ID` constant imports.                                        |
| `@coveo/thermidor` (remote-controller.ts) | Renamed params (`surfaceId` + `componentId`). Lookup via `ComponentContractsSchema` instead of `ControllerContractsSchema`.   |
| `@coveo/thermidor-schema`                 | `ControllerContractsSchema` → `ComponentContractsSchema` (discriminant = `componentId`). Auto-generated.                     |

---

## Responsibilities and package boundaries

| Responsibility                                                                   | Package                                                         | Changes with Option B?                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| `buildRemoteController` (resolution + validation + cache + subscribe + dispatch) | `@coveo/thermidor`                                              | Renamed params, lookup via `componentId`           |
| `ComponentContractsSchema` (contract registry)                                   | `@coveo/thermidor-schema`                                       | **New** (replaces `ControllerContractsSchema`)     |
| `useRemoteController` (React hook)                                               | Consumer (`a2ui/controllers.tsx`)                               | Simplified signature                               |
| A2-UI component props schemas                                                    | Consumer (`a2ui/components.tsx`)                                | Simplified (`surfaceId` + `componentId`)           |
| Contract resolution (componentId → Zod schema mapping)                           | `@coveo/thermidor` (automatic via `ComponentContractsSchema`)   | Consumer no longer does any mapping                |

**`@coveo/thermidor` remains framework-agnostic.** The consumer no longer passes a contract explicitly — it provides a `surfaceId` and a `componentId`, the SDK does the rest.

---

## Conclusion

Option B changes the **public schema** (no more `controllers`) and the **resolution key** (`componentId` instead of `controllerSchema` URI), but preserves the same SDK architecture:

1. **Public schema** — exposes `state` + `actions` directly on the component
2. **Transport** — uses `surfaceId` (correlation) + `componentId` (type) instead of `controllerId` + `controllerSchema`
3. **SDK** — resolves the contract automatically via `componentId` → `ComponentContractsSchema`
4. **Consumer** — no longer manages mapping or contract imports. Passes `surfaceId` + `componentId` to the hook, the SDK handles the rest.

The simplification benefits:

- The **public schema** (flatter, fewer concepts)
- The **consumer** (no contract to import/map, just two props)
- **External consumers** (who are not forced to adopt the controller concept)
