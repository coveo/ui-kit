# Appendix KIT-6179 — A framework-agnostic consumption contract

- **Type:** Architecture note / recommendation.
- **Accompanies:** `KIT-6179-inline-state-updatedatamodel-02-spike.md` (same directory).
- **Established premise:** `updateDataModel` is adopted as the transport (A2-UI standard), under the feature's "Thermidor is just one consumer among others" argument for Coveo's agentic capability. This point is not re-litigated here.
- **Objective:** Define the consumption contract to offer consumers, one that is framework-agnostic and not tied to a third-party A2-UI renderer.

## The problem

A consumer — React, Angular, Vue, whatever — needs three things from Thermidor to display a surface:

1. **The structure / composition**: which nodes, which tree, which named slots, which ordered child lists.
2. **Each node's state**: the resolved values the node must display.
3. **A channel to send actions back.**

Point 3 is already settled: `Session.dispatchAction` consumes a standard A2-UI message, depends on no framework, and lives in the core. The real subject is therefore delivering the structure (1) and the state (2) without imposing either a framework or a renderer.

Today, these two points are delegated to the third-party renderer — `@copilotkit/a2ui-renderer` in React, `@a2ui/angular` in Angular, `@copilotkit/vue` in Vue. It's the renderer that dictates the shape delivered to the component, and that shape changes per framework. That's precisely where, at this boundary, agnosticism is lost. Call it **the last meter**: the final leg between what Thermidor produces and the consumer's native component.

## What we observe looking at the renderers

The A2-UI wire (`createSurface` / `updateComponents` / `updateDataModel`) is standard and agnostic: the protocol is handled identically everywhere. But each renderer then dictates the shape delivered to the component.

Verified fact: there are three official web renderers — `@a2ui/react`, `@a2ui/lit`, `@a2ui/angular` — all built on the common `@a2ui/web_core` foundation (message processor, state management, data binding). Only each framework's rendering layer differs. And the shapes diverge:

- **React** (`@copilotkit/a2ui-renderer`) exposes `RendererProps<T>` = `{ props: T; children: (id: string) => React.ReactNode; dispatch?: (action: any) => void }`. The generic `T` types the resolved state (you can write `RendererProps<PaginationState>`), but `children` is frozen to `React.ReactNode` (React-specific) and `dispatch` is typed `any`.
- **Angular** (`@a2ui/angular/v0_9`): state arrives as `BoundProperty<T>`, read via `.value()`; configuration goes through `provideA2Ui({ catalogs, actionHandler })`; `A2uiRendererService` manages the processor and the reactive model; child refs arrive in the props and are mounted via `<a2ui-v09-component-host>`, provided by the renderer. The component dispatches the action via the surface (`surface.dispatchAction`), relayed at the end of the chain by `provideA2Ui`'s global `actionHandler` — not by a typed `dispatch` received as a prop as in React.
- **Vue** (`@copilotkit/vue`): state arrives as flat, resolved `props` (`ResolveA2uiProps<...>`, via the `GenericBinder`); the component registers via `createVueComponent` and receives a `ComponentContext` as a prop; child refs arrive in the props and are mounted via `buildChild(id)`, provided by the renderer. The component dispatches via `context.dispatchAction`; the bridge to the core is the `MessageProcessor` handler, mounted via the exported `<A2uiSurface>` component (the low-level equivalent of `onAction` / `actionHandler`).

Conclusion: in all cases, the generic (or the binder) types **state**; but **no renderer types the action payload** (typed `any` in React, untyped in Angular and Vue), and composition / children are framework-frozen. Our `XxxState` schemas can therefore type state against the renderer's generic, but our `XxxAction` are **extra typing we bring** — no renderer requires or provides it.

Verified point: **our types are useful even without a renderer generic**. Typing needn't come from a renderer-provided generic. Example on the Angular side (`@a2ui/angular`, `MilesProgress` component): the component itself declares `interface Ctx { passenger: BoundProperty<Passenger> }` and consumes it via `input<Ctx>()` — the typing comes from an imported type, not a renderer generic. A React or Angular consumer therefore benefits from taking our types as the source of truth, even if its renderer offers no generic.

### The action path, verified in the code

In all three frameworks, the component **builds** an action payload `{ name, context }` and pushes it to a dispatch point. That payload is free (`any` at the renderer level), so our `XxxAction` type it on the consumer side.

In React, the component receives `dispatch` as a prop and builds the action:

```tsx
// Pagination React (our sample)
dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});
```

The renderer relays to `A2UIProvider onAction={session.dispatchAction}` — the bridge to Thermidor.

In Angular, the custom component extends `CatalogComponent` (from `@a2ui/angular/v0_9`) (which exposes `props()`, `surfaceId()`, and `componentId()`, but NOT `surface()`); it injects `A2uiRendererService` itself, then builds the action and dispatches it directly:

```ts
// Pagination Angular equivalent (@a2ui/angular)
selectPage(newPage: number) {
  this.renderer.surfaceGroup.getSurface(this.surfaceId())?.dispatchAction(
    {name: 'selectPage', context: {page: newPage}}, // BUILT action (concrete values)
    this.componentId()
  );
}
```

`resolveAction` / `DataContext` only serve for an action coming from the node — the official `Button` case, whose action (`props()['action']`) may contain `{path}` to resolve. For an action built in code with concrete values — all Thermidor components (Pagination, Sort, facets) — there's nothing to resolve: you call `dispatchAction({name, context}, componentId)` directly.

The full Angular chain: `component → SurfaceModel.dispatchAction → surfaceGroup.onAction → provideA2Ui's actionHandler → session.dispatchAction`. The bridge to Thermidor is the `actionHandler`, exactly where React puts `onAction`.

The real asymmetry boils down to little: React receives `dispatch` as a prop (nothing to inject, `sourceComponentId` implicit); Angular injects the service itself and passes `componentId` explicitly. It's light boilerplate, not binding resolution.

In Vue, the component dispatches via the `ComponentContext` received as a prop (`context.dispatchAction`). The bridge to the core is the `MessageProcessor` handler — the low-level equivalent of `onAction` / `actionHandler`: you build the processor with our handler, then mount its surface via the `<A2uiSurface>` component exported by `@copilotkit/vue`.

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

All three renderers converge on the same `session.dispatchAction`; only the plug-in mode differs: a declarative _hook_ in React (`onAction`) and in Angular (`actionHandler`), a `MessageProcessor` handler mounted via `A2uiSurface` in Vue (a notch more explicit, without that being an obstacle).

## Where resolution lives today

Today, resolution is shared between the core and the renderer. The core's fold produces two framework-independent projections:

- `response.state` — the components' state (validated in transit; on AG-UI, already resolved and flat by `componentId`).
- `response.surfaces` — surface **discovery** (`{ surfaceId, rootComponentType }`), not the composition tree.

It's the **third-party renderer** that resolves the composition tree: walk the `createSurface` messages, mount the nodes, resolve the slots and child-refs. The core has the raw material (the `createSurface` messages in `response.activities`) but today only derives surface discovery. Option A would therefore mean **carrying that composition resolution into the core** and exposing its typed result — this isn't exposing a projection already there, it's moving resolution from the renderer to Thermidor.

### The real question

We're not choosing a renderer. The real question: **in what shape does Thermidor deliver the structure and the state** so that a consumer of any framework can consume them?

## The options

### A. The resolved view tree

Thermidor exposes a resolved view tree, **typed per component**: each node is a variant of a discriminated union on `component`, where `state` carries the component's already-resolved state and composition (named slots or ordered list) is typed by its real shape. A `subscribe(surfaceId, listener)` rounds out the API. No rendering concept, no imposed `children(id)` function, no React/Angular/Vue type. The consumer walks the tree, maps `component` to its native component, reads `state` (already flat), and recurses on `children` / `slots`. It mounts with its native primitives, in its idiom (React `map`, Angular `@for` / `ngComponentOutlet`, Vue `<component :is>`).

**What Thermidor exposes** — the resolved tree, generated from the JSON Schema catalog: one variant per component, `state` typed, composition typed by its shape (named slots vs list). A leaf variant carries neither `slots` nor `children`:

```tsx
// Generated from the closed Thermidor catalog — one variant per component.
// The `component` discriminant types `state` AND composition: the mounting switch narrows each case, no cast.
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

**What the consumer writes** — the usual wiring (session, turns, routing), then the recursive `component` → native component mounting:

```tsx
function AppShell() {
  const session = useSession();
  const turns = useSyncExternalStore(session.subscribe, () => session.turns);

  const commerceSurface = turns
    .at(-1)
    ?.response.surfaces.find((s) => s.rootComponentType === 'CommerceSearch');

  return commerceSurface ? (
    <SearchResultsPage surface={commerceSurface} onAction={session.dispatchAction} />
  ) : (
    <ConversationPage turns={turns} onAction={session.dispatchAction} />
  );
}

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
    // ... one case per component ; on a leaf like Pagination, node.slots doesn't exist (TS forbids it).
  }
}
```

The consumer writes no binder, no `{path}` resolver, no A2-UI reactivity — only this mounting `switch` (~20-40 lines), which is legitimately theirs since it mounts THEIR native components.

Only the mounting changes: `AppShell` (session, turn subscription, routing) and the layouts (like `SearchResultsPage`) stay exactly what they already are today; it's the third-party A2-UI renderer (`<A2UIProvider>` + `<A2UIRenderer surfaceId>`) that's replaced by `renderNode`. The types used (`Session`, `DiscoveredSurface`) are the current API; option A only adds the resolved tree to them (`node(id)` / `rootId`, plus `ResolvedNode`). This `ResolvedNode` union is **generated from the JSON Schema catalog** just like `XxxState` / `XxxAction`: adding a component to the schema enriches the consumer's typed tree without any type being written by hand.

### B. The headless engine exposed to the consumer

The core would expose an engine (`registerRenderer` + mounting) that drives the mounting of the consumer's components. Set aside: "mounting a component" is framework-specific (mounting React ≠ mounting Angular), so the engine recouples to the framework or requires an engine per framework — it doesn't reach the intended agnosticism (mounting only becomes agnostic by imposing Web Components, at the price of the component technology and the typing at the boundary). Concretely, B amounts to rewriting a framework-oriented third-party renderer ourselves — the in-house equivalent of `@copilotkit/a2ui-renderer` for React, so one renderer per framework, exactly the coupling we're trying to leave. Resolution, for its part, is reused via `@a2ui/web_core` (that's what A does); B's problem isn't resolution, but owning and exposing the mounting layer.

### C. Pure type contracts

Thermidor imposes no renderer nor engine: it provides **the types** derived from our schemas (`XxxState`, `XxxAction`), plus the standard wire and `dispatchAction`. The consumer chooses its A2-UI renderer and types its integration against our types. Thermidor becomes a source of truth for types + transport + dispatch, without ever touching rendering.

Here's the same `Pagination` component — dispatch and wiring to `session.dispatchAction` — in React, in Angular, then in Vue. Same Thermidor types everywhere; only the framework mechanics change.

**React** — the renderer gives a generic for state but not for the action; you refine it once, then the `A2UIProvider` relays the action (already wrapped as `{ userAction }`) to `session.dispatchAction`:

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

// The A2UIProvider already wraps the action as { userAction } ; onAction plugs in directly.
<A2UIProvider catalog={thermidorCatalog} onAction={session.dispatchAction}>
  {/* ... */}
</A2UIProvider>;
```

**Angular** (`@a2ui/angular`) — each state field is a `BoundProperty` read via `.value()`, the action goes out through `surface().dispatchAction`, and `provideA2Ui` relays it to `session.dispatchAction` (wrapped by hand, a one-line adapter):

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
    const action: PaginationAction = {event: {name: 'selectPage', context: {page}}};
    this.renderer.surfaceGroup
      .getSurface(this.surfaceId())
      ?.dispatchAction(action, this.componentId());
  }
}

// provideA2Ui delivers the raw action { name, surfaceId, sourceComponentId, context } ;
// we wrap it in { userAction } for session.dispatchAction.
provideA2Ui({
  catalogs: [thermidorCatalog],
  actionHandler: (action) => session.dispatchAction({userAction: action}),
});
```

**Vue** (`@copilotkit/vue`) — the component registers via `createVueComponent`; its `props` are resolved, and the action is typed by `PaginationAction` — typing that **we** apply, the renderer doesn't impose it. The bridge to the core is the `MessageProcessor` handler, mounted via `<A2uiSurface>`:

```vue
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

<template>
  <A2uiSurface :surface="processor.model.getSurface(surfaceId)" />
</template>
```

Same types (`PaginationState`, `PaginationAction`) across all three frameworks, and the action always ends at `session.dispatchAction` — the agnostic bridge to the agent. Only the framework mechanics differ: flat props + `dispatch` in React, `BoundProperty.value()` + dispatch via the service in Angular, resolved `props` + `ComponentContext` in Vue; and the `{ userAction }` wrapping, done by the provider in React, and done in the `MessageProcessor` handler in Angular as in Vue. The action's shape — `{ event: { name, context } }` — is the one our schemas generate and the renderer expects: verified in the code (`resolveAction` produces it, `SurfaceModel.dispatchAction` consumes it).

### Comparison

| Option                         | `{path}` resolution                                               | Consumption contract                           | Third-party renderer? | Agnostic?                                 |
| ------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------- | ------------------- | ----------------------------------------- |
| **A** — resolved view tree     | **Thermidor** (internal engine: `web_core` recommended, or in-house) | data (observable resolved tree)               | **none (exposed)**  | total                                     |
| **B** — headless engine        | Thermidor                                                         | engine (`registerRenderer` + mounting)         | no (you become one) | no (mounting is framework-specific)       |
| **C** — pure type contracts    | third-party renderer (consumer's choice)                          | **types only** (`XxxState` / `XxxAction`)      | yes, chosen         | types yes; last-meter shape no            |
| status quo                     | third-party renderer                                              | renderer-shaped helpers (React)                | yes, de facto imposed | no                                      |

The status quo exposes helpers tailored to the React renderer (`children(id) => ReactNode`, React-style `dispatch`): tied to a framework de facto, exactly what we're trying to move beyond. B recouples to the framework through mounting. That leaves the two finalists, **A and C**: A eliminates the last meter by delivering the resolved state; C types it, but the renderer remains.

## Digging into A: who resolves, and the Zod question

A resolves **internally**; the consumer sees only the resolved tree, never encountering web_core, Preact, or Zod. Two ways to feed that resolution:

- **An in-house resolver.**
- **`@a2ui/web_core` internally.** The package is framework-agnostic (no React/Angular/Vue peerDep) and exposes exactly the useful bricks without DOM mounting: a `DataModel` (`set` / `get` / `subscribe` — the `{path}` resolver, absolute and relative), the `GenericBinder` (prop resolution and classification), the `MessageProcessor` (`processMessages`, wire parsing), and `SurfaceModel` / `SurfaceGroupModel` (surfaces + `onAction`). Its dependencies: `@preact/signals-core` (reactivity) and `zod@3`.

**The `{path}` scope determines the heaviness.** The A2-UI standard allows a broad scope: absolute paths (resolved from the surface's data-model root, so potentially cross-node) and relative paths (resolved in a collection scope when a container iterates a `ChildList` in template mode). Resolving the full standard implies a global per-surface data-model + management of collection scopes and templates — that's the full engine, what `web_core` does.

But our inline-state model is strictly **node-local**: all the `{path}` emitted by the Thermidor transport are built by `statePath(id)` / `stateFieldPath(id, field)` = `/state/<id>` or `/state/<id>/<field>`. No cross-node, no collection scope, no template. It's a tested invariant: the property test `thermidor-mock.property.test.ts` (`targetsPresentStatePath`) verifies that each op targets `statePath(id)` or a sub-path, for a present `id`. And lists (ProductList, ProductCarousel) are arrays INSIDE `state`, not A2-UI templates. A node-local in-house resolver is therefore trivial; `web_core` is only necessary for the full standard scope.

**The axis that decides is the standard-conformance debt**, because the standard moves (v0.9.1 current, v1.0 candidate):

- **In-house resolver**: zero dependency, lightweight as long as we stay node-local. But every standard evolution (new binding, new scope semantics, new `ChildList`) becomes our migration debt — we re-implement, we become a partial A2-UI implementation to maintain.
- **`web_core` internally**: conformance is delegated. When A2-UI evolves, we bump the dependency and stay conformant without migrating our code. The price: `@preact/signals-core` + `zod@3`, confined to the core, invisible to the consumer.

**What resolves S1.** Zod 4 is **our** choice (`@coveo/thermidor-schema`'s generator emits Zod 4), not an external constraint. If A uses `web_core` internally, the Zod encounter now happens between our own packages (`@coveo/thermidor-schema` ↔ the core ↔ `web_core`), not with the consumer. Aligning `@coveo/thermidor-schema` on **Zod 3** — `web_core`'s language — then becomes a coherent internal choice, which **dissolves S1 at the root**: no more Zod 4 → Zod 3 mismatch, no more `toBinderProps` shim.

**Honest caveat.** Saying "S1 disappears" assumes the resolved tree ALSO carries the composition (slots / `children`) extracted, so that we pass nothing more to the binder. If A resolves the state but leaves composition to the binder, a residue remains on composition. To be validated.

## Digging into C: the agnostic fallback via types

C is proven feasible for React, Angular, and Vue. The action path verified above shows that all three renderers accept a `{ name, context }` payload built by the component — our `XxxAction` type it in all three cases. On the state side: React receives `props: PaginationState` (typed via the generic `RendererProps<T>`), Angular reads its props via a type derived from `ComponentApiToProps<typeof XxxApi>`, `Api` being constructible from our schemas. So `XxxState` types the state and `XxxAction` types the action, independently of the framework.

Its limit: C makes typing **available and correct, but doesn't impose it** — the dispatch / payload is `any` at the renderer level, so the consumer applies our types voluntarily. It's "typing safe if used", not "typing enforced".

Concretely, C is close to the current state: it would suffice to export only the data (`XxxState` / `XxxAction`) and stop exposing the React renderer-shaped helpers (`LeafRendererProps` / `ContainerRendererProps`, React-tailored).

Cross-cutting note: if a shim stays necessary (frozen Zod 3 renderer), it must live in OUR packages, never at the consumer — same principle as P3 (the core owns the action adapter) and Y2 (the package owns the composition). The shim is "frozen renderer" plumbing, so our responsibility.

## Recommendation

**Expose A to the consumer** (agnostic resolved view tree), with **`@a2ui/web_core` as the internal resolution engine**, and **align `@coveo/thermidor-schema` on Zod 3**. The Zod encounter becomes internal between our packages and S1 dissolves. We thus combine contract agnosticism (the consumer sees only a resolved tree) AND delegated standard conformance (we never chase the standard ourselves).

**Fallback: C** (pure types), if we decline to expose a data contract and prefer to let the consumer plug in its renderer.

**Alternative to the engine: a node-local in-house resolver**, if we decline the Preact / Zod 3 dependencies in the core — at the price of carrying the standard-conformance debt ourselves.

In all cases, option A means **carrying resolution into the core** — not only the state (already resolved on AG-UI), but also the composition tree (slots, child-refs), today resolved by the third-party renderer. That's A's real cost: Thermidor becomes the place that resolves composition, not just the place that exposes types.

## What it implies for the spike

This direction extends **P5** (the consumption contract becomes agnostic, not just contract injection), builds on **Y2** (composition lives on the contract), meets the structural remediation of **S3** (making the resolved / unresolved distinction explicit in the types), and sits as an intermediate point in the options analysis, between "keep the frozen renderer" and "own the renderer".

## Next steps

- **Decide the engine and the scope.** Engine: `web_core` internal (recommended, conformance delegated) vs in-house resolver. Scope: node-local (covers 100% of our current inline-state model) vs full standard (useful only if Thermidor were one day to consume cross-node / collection bindings). If `web_core`, confirm `@coveo/thermidor-schema`'s Zod 3 alignment.
- **Sketch the concrete shape of the resolved view tree**: types and observability.
- **Confirm caveat A**: can the resolved tree carry the composition fully extracted, removing every point of contact with the Zod 3 binder?

The Angular component contract is already confirmed (three web renderers on `web_core`; `@a2ui/angular` via `provideA2Ui` / `actionHandler`). What remains anecdotal: whether `@copilotkit/angular` reuses `@a2ui/angular` to the letter — with no impact on the analysis.
