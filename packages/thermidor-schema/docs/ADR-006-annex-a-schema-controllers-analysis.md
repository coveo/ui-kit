# Analysis: Controllers in the Public Schema or Not?

## Context

The Thermidor Schema is a shared contract between a backend and a frontend. It describes which UI components exist, what state they expose, and what operations are permitted.

In the `@coveo/thermidor` package, **controllers** are an implementation pattern: they encapsulate selectors that project a global state into slices consumable by component. The question is whether this abstraction should appear in the public schema — the interface contract between the parties.

The schema is currently in the design and implementation phase — there are no public consumers yet. However, once published, the contract is set in stone: any structural change (adding or removing a level) will be a breaking change for consumers.

### The controller in `@coveo/thermidor`: a headless API

In the package, a controller is a **public headless API** exposed to consumers. It follows this contract:

- Exposes a reactive, read-only `state`
- Provides a `subscribe(listener)` to listen for state changes
- Exposes typed domain-specific action methods (e.g., `setQuery()`, `submit()`, `selectPage()`)

This is the mechanism through which a JavaScript/TypeScript consumer observes and modifies application state, without coupling to a UI framework. It is not a business domain entity nor a transport protocol concept — it is an **SDK API layer**.

### Two "controllers" not to confuse

There is a naming ambiguity that must be addressed:

|                        | SDK Controller                                    | Schema Controller                                             |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| **Nature**             | Runtime object instantiated client-side           | JSON structure in the exchange contract                       |
| **Content**            | reactive state + subscribe + action methods       | `{ controllerSchema, state, actions }`                        |
| **Exists if Option B** | Yes — the package continues to expose controllers | No — the contract only exposes state/actions per component    |
| **Consumer**           | Developer using the `@coveo/thermidor` package    | Any party reading the schema (backend, frontend, third-party) |

The SDK controller **will exist regardless of the schema decision**. The question is solely: should the exchange contract reflect this internal package organization?

### Who consumes what?

| Consumer profile                                | What they use                                                                                      | The controller _in the schema_ brings them...                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Consumer via `@coveo/thermidor`                 | The package instantiates SDK controllers. The schema is transparent — the package maps internally. | Nothing additional (mapping is internal)                                                   |
| External consumer (mobile SDK, custom renderer) | Reads the schema directly. Does not use the package or its headless API.                           | An imposed structure they must adopt or traverse without benefit if they want to ignore it |
| Backend (producer)                              | Pushes state, receives actions.                                                                    | An additional envelope level to produce                                                    |

### Note on existing ADRs

ADR-001 defines the hierarchical model with 5 entities (Catalog, Component, Controller, State, Action) and adopts it **without evaluating this structure against alternatives**. No option without controllers is evaluated or rejected. ADR-002, 003, and 004 all include a detailed "Alternatives Considered" section — ADR-001 is the only one that does not.

This analysis aims to fill that gap by explicitly evaluating two approaches:

- **Option A**: The backend returns controllers containing state and actions within components (current design, ADR-001).
- **Option B**: The backend returns state and actions directly on the component, with no notion of controller. Components are identified by a `componentType` discriminant.

---

## Option A: Controllers in the Schema

### Structure

```json
{
  "componentId": "cart",
  "displayName": "Cart",
  "controllers": {
    "cartController": {
      "controllerSchema": "https://schema.thermidor.coveo.com/controllers/cart.schema.json",
      "state": {
        "items": [...]
      },
      "actions": {
        "setItems": { "payload": { ... } },
        "updateItemQuantity": { "payload": { ... } }
      }
    }
  }
}
```

### Advantages

| #   | Advantage                               | Detail                                                                                                                                                                      |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Multi-concern composition               | A component can combine N independent controllers (e.g., a Checkout with cart + shipping + payment). Each concern has its own state and action namespace without collision. |
| 2   | Intra-component reuse                   | The same controller contract can be attached to N components. Note: this need is largely covered by component-level reuse (see dedicated section).                          |
| 3   | Runtime discriminant                    | The `controllerSchema` (constant URI) allows correlating an AG-UI state slice with its validation contract, independently of the component or renderer.                     |
| 4   | Natural macro-state slicing             | The AG-UI state (`controllers[id]`) is already structured by controller. Schema correlation is direct.                                                                      |
| 5   | Alignment with Thermidor implementation | The schema mirrors the internal package structure — no additional mapping between contract and runtime.                                                                     |

### Disadvantages

| #   | Disadvantage                               | Detail                                                                                                                                                                            |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Implementation leak                        | Controllers are a concept from the `@coveo/thermidor` runtime. An external consumer who doesn't use it inherits a structure that serves them no purpose.                          |
| 2   | Indirection without value for the consumer | The consumer must navigate `component → controllers → key → state/actions` to get what they need. If the relationship is 1:1 (the common case), it's noise.                       |
| 3   | Paints the external consumer into a corner | A third-party consumer must adopt the controller/slice structure even if it provides no benefit. The schema forces them to reimplement a resolution mechanism they didn't choose. |
| 4   | Cognitive complexity                       | More concepts to explain and understand: controller, controllerSchema, controller key, slice. Heavier onboarding.                                                                 |
| 5   | Structural noise if always 1:1             | In practice, if every component only has one controller (which is the case today), the intermediate level is systematically superfluous.                                          |
| 6   | Cost for the producer                      | The backend must produce an additional envelope level (the controllers map with its key and `controllerSchema`) for every component, even when the relationship is 1:1.           |

---

## Option B: State and Actions Directly on the Component

### Structure

```json
{
  "componentType": "cart",
  "displayName": "Cart",
  "state": {
    "items": [...]
  },
  "actions": {
    "setItems": { "payload": { ... } },
    "updateItemQuantity": { "payload": { ... } }
  }
}
```

### Advantages

| #   | Advantage                                         | Detail                                                                                                                                            |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Flat and readable schema                          | Fewer levels, direct navigation: `component.state`, `component.actions.setItems`.                                                                 |
| 2   | Direct correspondence with the observable surface | The schema describes exactly what travels on the wire. One component = one state = its actions. No intermediate concept.                          |
| 3   | Optimal DX for the consumer                       | No abstraction to traverse. The consumer reads the schema and immediately knows what to receive and what to emit.                                 |
| 4   | Separation of contract/implementation             | The contract remains a pure interface. The fact that Thermidor builds the state via controllers/selectors is a detail the schema does not expose. |
| 5   | Minimal onboarding                                | Three concepts suffice: Catalog, Component, Action. No need to explain what a controller is or why it exists.                                     |
| 6   | Consumer-agnostic                                 | An external consumer, a mobile SDK, a custom renderer — all consume directly without adopting an imposed implementation pattern.                  |

### Disadvantages

| #   | Disadvantage                                             | Detail                                                                                                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No native multi-concern composition                      | If a component needs N distinct logical concerns, state and actions share a single namespace. Risk of collision or mega-state.                                                                                                                                                                                                     |
| 2   | Requires globally unique `componentId` in transport      | Option B relies on `componentId` (the `id` field on component nodes) being globally unique across all surfaces. The backend assigns unique IDs to each component instance. AG-UI `StateSnapshot` uses `componentId` as the flat index key for state. This is a minor constraint on ID generation, not a structural schema concern. |
| 3   | Breaking change if multi-concern is needed in the future | If a component ever truly requires multiple concerns, introducing an intermediate level will be a migration.                                                                                                                                                                                                                       |

---

## Reuse: Catalogs vs. Controllers

An argument put forward for controllers is the **reuse of logical contracts**: the same controller can be attached to N components. However, this reuse mechanism already exists one level above in the hierarchy — at the component level itself.

### With controllers (Option A)

```
Catalog A ──► Component Cart ──► cartController (reused)
Catalog B ──► Component MiniCart ──► cartController (reused)
```

Reuse happens at the controller level: two different components point to the same controller contract.

### Without controllers (Option B)

```
Catalog A ──► Component Cart (state + actions defined once)
Catalog B ──► Component Cart (same $ref, reused as-is)
```

Reuse happens at the component level: two catalogs point to the same component. If two surfaces (mobile, web) need the same cart, they reference the same `cart.schema.json`.

### Finding

The **component is already the natural unit of reuse**. N catalogs can reference the same component via `$ref`, just as N components could reference the same controller. The controller does not add reuse capability that the component doesn't already provide.

The "reuse" argument for controllers only holds if one wants to reuse a _fragment_ of a component (a specific state/actions) across structurally different components. But if two components share the same state and the same actions, the question arises: are they truly different components, or different renders of the same component?

---

## Comparison Matrix

| Criterion                          | Option A (Controllers)  | Option B (Direct)          |
| ---------------------------------- | ----------------------- | -------------------------- |
| Schema simplicity                  | -                       | ++                         |
| Readability for external consumer  | -                       | ++                         |
| Multi-concern composition          | ++                      | -                          |
| Cross-catalog reuse                | neutral (via component) | neutral (via component)    |
| Contract/implementation separation | -                       | ++                         |
| Onboarding / DX                    | -                       | ++                         |
| Cost of future breaking change     | none (already in place) | moderate (adding a layer)  |
| Alignment with Thermidor runtime   | ++                      | neutral (internal mapping) |
| Third-party consumer adaptability  | -                       | ++                         |

---

## Risk Analysis

### Context: pre-publication, but not without consequences

The schema has no public consumers yet — we are in the design and implementation phase. However, once published, the contract is set in stone. Adding an intermediate level (controllers) after publication would be a **breaking change** for all consumers. Conversely, removing controllers after publication would also be a breaking change.

The current window is therefore the time to make this decision — not after.

### Risk of over-engineering (Option A)

The main risk is publishing an abstraction that never proves justified in practice:

- The example catalog shows a strict 1:1 relationship (one component = one controller)
- The multi-concern case (a component with N controllers) is hypothetical
- If the design philosophy is "small, specialized components", multi-concern composition is resolved through component granularity, not through a mechanism internal to the component

If the 1:1 pattern persists indefinitely, the controller is a permanent noise level that every consumer must traverse without deriving value.

### Risk of under-engineering (Option B)

The main risk is being stuck if a multi-concern component becomes necessary after publication:

- Adding the controller layer post-publication = breaking change
- Decomposition into sub-components may not always be a viable option (rendering, layout, or transport constraints)

This risk is real **if and only if** a multi-concern use case materializes and cannot be resolved by decomposition into distinct components.

---

## Multi-Component Surface Correlation

A surface can contain multiple stateful components. For example, a single surface might include a `ProductCarousel` and a `NextActionsBar`, each with independent state. The question arises: how does the transport correlate state updates to the correct component?

### How Option A solves this

In Option A, each component carries a `controllerId` in its props — a unique per-component instance identifier. The AG-UI state snapshot indexes state slices by `controllerId`:

```
state.controllers["product-list-1"] → ProductCarousel state
state.controllers["next-actions-1"] → NextActionsBar state
```

The `controllerId` is embedded in the public schema (component props) and serves as both the correlation key and the state index key. Each component within a surface has a distinct `controllerId`, providing unambiguous correlation.

### How Option B solves this

In Option B, the `id` field on each component node in `createSurface`/`updateComponents` serves as `componentId`. This is a globally unique identifier assigned by the backend to each component instance — like `controllerId` was in Option A:

```json
{
  "version": "v1.0",
  "createSurface": {
    "surfaceId": "s1",
    "components": [
      {"id": "carousel-1", "component": "ProductCarousel"},
      {"id": "actions-1", "component": "NextActionsBar"}
    ]
  }
}
```

The `componentId` is globally unique across all surfaces, serving as the sole state correlation key:

```
state.components["carousel-1"] → ProductCarousel state
state.components["actions-1"]  → NextActionsBar state
```

The AG-UI `StateSnapshot` carries state indexed by `componentId`:

```json
{
  "type": "StateSnapshot",
  "snapshot": {
    "components": {
      "carousel-1": {"products": [...]},
      "actions-1": {"actions": [...]}
    }
  }
}
```

Subsequent `StateDelta` events target a specific component's state via a JSON Patch path that includes the `componentId`:

```json
{"type": "StateDelta", "delta": [{"op": "replace", "path": "/components/carousel-1/products", "value": [...]}]}
```

### Transport concern, not schema concern

This correlation mechanism is purely a transport concern. It does not affect the static schema structure: component contracts still define `componentType`, `state`, and `actions` as their structural interface. The `componentId` is an instance identifier assigned at runtime by the backend when composing a surface — it has no bearing on the component's contract definition.

The `componentId` field already exists in the A2-UI transport (`id` on component nodes). Option B simply promotes it to an explicit role in the AG-UI state correlation protocol, replacing the `controllerId` that was previously embedded in component props. The key difference from `controllerId` is that `componentId` is not part of the public schema contract — it is a transport-level identifier.

---

## Fundamental Questions to Settle Before Deciding

The decision cannot be made abstractly. It depends on concrete answers to these questions:

### 1. Is there a realistic use case for a multi-controller component?

Can we identify a component that would combine multiple logical concerns _and_ could not reasonably be decomposed into distinct sub-components?

If the answer is consistently "no, we'd make two components", the controller solves a problem that doesn't exist.

### 2. What is the component granularity philosophy?

- **Monolithic multi-concern components** → controllers provide necessary internal structure.
- **Small, specialized components** → composition happens at the catalog level (N components), not internally within a component (N controllers). The controller is redundant with the decomposition strategy.

### 3. Should the schema reflect the implementation or the interface?

- **Reflect the implementation** → the schema exposes controllers as they exist in `@coveo/thermidor`. Advantage: direct alignment with the runtime. Cost: the external consumer inherits an imposed structure.
- **Reflect the interface** → the schema describes only the observable surface (state received, actions emitted). Internal implementation (controllers, selectors, slices) remains hidden. Advantage: consumer-agnostic. Cost: internal mapping in the package.

### 4. Who is the primary consumer?

- If the primary consumer is always `@coveo/thermidor` and third parties are secondary → alignment with the implementation may be justified.
- If the schema is intended for autonomous third-party consumers → the contract should be minimal and not impose internal patterns.

### 5. Is the `controllerSchema` as a runtime discriminant necessary?

The AG-UI transport uses `controllers[id]` to index state slices. If controllers are removed from the schema:

- Does the AG-UI transport require the `controllerSchema` for state snapshot correlation, or can a runtime instance identifier fulfill this role independently?
- Is the correlation between A2-UI advertisements and AG-UI state a concern of the static schema, or of the transport layer?
- If this is purely a transport concern, does it have any bearing on the schema structure decision?

If the transport requires a controller-type discriminant, the question may not be "controller yes/no in the schema" but rather "controller in the transport only vs. in the contract as well".

---

## Summary

| If...                                    | Then...                                       |
| ---------------------------------------- | --------------------------------------------- |
| No realistic multi-controller component  | Option B (controller is superfluous)          |
| Components always small and specialized  | Option B (composition via catalog)            |
| The schema targets external consumers    | Option B (pure interface)                     |
| A multi-concern component is unavoidable | Option A (pay the cost now)                   |
| The AG-UI transport imposes the concept  | Clarify the transport/contract boundary first |

The decision is a trade-off between the cost of a potentially unnecessary abstraction (A) and the risk of a future breaking change if the need materializes (B). The answer depends on confidence in the component granularity strategy.
