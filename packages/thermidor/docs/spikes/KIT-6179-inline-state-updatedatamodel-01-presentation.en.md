# KIT-6179 — Inline state transport and agnostic consumption (presentation)

Audience: DXUI team. Two parts followed by a decision. Part 1: inline state transport via the A2-UI standard `updateDataModel` (the spike). Part 2: making Thermidor consumption framework-agnostic (the appendix). Part 3: decision-making. The detailed reference documents are cited at the end.

## Part 1 — Inline transport via `updateDataModel` (the spike)

### The problem

A component's state today travels through the ad-hoc AG-UI model (`StateSnapshot` / `StateDelta`), and one `RemoteController` per node bridges an A2-UI component and its AG-UI-carried state. Two costs:

- **It's specific to Thermidor.** Thermidor isn't the only consumer of Coveo's agentic backend; an ad-hoc state channel forces every other consumer to reimplement a bespoke model.
- **It duplicates identity.** Each renderer receives `componentId` + `componentType` as props, then calls `useRemoteController(componentId, componentType)` to reach its typed state — one indirection per node.

### How the model works

We align state on the **A2-UI standard**: the backend describes a surface, then pushes state under `/state/<id>` via `updateDataModel` operations; a node's properties reference that state through `{ path }` bindings. Following the **A2-UI v1.0 adjacency list** model, a node is **flat**: identity, values, bindings, and composition links are carried directly at the node's top level (no `props` wrapper). Three planes remain separate:

- **Composition** — declared at the node's top level, typed: a named slot is a `ComponentId` (e.g. `sidebarChild`/`mainChild`), an ordered list is a `ChildList` (`children`), mounted via `children(id)`.
- **Identity** — `id` + the `component` discriminant, at the node's top level (never a second `componentId`/`componentType` identity).
- **State** — pushed under `/state/<id>`, referenced from the node's properties via `{ path }`.

The renderer reads state by resolving the `{ path }` bindings against the data model that `updateDataModel` populates. The concrete shape, on the wire:

```jsonc
// 1. createSurface — the flat node declares its identity + its { path } bindings at the top level (no inline state).
//    The envelope carries no `rootId`: the root node is the canonical `id: "root"` node.
{
  "version": "v1.0",
  "createSurface": {
    "surfaceId": "ui-commerce-water-sports",
    "catalogId": "https://schema.thermidor.coveo.com/a2-ui/catalog.json",
    "components": [
      {
        "id": "pagination-2",
        "component": "Pagination",
        "page": { "path": "/state/pagination-2/page" },
        "pageSize": { "path": "/state/pagination-2/pageSize" },
        "totalEntries": { "path": "/state/pagination-2/totalEntries" },
        "totalPages": { "path": "/state/pagination-2/totalPages" }
      }
    ]
  }
}

// 2. updateDataModel — the backend pushes the state the bindings resolve against (replaces the whole object)
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2",
    "value": { "page": 0, "pageSize": 12, "totalEntries": 43, "totalPages": 4 }
  }
}

// 3. a later granular write merges a single field without overwriting its neighbors
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2/page",
    "value": 1
  }
}
```

The backend is the single source of truth: a user action goes out over HTTP, the response rebroadcasts the recomputed state as `updateDataModel` ops that the core reapplies. Bound properties are read-only on the renderer side.

### Questions to address

Five questions asked, five answers verified against the **official A2-UI standard** (a2ui.org) and the **code** (`@copilotkit/a2ui-renderer` v1.61 / `@a2ui/web_core` 0.9) — except Q3 (where validation lives), a Thermidor architecture decision outside the protocol, confirmed by the code alone:

- **Q1 — Do state writes apply correctly?** — **Yes**: a full op at `/state/<id>` replaces the node's entire state object, and the bound component re-renders.
- **Q2 — Do partial updates preserve neighbors?** — **Yes**: an op at `/state/<id>/<field>` merges that single field without overwriting the others.
- **Q3 — Does state/action typing survive removing the `RemoteController`?** — **Preserved**: the types (`XxxState` / `XxxAction`) remain, and it's validation that's relocated. Nuance: action typing, once **enforced** at dispatch by the `RemoteController`, becomes **applied voluntarily** by the consumer (the renderer hands over a `dispatch` typed `any`).
- **Q4 — Does A2-UI standard composition hold with the frozen renderer?** — **Yes**: named `ComponentId` slots at the node's top level (`sidebarChild`/`mainChild`), never a position-indexed array (finding Y2).
- **Q5 — Do the rejection cases and the v1.0→v0.9 bridge hold?** — **Yes** for both.

### Removing `RemoteController` — relocating responsibilities

The `RemoteController` (KIT-6193 baseline) carried four responsibilities per node. Moving to inline, it disappears as a layer — but what it did doesn't disappear, it's redistributed to a better-placed boundary — the layer that naturally carries it:

**1. Read the component's state.** Before: it read `response.state.components[componentId]` (AG-UI snapshot). Now: the renderer receives its state **already resolved** in `props` via the `{ path }` bindings, resolved by the binder against the data model that `updateDataModel` populates. No more `useRemoteController`, no more per-node accessor.

**2. Validate incoming state (Zod).** Before: `contract.shape.state.safeParse(rawState)` on read. Now: **in-transit validation on the fold** validates each `updateDataModel` op before it reaches the renderer; a non-conforming op is dropped. Code: `in-transit-validation.ts` (`deriveNodeIdentityRegistry` + `validateInboundOp`), called from `fold.ts`.

**3. Validate the outgoing action payload (Zod).** Before: `actionEntry.shape.payload.safeParse(payload)` before sending. Now: `validateActionPayload` in the private dispatch path (`executeAction`), before the POST. Code: `action-payload-validation.ts`, called from `create-session.ts`.

**4. Dispatch the action.** Before: each controller exposed a `dispatch(action, payload)` per node, **typed by the contract** (action name and payload constrained by the injected contracts). Now: a single public entry point, `Session.dispatchAction`, wired to the renderer's `onAction`, which delegates to the private `executeAction`. Payload validation remains (internally, in `executeAction`), but the **typing at the boundary** is no longer enforced: the renderer hands over a `dispatch` typed `any`, and the consumer applies our `XxxAction` voluntarily.

Two properties are **preserved, not relocated**: **per-component typing** (contracts injected via `createSession({ contracts })`, generated `XxxState` / `XxxAction` types — validation moved, not typing) and **reactivity** (the binder re-resolves the binding when the op arrives). The `RemoteController` mixed four concerns per node; the new model separates them and places each where it belongs. It isn't a removal, it's a consolidation.

### Wiring state and `dispatchAction`

Concretely, on the renderer side, the shift shows in the same `Pagination` component. Before, the renderer wired a per-node state-access controller:

```tsx
// BEFORE — the renderer wires a per-node state-access controller
import {useRemoteController} from '../controllers.js';

export function PaginationRenderer({props}: {props: PaginationProps}) {
  const controller = useRemoteController(props.componentId, props.componentType);
  if (!controller.state) return null;
  const {page, totalPages} = controller.state; // state via the controller
  const handlePageChange = (newPage: number) => controller.dispatch('selectPage', {page: newPage});
}
```

After, state arrives resolved in `props`, and `dispatch` is a simple prop typed to the component's action union:

```tsx
// AFTER — state arrives resolved in props ; dispatch typed to the XxxAction union
export function PaginationRenderer({props, dispatch}: PaginationRendererProps) {
  const page = props.page ?? 0; // resolved from its { path } binding
  const totalPages = props.totalPages ?? 0;
  const handlePageChange = (newPage: number) =>
    dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});
}
```

Wiring the dispatch to the core takes a single prop, with no consumer adapter: the renderer's `onAction` is plugged directly into the session.

```tsx
<A2UIProvider catalog={thermidorCatalog} onAction={session.dispatchAction}>
```

`Session.dispatchAction` unwraps the standard A2-UI message, retrieves the component discriminant from the active turn's surfaces, validates the payload against the Zod contract, and POSTs. It's fire-and-forget (always resolves, never throws) — no `.catch` required on the consumer side.

### The findings

Positive (P1–P5):

- **Strict typing preserved, identity duplication removed** — props are the resolved `XxxState`; no more `componentId`/`componentType` in props.
- **A whole layer removed** — the `RemoteController` machinery (public API + internal join + sample hook).
- **Dispatch fits in one prop** — `onAction={session.dispatchAction}`, no adapter. Two distinct caveats: (1) the `dispatch` the renderer hands to the **component** is typed `any` (the action payload isn't constrained); (2) this model assumes the renderer exposes a **plug-in point** to the core — all three expose it (`onAction` in React, `actionHandler` in Angular, the `MessageProcessor` handler mounted via `A2uiSurface` in Vue), but more or less declaratively. Action typing, once **enforced** by the `RemoteController` (agnostic, exposed by Thermidor: `dispatch<A>(action, payload)` typed by contract), now becomes **applied voluntarily** by the consumer.
- **The core is decoupled** (inherited from the KIT-6193 baseline, not a gain of this work) — `@coveo/thermidor` doesn't import `@coveo/thermidor-schema`; contracts are injected via `createSession({ contracts })`, so any A2-UI contract of the right shape drives the same engine.

Negative / to manage (S1–S6):

- **S1 (critical) — Zod 3 / Zod 4 mismatch.** The frozen binder reads Zod 3 internals; our schemas are Zod 4. A runtime shim (`toBinderProps`, at a single point) bridges the gap. It's the most fragile point; it disappears if the renderer moves to Zod 4 or if we own the renderer.
- **S3 (minor) — defensive guards by convention.** On first render, an unresolved binding is `undefined`; renderers guard by convention (`?? []`, `?? {}`), not by the type.
- **S4 (confirmation) — commerce reactivity requires a server round-trip**, not local two-way binding (the server recomputes results, facets, pagination).
- **S6 (debt) — inventory of shims tied to the frozen renderer**: the Zod 4→3 migration (S1), the v1.0→v0.9 bridge, the first-render guards (S3). All would disappear with an in-house renderer.

### Summary

Inline transport via `updateDataModel` is **feasible and de-risked** — the spike proved it end-to-end. The gains are clear, the frictions known and manageable. That leaves a question the transport doesn't settle on its own: how to deliver structure and state in a framework-agnostic way? That's Part 2.

## Part 2 — Making Thermidor consumption agnostic (the appendix)

### The problem

A consumer's component has two needs facing Thermidor. **Receiving** (inbound): its **composition** (the tree, the slots) and its **state** (the resolved values to display). **Sending back** (outbound): its **actions**, up to the core. The outbound already has an agnostic anchor — `Session.dispatchAction`, in the core. The real subject is the shape of inbound and outbound at the component's boundary, because today it's delegated to the third-party renderer (`@copilotkit/a2ui-renderer` in React, `@a2ui/angular` in Angular, `@copilotkit/vue` in Vue), and that shape changes per framework. That's where agnosticism is lost — the "last meter".

### What we observe — the inbound

The A2-UI wire is standard and agnostic. But each renderer then dictates the shape delivered to the component: how state, composition, and the means to act reach it. And these shapes diverge:

| What the component receives | React (`@copilotkit/a2ui-renderer`)                                                | Angular (`@a2ui/angular`)                                                                                   | Vue (`@copilotkit/vue`)                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **State**                  | `props: T` — flat, typed by the generic (`RendererProps<PaginationState>`)         | each field as `BoundProperty<T>`, read via `props()['page']?.value()`                                       | flat, resolved `props` (`ResolveA2uiProps<...>`, via `GenericBinder`)                                          |
| **Composition**            | child refs **in the props** ; mounted via `children(id)`, provided by the renderer | child refs **in the props** ; mounted via `<a2ui-v09-component-host>`, provided by the renderer             | child refs **in the props** ; mounted via `buildChild(id)`, provided by the renderer                           |
| **Means to act**           | received **as a prop** — `dispatch?: (action: any) => void`                        | **not** a prop — via `A2uiRendererService`, sends the action on the surface: `surface.dispatchAction(...)`  | received **as a prop** — `context: ComponentContext`, sends the action on the surface: `context.dispatchAction(...)` |

Finding: the generic types **state**, but no renderer types the **action payload** (`any` in React and in Vue via `context.dispatchAction`, untyped in Angular), and composition is framework-frozen. Our `XxxState` can type state; our `XxxAction` are extra typing that **we** bring — no renderer requires it. Our types are therefore useful even without a renderer generic.

### The action path — the outbound

The arrival point is the same everywhere: `session.dispatchAction`, the agnostic bridge to the core. What differs is the **way you plug that bridge in**: a declarative _hook_ in React (`onAction`) and in Angular (`actionHandler`), a `MessageProcessor` handler mounted via `A2uiSurface` in Vue (a notch more explicit). In all cases the payload is free (`any` at the renderer level), so our `XxxAction` type it on the consumer side. We traced this path in all three's real code.

In React, the component receives `dispatch` as a prop and builds the action; the renderer relays via the provider's `onAction`:

```tsx
// Pagination React (our sample)
dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});

// The bridge to the core — onAction plugged straight into the session.
<A2UIProvider catalog={thermidorCatalog} onAction={session.dispatchAction}>
```

In Angular, the component injects the surface and dispatches; `provideA2Ui` relays via its `actionHandler`:

```ts
// Pagination Angular equivalent (@a2ui/angular)
selectPage(newPage: number) {
  this.renderer.surfaceGroup.getSurface(this.surfaceId())?.dispatchAction(
    {name: 'selectPage', context: {page: newPage}},
    this.componentId()
  );
}

// The bridge to the core — the raw action is wrapped then passed to the session.
provideA2Ui({
  catalogs: [thermidorCatalog],
  actionHandler: (action) => session.dispatchAction({userAction: action}),
});
```

The full Angular chain: `component → SurfaceModel.dispatchAction → provideA2Ui's actionHandler → session.dispatchAction`, exactly where React puts `onAction`. The real asymmetry boils down to little: React receives `dispatch` as a prop (nothing to inject); Angular injects the service and passes `componentId` explicitly. Light boilerplate, not binding resolution.

In Vue, the component dispatches via the `ComponentContext` received as a prop (`context.dispatchAction`). The bridge to the core is the **`MessageProcessor` handler** — the low-level equivalent of `onAction` / `actionHandler`: you build the processor with our handler, then mount its surface via the `<A2uiSurface>` component exported by `@copilotkit/vue`.

```ts
// Pagination Vue equivalent (@copilotkit/vue) — inside createVueComponent(PaginationApi, ({props, context}) => ...)
selectPage(next: number) {
  context.dispatchAction({event: {name: 'selectPage', context: {page: next}}});
}

// The bridge to the core — the MessageProcessor handler relays the action to the session,
// exactly like onAction (React) / actionHandler (Angular).
const processor = new MessageProcessor([thermidorCatalog], (action) =>
  session.dispatchAction({userAction: action})
);

// The surface is then mounted by the A2uiSurface component exported by @copilotkit/vue:
<A2uiSurface :surface="processor.model.getSurface(surfaceId)" />
```

All three renderers converge on the same `session.dispatchAction`; only the plug-in mode differs: declarative `onAction` in React, `provideA2Ui`'s `actionHandler` in Angular, `MessageProcessor` handler mounted via `A2uiSurface` in Vue. Vue is a notch more verbose — you build the processor explicitly — without that being an obstacle.

### The answer: types that satisfy both directions — option C

The inbound has different shapes, the outbound converges, and no renderer types the action. The direct answer: **Thermidor provides the types** — `XxxState` (the resolved state), `XxxAction` (the payload), `XxxProps` — derived from our schemas. The consumer keeps its A2-UI renderer and types its integration against our types, across all three frameworks. This is **option C**, the one we implemented and proved cross-framework.

The same `Pagination` component, with the same Thermidor types, in React, Angular, then Vue. In React, we refine `RendererProps` once to type the action:

```tsx
import type {PaginationState, PaginationAction} from '@coveo/thermidor-schema';

// The renderer gives a generic for state, but not for the action; we refine once:
type TypedRendererProps<TState, TAction> = Omit<RendererProps<TState>, 'dispatch'> & {
  dispatch?: (action: TAction) => void;
};

function PaginationRenderer({
  props,
  dispatch,
}: TypedRendererProps<PaginationState, PaginationAction>) {
  return (
    <Pagination
      state={props}
      onSelect={(page) => dispatch?.({event: {name: 'selectPage', context: {page}}})}
    />
  );
}
```

In Angular, each state field is a `BoundProperty` read via `.value()`, and the action is typed by `PaginationAction` before being dispatched:

```ts
import {PaginationStateSchema} from '@coveo/thermidor-schema';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {ComponentApi} from '@a2ui/web_core/v0_9';
import {CatalogComponent, A2uiRendererService} from '@a2ui/angular/v0_9';
import {Component, computed, inject} from '@angular/core';

// PaginationApi: the A2-UI catalog description; its schema IS our PaginationStateSchema (generated Zod).
const PaginationApi = {name: 'Pagination', schema: PaginationStateSchema} satisfies ComponentApi;

@Component({
  selector: 'a2ui-pagination',
  template: `<pagination
    [page]="page()"
    [totalPages]="totalPages()"
    (select)="selectPage($event)"
  />`,
})
class PaginationComponent extends CatalogComponent<typeof PaginationApi> {
  // CatalogComponent doesn't expose the surface; a custom component injects the service to dispatch.
  private readonly renderer = inject(A2uiRendererService);

  // props() delivers each field as a BoundProperty; we read the resolved value by key.
  protected readonly page = computed(() => this.props()['page']?.value());
  protected readonly totalPages = computed(() => this.props()['totalPages']?.value());

  selectPage(page: number) {
    // We type the action manually with PaginationAction — the renderer provides no typing here.
    const action: PaginationAction = {event: {name: 'selectPage', context: {page}}};
    this.renderer.surfaceGroup
      .getSurface(this.surfaceId())
      ?.dispatchAction(action, this.componentId());
  }
}
```

In Vue (`@copilotkit/vue`), the component registers via `createVueComponent`; its `props` are resolved, and the action is typed by `PaginationAction` — typing that **we** apply, the renderer doesn't impose it. The bridge to the core is the `MessageProcessor` handler, mounted via `<A2uiSurface>`:

```tsx
<script setup lang="ts">
import {PaginationStateSchema} from '@coveo/thermidor-schema';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';
import {createVueComponent, A2uiSurface} from '@copilotkit/vue';
import {h} from 'vue';

const PaginationApi = {name: 'Pagination', schema: PaginationStateSchema} satisfies ComponentApi;

// props exposes PaginationState fields already resolved (via the GenericBinder); we read them directly.
const Pagination = createVueComponent(PaginationApi, ({props, context}) => {
  const page = props.page ?? 0;
  const selectPage = (next: number) => {
    // The renderer hands a dispatch typed `any`; we apply OUR type voluntarily (nothing imposes it).
    const action: PaginationAction = {event: {name: 'selectPage', context: {page: next}}};
    context.dispatchAction(action);
  };
  return h('pagination', {page, onSelect: (e: number) => selectPage(e)});
});

// The bridge to the core, once: the MessageProcessor handler relays to the session.
const processor = new MessageProcessor([thermidorCatalog], (action) =>
  session.dispatchAction({userAction: action})
);
</script>

// The surface is then mounted by the A2uiSurface component exported by @copilotkit/vue.
<template>
  <A2uiSurface :surface="processor.model.getSurface(surfaceId)" />
</template>
```

Same types (`PaginationState`, `PaginationAction`) across all three frameworks; only the mechanics differ (flat props + `dispatch` in React; `BoundProperty.value()` + service in Angular; resolved `props` + `ComponentContext` in Vue, mounted via `A2uiSurface`). It's close to the current state: the schema exports only data (`XxxState` / `XxxAction` / `XxxProps`), no need to expose helpers tailored to the React renderer. Its limit: C makes typing **available and correct, but doesn't impose it** — dispatch stays `any` at the renderer level, so the consumer applies our types voluntarily. And it keeps a third-party renderer, so the Zod 3/4 friction (S1) remains, manageable but present.

### Going further — option A

C decouples the types, not the renderer. To remove the dependency on the third-party renderer itself — and the whole class of frictions that comes with it (Zod today, something else tomorrow) — Thermidor must own resolution and **expose a resolved tree**. That's option A.

Today, resolution is shared: the core's fold produces `response.state` (the components' state, already flat on AG-UI) and `response.surfaces` (surface **discovery**, `{ surfaceId, rootComponentType }` — not the composition tree). It's the third-party renderer that resolves the composition tree. A would carry that resolution into the core and expose a tree where each node is a typed variant of a discriminated union on `component` — `state` typed, composition typed by its shape, a leaf carrying neither `slots` nor `children`:

```tsx
// Generated from the closed Thermidor catalog — one variant per component.
type ResolvedNode =
  // Leaf: neither slots nor children.
  | {id: string; component: 'Pagination'; state: PaginationState}
  // Named-slot container: each slot is typed by its real name (from the schema).
  | {
      id: string;
      component: 'CommerceSearch';
      state: CommerceSearchState;
      slots: {sidebarChild?: string; mainChild?: string};
    }
  // Ordered-list container: children typed.
  | {id: string; component: 'LayoutStack'; state: LayoutStackState; children: string[]};
// ... one variant per catalog component
```

The consumer writes a mounting `switch` that narrows `state` and `slots` without a cast; a slot access on a leaf is forbidden by TS. It writes neither a binder, nor a `{path}` resolver, nor A2-UI reactivity — only the mounting of ITS native components:

```tsx
function renderNode(
  surface: DiscoveredSurface,
  id: string,
  dispatchAction: Session['dispatchAction']
) {
  const node = surface.node(id);
  if (!node) return null;
  switch (node.component) {
    case 'Pagination':
      // node.state is typed PaginationState — no cast.
      return <Pagination state={node.state} onAction={dispatchAction} />;
    case 'CommerceSearch':
      // node.state: CommerceSearchState ; node.slots.sidebarChild/mainChild: string | undefined — typed.
      return (
        <CommerceSearch state={node.state}>
          <aside>
            {node.slots.sidebarChild &&
              renderNode(surface, node.slots.sidebarChild, dispatchAction)}
          </aside>
          <main>
            {node.slots.mainChild && renderNode(surface, node.slots.mainChild, dispatchAction)}
          </main>
        </CommerceSearch>
      );
    // ... one case per component ; on a leaf, node.slots doesn't exist (TS forbids it).
  }
}
```

The `ResolvedNode` tree is agnostic — no React/Angular/Vue type, no imposed `children(id)` function. The consumer walks the tree and mounts with its framework's native primitives, in its idiom: React `map`, Angular `@for` / `ngComponentOutlet`, Vue `<component :is>`. No more third-party renderer, so no more dependency on its library choices: the Zod 3/4 friction (S1) doesn't disappear by workaround, it **disappears**. And since Thermidor then owns the action bridge, it can **re-expose a typed, agnostic `dispatch`** — the guarantee the `RemoteController` offered (enforced action typing), but without the AG-UI coupling nor the React-only limit of the hook. The price: owning the resolution engine (in-house or on `@a2ui/web_core`, to be scoped in a dedicated spike).

### Summary of the paths

A fourth option existed on paper — **B, the exposed headless engine** — but it's set aside: "mounting a component" is framework-specific, so the engine recouples to the framework (or requires one per framework) and doesn't reach the intended agnosticism.

| Option                         | `{path}` resolution        | Consumption contract              | Third-party renderer? | Agnostic?                          |
| ------------------------------ | -------------------------- | --------------------------------- | ---------------- | ---------------------------------- |
| **C** — pure type contracts    | third-party renderer (chosen) | types only                     | yes, chosen      | types yes; last meter no           |
| **A** — resolved view tree     | Thermidor (internal engine) | data (observable resolved tree)  | none (exposed)   | total                              |
| **B** — headless engine        | Thermidor                  | engine (mounting)                | you become one   | no (framework-specific mounting)   |

C is the solution in place; A is the extension that pushes decoupling all the way. That's Part 3's trade-off.

## Part 3 — Decision-making

### `updateDataModel`: yes or no?

**Recommendation: yes.** Two arguments. **Standard alignment**: we adopt the A2-UI standard state mechanism (`updateDataModel`) rather than an ad-hoc AG-UI channel specific to Thermidor. **Native correlation**: `updateDataModel` links state to component in the same protocol (`/state/<id>` + `{ path }` bindings), where the ad-hoc AG-UI model imposed a `componentId` bridge to maintain — one layer fewer (detailed analysis in document `-04-`). The spike **proves feasibility and de-risks** the solution: full/granular writes work, typing is preserved, standard composition holds, rejection cases are covered. The frictions (S1/S3) are known and manageable.

### If yes: option A or C to become agnostic?

**Starting recommendation: C.** It's simple, already in place, and proven cross-framework (React, Angular, Vue): the schema provides pure types (`XxxProps` / `XxxAction`), the consumer types its integration against them, and the schema's decoupling from the renderer is done. It's the pragmatic step that delivers the essence of agnostic typing without a large effort.

But C and A don't remove the same frictions, and that's where the trade-off lies:

- **C decouples the types, not the renderer.** The consumer keeps a third-party A2-UI renderer, so the Zod 3/4 friction (S1) remains. It's manageable — internal shim, or downgrading Zod 4→3 generation, or even serving both formats — but the very fact that you must _choose_ how to manage it signals the risk class: any third-party renderer library incompatible with ours becomes a bridge to build.
- **A removes that whole class.** No more third-party renderer, so no more dependency on its library choices. S1 isn't worked around, it **disappears**. That's the real agnosticism gain — at the price of owning the resolution engine.

**The open question for the team:** C is in place and enough to decouple the types. A would eliminate the third-party renderer and the whole class of compatibility frictions (Zod today, something else tomorrow), but it's an engine effort (in-house or on `@a2ui/web_core`, to be scoped in a dedicated spike). **Do we want to put A on the roadmap now, or stay on C and reassess when the compatibility friction becomes painful?**

Anticipated objection: "what if `@copilotkit/a2ui-renderer` moves to Zod 4?" — then S1 disappears and C becomes even more comfortable. But the friction class remains for the next divergent library; A stays the only option that closes it for good.

## Reference documents

- **Spike** — `KIT-6179-inline-state-updatedatamodel-02-spike.md`: inline `updateDataModel` transport in detail, the verified Q1–Q5 / P1–P5 / S1–S6 findings, the options analysis. The spike describes the state at the time of its investigation (KIT-6193 baseline); option C now exposes `XxxProps` on the consumer side.
- **Appendix** — `KIT-6179-inline-state-updatedatamodel-03-agnostic-consumption.md`: the agnostic consumption contract, the detailed A/B/C options, the React, Angular, and Vue snippets, the `ResolvedNode` tree.
- **Decision aid (state transport)** — `KIT-6179-inline-state-updatedatamodel-04-agui-vs-a2ui-decision.md`: why `updateDataModel` (A2-UI) rather than AG-UI for component data — interop set aside, the real criterion (native correlation vs `componentId` bridge), and the open question of the data model shape (per-component vs business).
