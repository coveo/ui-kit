# Implementation Analysis: Option A vs Option B

## Context

This analysis compares two approaches for structuring the public A2-UI/AG-UI contract schema in Thermidor, from the consumer implementation perspective (`demo-schema-react`).

- **Option A**: The schema exposes controllers (with `controllerId` + `controllerSchema`) on each component. The renderer is responsible for resolving its own state.
- **Option B**: The schema exposes `state` and `actions` directly on the component, with no controller concept. On the SDK side, `buildRemoteController` still exists to encapsulate resolution, validation, and dispatch.

The goal is to verify that **all aspects covered by Option A are covered by Option B**, with the same level of guarantees.

### Key point: the controller is an SDK concept, not a schema concept

The SDK controller **exists in both options**. What changes is only what the public schema exposes:

|                       | Option A                                                                              | Option B                                                                             |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Schema exposes        | `controllerId` + `controllerSchema` (which defines state + actions)                   | `state` + `actions` directly                                                         |
| Transport identifiers | `controllerId` (in the public schema, also serves as correlation)                     | `componentId` (globally unique, correlation) + `componentType` (contract)            |
| SDK exposes           | `buildRemoteController`                                                               | `buildRemoteController` (same API, renamed params)                                   |
| Consumer uses         | `useAdvertisedController(source, props.controllers.X)`                                | `useRemoteController(source, componentId, componentType)`                            |
| Contract resolution   | Server sends `controllerSchema` (URI) → runtime lookup in `ControllerContractsSchema` | Server sends `componentType` (type) → automatic lookup in `ComponentContractsSchema` |

---

## Transport vocabulary

| Identifier      | Role                                                                                                                                                                         | Sent in                                                             | Visible to the consumer?                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| `surfaceId`     | Unique per-surface identifier. Used for A2-UI composition (layout grouping). Not used in AG-UI state indexing or SDK API.                                                    | A2-UI (`updateComponents`)                                          | No (A2-UI composition only, not passed to SDK) |
| `componentId`   | Globally unique identifier for a component instance. The `id` field from the component node in `createSurface`/`updateComponents`. Serves as the sole state correlation key. | A2-UI (`updateComponents`) and AG-UI (`StateSnapshot`/`StateDelta`) | Yes (passed to SDK)                            |
| `componentType` | Component type (`"Cart"`, `"ProductCarousel"`). Used to resolve the Zod contract.                                                                                            | A2-UI (`updateComponents`)                                          | Yes (passed to SDK)                            |

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

The server assigns a globally unique `componentId` to each component instance in the `updateComponents` message. The consumer retrieves it via the renderer props (injected by the A2-UI framework). The SDK resolves the contract **automatically** via `componentType`:

```typescript
// componentId = globally unique identifier (the `id` field from the component node)
// componentType = "Cart" → automatic Zod contract lookup in ComponentContractsSchema
const controller = buildRemoteController({
  source,
  componentId: props.componentId,
  componentType: props.componentType,
});

controller.state;  // CartState | undefined (validated by Zod via the resolved contract)
controller.dispatch('updateItemQuantity', {item: {...}});  // typed + validated
```

The SDK performs an automatic lookup in `ComponentContractsSchema` (discriminated union on `componentType`) — the consumer no longer passes a `contract` explicitly.

**Same encapsulation.** The `RemoteController` handles:

- State resolution from the snapshot (indexed by `componentId`)
- Contract lookup via `componentType`
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
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const products = controller.state?.products ?? [];
};
```

The renderer receives a `componentId` (globally unique instance identifier) and a `componentType` (component type). The SDK resolves the contract automatically.

**Covered** ✅ — Same `buildRemoteController` under the hood. Resolution is identical.

---

## 2. Runtime validation (Zod)

Identical in both options. The `RemoteController` validates state with the Zod contract on each `.state` access:

```typescript
get state() {
  const rawState = selectRemoteControllerState(this.source.state, this.componentId);
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

The type is inferred from the `componentType` passed as a generic. The lookup in `ComponentContractsSchema` resolves the type:

```typescript
const controller = buildRemoteController({
  source,
  componentId: props.componentId,
  componentType: props.componentType, // e.g.: "Cart" → infers CartState
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
  componentId: this.componentId,
  componentType: this.componentType,
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

## 10. Transport correlation (A2-UI `updateComponents` ↔ AG-UI `StateSnapshot`)

### Option A

The server sends `controllerId` in the component props (public schema). The frontend uses it to index `state.controllers[controllerId]`.

### Option B

The server assigns a globally unique `componentId` to each component instance (the `id` field on component nodes in `createSurface`/`updateComponents`). The `componentId` serves as the sole correlation key in the AG-UI state structure. The AG-UI `StateSnapshot` carries state indexed by `componentId`:

```json
{"type": "StateSnapshot", "snapshot": {"components": {"carousel-1": {"products": [...]}}}}
```

Subsequent `StateDelta` events use JSON Patch paths that include the `componentId`:

```json
{"type": "StateDelta", "delta": [{"op": "replace", "path": "/components/carousel-1/products", "value": [...]}]}
```

The frontend uses the `componentId` to index `state.components[componentId]`.

**Covered** ✅ — Same mechanism, `componentId` replaces `controllerId` as the correlation key.

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

The `componentType` (component type) is sent by the server in `updateComponents`. The SDK performs a lookup in the `ComponentContractsSchema` discriminated union:

```typescript
// componentType comes from the updateComponents message
const componentType = props.componentType;
// → 'ProductCarousel'

// Lookup in the discriminated union (automatic in the SDK)
const contract = ComponentContractsSchema.options.find(
  (c) => c.shape.componentType.value === componentType
);
```

`ComponentContractsSchema` is auto-generated by the same script as `ControllerContractsSchema`:

```typescript
// @coveo/thermidor-schema — auto-generated
export const ComponentContractsSchema = z.discriminatedUnion('componentType', [
  z.strictObject({
    componentType: z.literal('ProductCarousel'),
    state: ProductListStateSchema,
    actions: ProductListControllerContractActionsSchema,
  }),
  z.strictObject({
    componentType: z.literal('Cart'),
    state: CartStateSchema,
    actions: CartControllerContractActionsSchema,
  }),
  z.strictObject({
    componentType: z.literal('NextActions'),
    state: NextActionsStateSchema,
    actions: NextActionsControllerContractActionsSchema,
  }),
  // ...
]);
export type ComponentContracts = z.infer<typeof ComponentContractsSchema>;
```

**Covered** ✅ — Same pattern (discriminated union + automatic lookup), more natural discriminant (`componentType` vs URI).

---

## Summary

| Aspect                        | Option A                                                       | Option B                                               | Change?                |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| SDK (`buildRemoteController`) | ✅                                                             | ✅                                                     | Params renamed         |
| Zod state validation          | ✅                                                             | ✅                                                     | None                   |
| Reference-based cache         | ✅                                                             | ✅                                                     | None                   |
| Reactive subscribe            | ✅                                                             | ✅                                                     | None                   |
| State type-safety             | Via `controllerSchema` generic                                 | Via `componentType` generic                            | Different discriminant |
| Action type-safety            | `dispatch<TAction>`                                            | `dispatch<TAction>`                                    | None                   |
| Payload validation            | Zod in `dispatch()`                                            | Zod in `dispatch()`                                    | None                   |
| Server routing                | `controllerId` + `controllerSchema`                            | `componentId` + `componentType`                        | Names changed          |
| Instance identifier source    | `controllerId` (public schema)                                 | `componentId` (globally unique, from A2-UI transport)  | **Changed**            |
| Contract resolution           | `controllerSchema` URI → lookup in `ControllerContractsSchema` | `componentType` → lookup in `ComponentContractsSchema` | **Changed**            |
| Public schema                 | Exposes `controllers` with `controllerId` + `controllerSchema` | Exposes `state` + `actions` directly                   | **Changed**            |

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
+  "components": [
+    {"id": "carousel-1", "component": "ProductCarousel"},
+    {"id": "actions-1", "component": "NextActionsBar"}
+  ]
 }

-// updateDataModel — the state (indexed by controllerId)
+// AG-UI StateSnapshot — the state (indexed by componentId, globally unique)
 {
-  "controllers": {
-    "product-list-1": { "products": [...] }
-  }
+  "type": "StateSnapshot",
+  "snapshot": {
+    "components": {
+      "carousel-1": { "products": [...] }
+    }
+  }
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

+// Option B — componentId and componentType come from props, contract resolved automatically
+export function useRemoteController<TComponentType extends ComponentType>(
+  source: RemoteControllerSource,
+  componentId: string,
+  componentType: TComponentType
+) {
+  return useMemo(() => buildRemoteController({source, componentId, componentType}), [...]);
+}
```

### Catalog (`a2ui/components.tsx`)

```diff
 ProductCarousel: ({props}) => {
-  const controller = useAdvertisedController(stateSource, props.controllers.productListController);
+  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
   const products = controller.state?.products ?? [];
 }

 Cart: ({props}) => {
-  const controller = useAdvertisedController(stateSource, props.controllers.cartController);
+  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
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
+  componentId: z.string(),
+  componentType: z.literal("ProductCarousel"),
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
+  componentId: z.string(),
+  componentType: z.literal("Cart"),
+});
```

### Impacted files

| File                                      | Change                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `a2ui/controllers.tsx`                    | `useAdvertisedController` → `useRemoteController` (signature: `componentId` + `componentType`)                                  |
| `a2ui/components.tsx`                     | Simplified renderers. Simplified props schemas. No more `SCHEMA_ID` constant imports.                                           |
| `@coveo/thermidor` (remote-controller.ts) | Renamed params (`componentId` + `componentType`). Lookup via `ComponentContractsSchema` instead of `ControllerContractsSchema`. |
| `@coveo/thermidor-schema`                 | `ControllerContractsSchema` → `ComponentContractsSchema` (discriminant = `componentType`). Auto-generated.                      |

---

## Responsibilities and package boundaries

| Responsibility                                                                   | Package                                                       | Changes with Option B?                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `buildRemoteController` (resolution + validation + cache + subscribe + dispatch) | `@coveo/thermidor`                                            | Renamed params, lookup via `componentType`     |
| `ComponentContractsSchema` (contract registry)                                   | `@coveo/thermidor-schema`                                     | **New** (replaces `ControllerContractsSchema`) |
| `useRemoteController` (React hook)                                               | Consumer (`a2ui/controllers.tsx`)                             | Simplified signature                           |
| A2-UI component props schemas                                                    | Consumer (`a2ui/components.tsx`)                              | Simplified (`componentId` + `componentType`)   |
| Contract resolution (componentType → Zod schema mapping)                         | `@coveo/thermidor` (automatic via `ComponentContractsSchema`) | Consumer no longer does any mapping            |

**`@coveo/thermidor` remains framework-agnostic.** The consumer no longer passes a contract explicitly — it provides a `componentId` and a `componentType`, the SDK does the rest.

---

## Conclusion

Option B changes the **public schema** (no more `controllers`) and the **resolution key** (`componentType` instead of `controllerSchema` URI), but preserves the same SDK architecture:

1. **Public schema** — exposes `state` + `actions` directly on the component
2. **Transport** — uses `componentId` (correlation) + `componentType` (type) instead of `controllerId` + `controllerSchema`
3. **SDK** — resolves the contract automatically via `componentType` → `ComponentContractsSchema`
4. **Consumer** — no longer manages mapping or contract imports. Passes `componentId` + `componentType` to the hook, the SDK handles the rest.

The simplification benefits:

- The **public schema** (flatter, fewer concepts)
- The **consumer** (no contract to import/map, just two props)
- **External consumers** (who are not forced to adopt the controller concept)
