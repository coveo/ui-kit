# Spike KIT-6179 — Inline transport of Component_State via A2-UI `updateDataModel`

- **Ticket:** [KIT-6179](https://coveord.atlassian.net/browse/KIT-6179) — _Evaluate using A2-UI's `updateDataModel` operations for inline transport of Component_State_
- **Type:** Spike (investigation, not a decision record)
- **Status:** Done — the findings are recorded below, including the acceptance criteria and the Go / No-Go recommendation.
- **Base branch:** `KIT-6193-thermidor-session-client-rework` (ui-kit) / `beta` (thermidor-schema)
- **Scope (per the ticket):** `integration/thermidor-schema`, `integration/ui-kit/packages/thermidor`, `integration/ui-kit/packages/platform-mock-api`, `integration/ui-kit/samples/thermidor/demo-schema-react`. Out of scope: the backend, `agent-smith`, `agent-gateway` (no changes).

> **Note on sources.** Each answer below rests on a concrete source: a schema file, a line of the frozen renderer / core, or a test. Paths are relative to the repository root. Line numbers are indicative (they drift as files change) — symbol names are the durable anchor.

## Contents

- [Context](#context)
- [Objective](#objective)
- [How the model works](#how-the-model-works-updatedatamodel-on-one-page)
- [Questions to address](#questions-to-address)
- [Finding: A2-UI standard composition (the Y2 finding)](#finding-a2-ui-standard-composition-the-y2-finding)
- [Positive findings](#positive-findings)
- [Findings (smells and risks)](#findings-smells-and-risks)
- [Implementation obstacles encountered](#implementation-obstacles-encountered)
- [Options analysis](#options-analysis)
- [Acceptance criteria](#acceptance-criteria)
- [Go / No-Go recommendation](#go--no-go-recommendation)

## Context

The feature replaces the AG-UI event-based state transport (`StateSnapshot` / `StateDelta`) with state carried **inline through the A2-UI data model** via `updateDataModel` operations (RFC 6901 JSON Pointer writes) and Data_Binding objects `{ "path": <JSON Pointer> }`. This reverses decision ADR-002 and requires an ADR revision (a blocking deliverable in `thermidor-schema`).

The intent is to drop the ad-hoc AG-UI state model — along with the `RemoteController` that bridges an A2-UI component and its AG-UI-carried state — and align on the A2-UI standard for component data, so that every consumer of the backend (not just Thermidor) gets an intuitive, standard model. On the KIT-6193 baseline, the client handle is the `Session` from `createSession`; the RemoteController's public API and its internal join are removed, and contract validation is relocated into the core's transport path (inbound `updateDataModel` validation on the fold) and the single dispatch entry point exposed to the consumer (`Session.dispatchAction`).

### Why adopt `updateDataModel` — the standard-alignment argument

A paramount argument in favor of adopting `updateDataModel` (rather than the ad-hoc AG-UI state
model) is **alignment on the A2-UI standard**. Thermidor is **not** the only consumer of this
backend, so the data contract must not be architected around Thermidor's implementation alone. An
ad-hoc state channel, specific to Thermidor, forces every other backend consumer to reimplement or
adapt to a bespoke model; carrying `Component_State` through the standard A2-UI data model means
that any A2-UI-conformant consumer reads state the same, standard way — no Thermidor-specific bridge
required. This design principle applies beyond state transport: it's the same reason composition
should follow A2-UI standard conventions (named `ComponentId` slots / `ChildList` lists) rather than
a Thermidor-specific shape (see
[Finding: A2-UI standard composition](#finding-a2-ui-standard-composition-the-y2-finding)). Wherever
a choice arises between "convenient for Thermidor" and "A2-UI standard", the multi-consumer reality
favors the standard.

The spike's role: confirm that the `updateDataModel` model covers our needs (full and granular updates, in-transit validation, renderer-side merge semantics), determine how A2-UI composition is meant to work with the frozen renderer, and surface the risks **before** freezing the implementation.

## Objective

Determine whether and how A2-UI's `updateDataModel` operations can carry `Component_State` end-to-end through the Thermidor stack on the KIT-6193 baseline, how surfaces are composed with the frozen renderer using A2-UI standard conventions, and document the constraints and risk areas.

## How the model works (`updateDataModel` on one page)

The backend describes a surface then broadcasts its state; the frozen renderer resolves bindings against that state. Three planes are kept separate:

Following the **A2-UI v1.0 adjacency list** model, a node is **flat**: identity, values, bindings, and composition links are carried directly at the **node's top level** (no `props` wrapper).

- **Composition** — `createSurface` and each node's child references: which node contains which other, and (for ordered lists) in what order. Composition is declared at the **node's top level**, typed: a **single-child named slot** is a `ComponentId` (as the A2-UI basic catalog's `Card` uses `child` and `Modal` uses `trigger`/`content`; here `CommerceSearch` uses `sidebarChild`/`mainChild`), an **ordered list** is a `ChildList` (`children`, like `Row`/`Column`). The frozen renderer mounts each child via the `children(id)` function (aka `buildChild(id)`).
- **Identity** — `id` + the `component` discriminant, carried at the **node's top level** (never a second `componentId`/`componentType` identity).
- **State** — pushed via `updateDataModel` operations under the `/state/<id>` namespace, and referenced from the node's properties through A2-UI Data_Binding objects `{ "path": <JSON Pointer> }`.

A node's properties therefore carry presentation values, `{ path }` state bindings, and composition fields (`ComponentId` / `ChildList`) — no duplicated identity, no inline state value. The renderer reads state by resolving the `{ path }` bindings against the data model that `updateDataModel` populates, and mounts children by resolving the composition fields via `children(id)`.

**Actions are not carried in the backend's data messages — they are declared solely in the schema.** A component's actions (e.g. `Pagination`'s `selectPage` / `setPageSize`) are static per component type, defined in its schema contract and projected into the generated `XxxAction` union. Messages never carry an `actions` field on a node; at dispatch time, the core resolves the action contract from the node's `component` discriminant, validates the payload against it, and POSTs the action. The only place an action appears in a message is **outbound**, when the client dispatches one.

**Full vs granular writes.** An op at `/state/<id>` **replaces** the node's entire state object; an op at `/state/<id>/<field>` **merges** that single field. Producers send a partial op to preserve unlisted fields, or a full-node op carrying the complete state.

**Ownership.** The backend is the single source of truth for state; the frontend doesn't directly mutate bound state. A user interaction dispatches an action over HTTP; the response rebroadcasts the recomputed state as `updateDataModel` ops, which the core reapplies. Bound properties are read-only on the renderer side.

**In-transit validation.** Each inbound state op is validated against the component's Zod contract before it reaches the renderer; a non-conforming op is dropped (the renderer keeps its prior state), never applied. On the KIT-6193 baseline, this validation lives on the pure event fold (`src/session/fold.ts`), the single place where a `TurnResponse` is built from the stream.

### Concrete shape

```jsonc
// 1. createSurface — the FLAT node declares its identity + its { path } bindings at the top-level (no inline state).
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
      // ... other nodes (including the surface's `id: "root"` node)
    ]
  }
}

// 2. updateDataModel — the backend pushes the state the bindings resolve against
//    whole-node write at /state/<id> (replaces the node's state object)
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2",
    "value": { "page": 0, "pageSize": 12, "totalEntries": 43, "totalPages": 4 }
  }
}

// 3. a later granular write merges a single field without clobbering its siblings
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "ui-commerce-water-sports",
    "path": "/state/pagination-2/page",
    "value": 1
  }
}
```

## Questions to address

Each question gets an answer structured as: **Answer** / **A2-UI standard** (what the spec says, with an official link, or an explicit "no standard — Thermidor decision") / **Validation** (how it was confirmed against `@copilotkit/a2ui-renderer` v1.61 / `@a2ui/web_core` 0.9). The composition question (Q4) is developed in its own finding section below.

### Q1 — How does the frozen renderer apply an `updateDataModel` op, and does it honor granular merge semantics?

**Answer:** Yes — a full or partial `updateDataModel` op writes to its JSON Pointer's leaf and the bound component re-renders, without clobbering neighboring fields.

**A2-UI standard:** The protocol keeps the UI structure separate from a per-surface data model and binds components by JSON Pointer. The `updateDataModel` entry of the [A2-UI — Message Reference](https://a2ui.org/reference/messages/) illustrates updating a nested path so that only that path changes, and the [A2-UI — Data Binding](https://a2ui.org/concepts/data-binding/) guide recommends "granular updates" that touch only the changed path.

**Validation:** Confirmed in `@a2ui/web_core@0.9.0`: `message-processor` `processUpdateDataModelMessage` calls `surface.dataModel.set(path, value)`, and `data-model.js#set` walks the JSON Pointer and writes **only the leaf** (`current[lastSegment] = value`), creating the intermediate containers without rewriting the neighbors, then notifies that path's subscribers. **Asymmetry to note:** a full-component op at `/state/<id>` writes the entire state object (it **replaces**), while a sub-path op `/state/<id>/<field>` **merges** into the neighbors — producers must send a partial op to preserve unlisted fields.

### Q2 — Do partial updates (a sub-path under `statePath(id)`) behave according to A2-UI's granular-updates best practice?

**Answer:** Yes.

**A2-UI standard:** Same references as Q1 — the nested-path `updateDataModel` example and the "granular updates" recommendation describe writing only the changed sub-path so that neighboring fields survive.

**Validation:** Same `data-model.js#set` mechanism as Q1 — a partial op sets its leaf and notifies that path, so the renderer re-renders only the affected binding.

### Q3 — Where does per-component state/action typing live, and is it preserved once the RemoteController is removed?

**Answer:** Yes, preserved. State is typed by the component's `*State` schema and actions by its `*Actions` schema, both projected into the generated Zod contract; removing the RemoteController relocates the _validation_, not the typing.

**A2-UI standard:** No A2-UI standard answer — where in-transit contract validation lives is a Thermidor architecture decision, not part of the A2-UI protocol.

**Validation (KIT-6193 baseline):** On KIT-6193, the client handle is the `Session` (`src/session/create-session.ts`), the stream is folded in `src/session/fold.ts`, and the RemoteController's public API + internal join under `src/remote-controller/` are removed. Inbound `updateDataModel` validation lives on the fold/transport path, which tracks node identity (`id` + `component`) from `createSurface`/`updateComponents` and validates each op against the component's Zod contract, dropping non-conforming ops. Outbound action-payload validation moves into the private `executeAction` reached from `Session.dispatchAction`. `findComponentContract(component)` is kept internal.

### Q4 — How does A2-UI standard composition work with the frozen renderer, and how should a multi-slot container like `CommerceSearch` be composed?

**Answer:** See the dedicated finding below — [Finding: A2-UI standard composition (the Y2 finding)](#finding-a2-ui-standard-composition-the-y2-finding). In short: the renderer composes children by **node property** (`children(node.<slot>)`), so a heterogeneous multi-slot container declares **named `ComponentId` slots** at the node's top level (`sidebarChild`/`mainChild`), never a position-indexed array.

### Q5 — Do `statePath(id)` and the operation resolver cover the rejection cases, and is the v1.0→v0.9 bridge preservation intact?

**Answer:** Yes for both. `statePath(id)`/`resolveOperation` accept only `statePath(id)` or a sub-path below it and reject everything else (model unchanged, path reported); `convertV1ToV09` transfers the flat nodes as-is — the `{ "path": ... }` bindings are preserved byte for byte and the single `id`/`component` identity kept, without reintroducing `componentId`/`componentType`. (Since the adjacency-list conformance work, the root node is already the canonical `id: "root"` node and the envelope no longer carries a `rootId`: the bridge has no root remap left to do.)

**A2-UI standard:** Only the JSON Pointer path syntax is normative ([A2-UI — Data Binding](https://a2ui.org/concepts/data-binding/)); the `/state/<id>` namespace and the accept/reject rules are Thermidor conventions. The v0.9 target node shape is defined by the [A2-UI — Message Reference](https://a2ui.org/reference/messages/); the v1.0→v0.9 bridge itself is a Thermidor sample concern (the frozen renderer only speaks v0.9).

**Validation:** `statePath`/`resolveOperation` are exported from `@coveo/thermidor-schema` and consumed by the core's validator; the bridge (`src/a2ui/surfaces.tsx#convertV1ToV09`) carries identity + bindings and forbids identity keys. (Both were re-confirmed against the KIT-6193 sample wiring during implementation.)

## Finding: A2-UI standard composition (the Y2 finding)

**How children are supposed to reach a render function in A2-UI, the non-standard shape that was in place at the time of the spike, and the standard convention that eliminated it.** The finding identifies two problems of the starting state, then the remediation — now **implemented** (see "Validation result" and the closure at the section's end).

### Problem 1 (starting state) — The non-standard way render functions received their children

**What the standard does.** A container declares its children as properties **at the node's top level** (A2-UI v1.0 adjacency-list model — no `props` wrapper), and the renderer mounts a child by id via the `children(id)` function (aka `buildChild(id)`). The A2-UI basic catalog shows the two legitimate shapes:

- **Single-child named slot** — `Card` declares a singular `child` and `Modal` declares `trigger` / `content` slots, each a `ComponentId`, mounted with `children(node.<slot>)`. The slot is addressed by **name**.
- **`children` list** — `Row` / `Column` declare a `children` list (`ChildList`) and mount it in order. It's used **only where the ordered list itself is the semantics** (a homogeneous list).

The contract the frozen renderer hands the component is fixed: `props` (the resolved values), `children: (id) => ReactNode`, and an optional `dispatch` — but on the wire, composition and bindings are carried **at the flat node's top level**, not in a `props` wrapper. Once the node is resolved by the binder, the renderer exposes these fields to the component via its `props` object.

**What we did instead (non-standard, before the conformance work).** The non-standard approach didn't declare the container's children in a typed way. `CommerceSearch`'s schema exposed an untyped `children` (a plain array of ids) and the render function fetched the ids with a defensive reader (`readChildIds`) — a field the generated type didn't surface. Composition was therefore read **off-contract**, not as typed inputs.

### Problem 2 (starting state) — Composition was fragile (positional coupling)

Even granting the off-contract read, the non-standard approach assigned slots **by array position** (old `CommerceSearch.tsx` code, since replaced):

```tsx
// OLD — replaced by reading named slots (see Remediation)
const childIds = readChildIds(props);
const [sidebarId, mainId, ...extraIds] = childIds;
```

"The first child is the sidebar, the second is the main area" is an assumption the data doesn't guarantee. The order of a `string[]` carries no semantics: if the producer reorders the children, or inserts one, the sidebar and the main area silently swap. Two heterogeneous slots, with different purposes, are fetched from the ordinal index of a flat id list — a latent correctness bug, not just a style smell.

### Remediation — model composition with the A2-UI convention (Y2)

Both problems dissolve by following the standard convention and declaring composition **on the container's contract**, consistent with its semantics:

- **Heterogeneous, named slots → one named `ComponentId` slot per slot.** `CommerceSearch` declares `sidebarChild` and `mainChild` (`ComponentId` slots at the node's top level). The render function mounts them by name:

  ```tsx
  // target (implemented) — resolved slots arrive in props
  function CommerceSearchRenderer({
    props,
    children,
  }: TypedRendererProps<CommerceSearchProps, never>) {
    const {sidebarChild, mainChild} = props;
    return (
      <div className={styles.page}>
        <aside className={styles.sidebar}>{children(sidebarChild)}</aside>
        <main className={styles.main}>{children(mainChild)}</main>
      </div>
    );
  }
  ```

  No array, no ordinal assumption, no `readChildIds`. Reordering is impossible to mishandle because each slot is addressed by name.

- **Homogeneous ordered list → a `children` `ChildList`.** Only where the ordered list _is_ the meaning (a carousel's items, a facet-manager's facet order) does a container keep a `children` list, mounted in order via `children(id)` — the `Row`/`Column` shape.

Because these composition fields are declared at the node's top level, the container's resolved `XxxProps` projection carries them as **typed** fields (e.g. `CommerceSearchProps = CommerceSearchState & { sidebarChild?: string; mainChild?: string }`, `LayoutStackProps = LayoutStackState & { children?: string[] }`). They're static references (`ComponentId` / `ChildList`, not Dynamic_Values), so the binder classifies them as STATIC and passes the values through unresolved — the same way the basic catalog's `Column` reads its `children` list and `Card` reads its `child`. The consumer reads `props.<slot>` / `props.children` as typed inputs, with no defensive read nor positional destructuring. This is **Y2**: the package owns the composition contract; the consumer stays dumb.

**Rejected:** `readChildIds` + positional destructuring (Problem 1 + Problem 2 combined). **Absolute last resort only** (not a goal): if named-slot modeling can't, for whatever reason, be achieved against the frozen renderer, a composition reader can be provided as a runtime helper of `@coveo/thermidor` (never the sample, never `@coveo/thermidor-schema`), recorded as a deviation. The migration exhausts named-slot modeling first.

**Validation result — CONFIRMED (Y2 viable).** The frozen renderer delivers the static `child-ref` slot fields declared on the resolved `props` **intact**, and `children(props.<slot>)` mounts the corresponding child. Verified end-to-end against `@copilotkit/a2ui-renderer` v1.61.2 + `@a2ui/web_core` 0.9.0 by driving the real `A2UIProvider` → `createCatalog` → `processMessages` → `A2UIRenderer` path (no mocked binder/renderer) in `integration/ui-kit/samples/thermidor/demo-schema-react/src/a2ui/named-slot-delivery.test.tsx`. The test registers a small container whose props schema declares composition as static child-ref fields — `sidebarChild: z.string()`, `mainChild: z.string()`, and `children: z.array(z.string())` — feeds a minimal v0.9 surface whose root node carries them as literal string ids, and asserts that the render function receives them byte for byte identical (`props.sidebarChild`/`props.mainChild` equal to the literal ids; `props.children` deep-equal to the id array) with each child mounted via `children(props.<slot>)`. Run with the sample's local runner (`node_modules/.bin/vitest run src/a2ui/named-slot-delivery.test.tsx`, vitest 4.1.11): **1 file / 1 test passed**.

**Why it holds (mechanism, for the record).** `GenericBinder.scrapeSchemaBehavior` (`@a2ui/web_core/src/v0_9/rendering/generic-binder.js`) classifies a simple `z.string()` prop as `STATIC` (returned as-is) and a `z.array(z.string())` prop as `ARRAY` whose element is `STATIC` (each element returned as-is), so both traverse the `OBJECT` resolution loop without being resolved. It's the same treatment the basic catalog relies on: `Card` reads `props.child` (a string id reference) and mounts `buildChild(props.child)`. **Contract / binder boundary (current state).** The canonical contract now declares child lists as `ChildList` and single slots as `ComponentId` (conformance work, ADR-012). But the frozen binder classifies as STATIC only a **bare** `z.string()` / `z.array(z.string())`: the full `oneOf` shape of `ChildList` (including the template branch `{ componentId, path }`) is classified `STRUCTURAL` and rewritten to `[{ id, basePath }]` instead of delivering the raw id array. That's exactly the role of the runtime projection `toBinderProps` (see S1): it presents the binder with a simple `z.array(z.string())` / `z.string()` for composition fields, so the ids traverse INTACT. The contract stays `ComponentId`/`ChildList`; only the view delivered to the v0.9 binder is flattened. The backend only emits the static id-array shape; the template branch isn't exercised.

**Standard compliance (v1.0 contract vs frozen v0.9 binder).** The Y2 STRATEGY is faithful to the A2-UI standard: the spec defines composition as an adjacency-list model where a container carries its child references as properties **at the node's top level** and the renderer rebuilds the tree by id ([A2-UI v1.0 — UI composition](https://a2ui.org/specification/v1.0-a2ui/)), and the v1.0 basic catalog ([catalog.json](https://a2ui.org/specification/v1.0-basic-catalog-implementation-guide/)) legitimizes both single-child named slots and a `children` list. Concretely, `Card` declares a single `child`, and `Modal` declares TWO named single-child slots (`trigger` and `content`) — proof that a component can carry several distinct named child slots, exactly the shape `CommerceSearch`'s `sidebarChild`/`mainChild` follow. A `children` list for homogeneous ordered content (`Row`/`Column`/`List`) is the other standard shape. Named heterogeneous slots plus a `children` list are therefore the standard-aligned model, not a Thermidor-specific shape.

**Update — the contract is now typed `ComponentId` / `ChildList` (adjacency-list conformance, ADR-012).** Since this spike, the canonical contract has been flattened "by the book": single-child slots are typed `ComponentId` (`definitions/component-id.schema.json`) and child lists `ChildList` (`definitions/child-list.schema.json`), at the node's top level, as v1.0's "Validator compliance" rules require (a raw `type: string` would be treated as text, not as a structural link). One point remains where the implementation follows the FROZEN v0.9 binder rather than the normative shape: the binder classifies as STATIC only a bare `z.string()` / `z.array(z.string())`, so the executed **projection** (`XxxPropsSchema`, after `toBinderProps`) presents the slots as simple strings to the binder — even though the **JSON Schema contract** declares them `ComponentId` / `ChildList`. Second point: v1.0's `ChildList` also supports a TEMPLATE shape (children generated from a data-model list via `{ componentId, path }`); the contract now admits it, but the backend only emits the static id-array shape, the only one exercised here. Neither point changes the Y2 conclusion against the frozen renderer; they mark where a future move to a native v1.0 renderer would drop the `toBinderProps` shim.

**Closure — Problem 1 and Problem 2 are no longer open.** The Y2 remediation is the **implemented** state: `CommerceSearch` declares `sidebarChild`/`mainChild` (`ComponentId`) and its renderer reads the slots by name; ordered lists (`LayoutStack`/`FacetManager`) use `children` (`ChildList`); `readChildIds` and positional destructuring have been removed. The off-contract read (Problem 1) and positional coupling (Problem 2) no longer exist in the code; they're kept here as the starting state the finding diagnosed and fixed.

### Adjacent composition findings (deferred)

The two findings below concern A2-UI **composition**, which is ADJACENT to — not the core of — this spike (the spike's subject is inline transport of `Component_State` via `updateDataModel`). They surfaced because the frozen renderer carries BOTH state binding and composition on the same renderer-props contract, and because the single `id`/`component` identity model touches both. They're recorded here and DEFERRED (out of scope for this spike); none blocks the conclusion on updateDataModel.

**Finding 1 — `LayoutStack(direction)` vs `Row`/`Column` separation (deferred design decision).** `LayoutStack` is a single container with a presentation prop `direction: 'column' | 'row'`, so one component plays two layout roles. The A2-UI basic catalog instead exposes TWO distinct components, `Row` and `Column` (no `Stack(direction)`), so `LayoutStack(direction)` is a Thermidor-specific shape, not the standard shape. Options considered: (A) keep `LayoutStack` + `direction`; (B1) split into `Row`/`Column` primitives OWNED by Thermidor; (B2) reuse the A2-UI `basicCatalog`'s `Row`/`Column`. B2 is REJECTED: reusing the basic catalog would force the consumer to implement generic A2-UI components without the Thermidor contract indicating whether they are actually used. Keeping IN-HOUSE primitives (owned by Thermidor) preserves the key property that the Thermidor catalog is a CLOSED, enumerable list — a type that says exactly what a consumer must implement, no more, no less.

**Recommendation (deferred): B1 — split into in-house `Row`/`Column`.** It keeps the closed-catalog property AND aligns on the A2-UI standard shape, and it eliminates the orphan presentation prop `direction` (see below). Deferred because it's a CONTRACT change spanning several directories in scope (the `layout-stack.schema.json` schema + the contract union + regeneration + the gate; the 4 `LayoutStack` mock nodes in `schema-response-search.ts` that carry `direction: column/row`; the sample's `LayoutStack` renderer + the catalog registration + the documentation). Too much contract churn for a spike; logged as follow-up. Consequence as long as `LayoutStack(direction)` remains (the concrete anomaly it surfaced): `direction` is a STATIC presentation value carried at the node's top level, but which is NOT in `LayoutStackState` (empty) and is NOT a composition link (`ComponentId`/`ChildList`). The resolved `LayoutStackProps` projection only folds state plus the composition fields (`& { children?: string[] }`), so it does NOT carry `direction`. The sample's `LayoutStackRenderer` therefore widens the props inline with `& { direction?: 'column' | 'row' }`. If the split lands, `direction` disappears entirely (Row/Column are pure ordered-list containers with no presentation prop), so the generator work to fold static presentation props into `TProps` would be throwaway — that's why no generator fix is done for `direction`.

**Finding 2 — child mounting (`children(id)`) remains specific to the frozen renderer.** `@coveo/thermidor-schema` must not depend on React (Req 8), so it exposes **no** renderer-props type (no `children` wrapper) — only the resolved DATA types `XxxProps` / `XxxAction`. The frozen renderer, for its part, types `children` as `(id: string) => React.ReactNode`. The consumer bridges the gap with a small local type, `TypedRendererProps<TProps, TAction> = Omit<RendererProps<TProps>, 'dispatch'> & { dispatch?: (action: TAction) => void }` (in `renderer-props.ts`), which reuses the renderer contract's `children` and narrows `dispatch` to the `XxxAction` union. Each container renderer (CommerceSearch, LayoutStack, FacetManager, BundleDisplay) destructures `{ props, children }` from `TypedRendererProps<XxxProps, …>`. It's a package-agnostic→renderer bridge, written once on the consumer side.

**Note on BundleDisplay (the "composition carried in state" pattern).** BundleDisplay composes children (it mounts `children(slot.childId)`) but its composition lives both in its STATE (`tiers[].slots[].childId`) and in a `children` `ChildList` declared at the node level. It's a hybrid pattern that the simple leaf/container distinction doesn't fully capture; recorded as a deferred finding. Since the adjacency-list conformance work, the leaf-vs-container distinction is no longer carried by generated renderer-props types (`LeafRendererProps`/`ContainerRendererProps` no longer exist) but by the **shape of `XxxProps`**: a leaf is exactly its `XxxState`; a container is `XxxState & { <slots>?/ children? }`. The structural remediation S3 points to (making the distinction visible in the generated projection) is therefore partly realized for the composition axis; the resolved-vs-unresolved axis stays open.

## Positive findings

### P1 — End-to-end strict typing preserved, identity duplication removed

Strict prop and action typing isn't new — we already had it before `updateDataModel`, but at the cost of passing `componentId` + `componentType` as props to each renderer function, then calling `useRemoteController(componentId, componentType)` to obtain the typed state and actions. The inline `updateDataModel` model **keeps strict typing and removes that duplication**:

- `props` are typed as the resolved `XxxState`; identity (`id` / `component`) lives at the node's top level, is no longer duplicated in `props`, and there's no more `useRemoteController(componentId, componentType)` indirection to reach the state.
- `dispatch` is narrowed to the component's generated `XxxAction` union (action name + typed payload); an unknown action name or a non-conforming payload is a compile error.

The result is a clear simplification of the previous typed-but-duplicated approach: the same compile-time guarantees, without the per-node identity props nor the controller indirection that carried them.

### P2 — A whole state-access layer was removed (the RemoteController machinery)

In the previous model (ADR-002), reaching a component's typed state required a state-access controller explicitly wired per node. The inline `updateDataModel` model makes state arrive through `{ path }` bindings resolved by the renderer, so this whole layer became dead weight and was **removed** — not relocated. Removed: the public `RemoteController` API **and** its internal join under `src/remote-controller/`, plus the sample's `controllers.tsx` (`useRemoteController`) and the positional `read-child-ids.ts`.

Why the model removes it:

- **State no longer needs a per-node accessor.** Before, a renderer obtained its state by calling `useRemoteController(componentId, componentType)`, which resolved the contract and read the component's state slice from the active turn. Now the backend writes state to `/state/<id>` and the renderer receives it already resolved through its `{ path }` bindings — no controller, no hook, no per-node subscription.
- **Identity is no longer duplicated to drive resolution.** `RemoteController` was indexed on `componentId` + `componentType` (passed as props) to look up the contract and index the state. That's exactly the duplication P1 describes; removing this layer is what P1's simplification looks like in practice.
- **Typed dispatch survived, relocated.** The typed dispatch the `RemoteController` offered is preserved — it now lives on `Session.dispatchAction` plus the generated `XxxAction` unions, not on a per-node controller.

Before / after — the `Pagination` renderer (abridged):

```tsx
// BEFORE — the renderer wires a per-node state-access controller
import {useRemoteController} from '../controllers.js';
import type {PaginationProps} from '@coveo/thermidor-schema';

export function PaginationRenderer({props}: {props: PaginationProps}) {
  const controller = useRemoteController(props.componentId, props.componentType);
  if (!controller.state) return null;
  const {page, totalPages} = controller.state; // state via the controller
  // ...
  const handlePageChange = (newPage: number) => controller.dispatch('selectPage', {page: newPage}); // dispatch via the controller
}
```

```tsx
// AFTER — state arrives resolved in props; dispatch is a plain prop typed to the action union.
// The package exposes the DATA types (resolved XxxProps, XxxAction); the consumer combines
// those with the frozen renderer contract via a small local type `TypedRendererProps`.
import type {PaginationProps, PaginationAction} from '@coveo/thermidor-schema';

export function PaginationRenderer({
  props,
  dispatch,
}: TypedRendererProps<PaginationProps, PaginationAction>) {
  const page = props.page ?? 0; // resolved from its { path } binding
  const totalPages = props.totalPages ?? 0;
  // ...
  const handlePageChange = (newPage: number) =>
    dispatch?.({event: {name: 'selectPage', context: {page: newPage}}});
}
```

The `useRemoteController(componentId, componentType)` call and the `props.componentId` / `props.componentType` identity have disappeared; the renderer now receives resolved state directly and a `dispatch` narrowed to the component's `XxxAction` union.

This removal is **guarded** by `src/a2ui/import-boundary.test.ts`: it fails if `RemoteController` / `useRemoteController` / `.remoteController(` / `controllers.js` / `read-child-ids.js` reappear, and it verifies that `RemoteController` / `RemoteAction` / `RemoteControllerOptions` are **not** exported from `@coveo/thermidor`. The removed layer can't sneak back in.

### P3 — Wiring the dispatch fits in a single prop; no consumer adapter

Sending a component action to the backend requires no adapter code from the consumer. The A2-UI renderer's `onAction` is wired directly to the session:

```tsx
<A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
```

`dispatchAction` is a pre-bound, framework-neutral field on the `Session` (returned by `createSession`) that accepts the standard A2-UI client-to-server message (`A2uiClientMessage = { userAction? }`). It unwraps the `userAction`, retrieves the component discriminant from the active turn's surfaces (via the node identity registry derived in `in-transit-validation.ts`), validates the payload against the component's Zod action contract, and POSTs to the Action_Channel. It's fire-and-forget (always resolves, never throws), so the consumer needs no `.catch`.

The core owns the whole adapter: the consumer writes no node-id→component resolution, no message translation, no surface capture. `dispatchAction` is the single public dispatch entry point; the low-level dispatch is a private closure (`executeAction`), not exposed on the public `Session`. The core stays framework-agnostic — it consumes the A2-UI protocol message, not a React or renderer type — so a consumer on any framework wires the single `onAction` binding that its framework already provides.

### P4 — Surface identity resolution is unified

Surface discovery is done ONCE by the core's fold: `deriveSurfaces` / `readSurface` in `src/session/fold.ts` derive the typed `response.surfaces` projection (`DiscoveredSurface[]`), and `resolveTargetSurfaceId` selects the commerce surface. Each `rootComponentType` carries the `component` discriminant in PascalCase (`'CommerceSearch'`).

Consumers read the typed projection rather than the raw payloads: the sample's `use-navigation.ts` simply FILTERS `turn.response.surfaces` (`surfaces.find(s => s.rootComponentType === 'CommerceSearch')`) and never walks `response.activities`. The duplicated raw payload parsing is gone.

Residual nuance (minor, tracked, non-blocking): the commerce root discriminant literal `'CommerceSearch'` is written in two places — `fold.ts` (`COMMERCE_SEARCH_ROOT_TYPE`) and the sample's `use-navigation.ts`. It's a duplicated LITERAL, not duplicated logic; `fold.ts` already carries an interim ADR-015 note indicating that this magic string persists until server-exposed typed routing arrives.

### P5 — The core is decoupled from any concrete contracts package (contracts are injected)

`@coveo/thermidor` doesn't import `@coveo/thermidor-schema` anywhere — neither in the source nor in the tests. Component contracts are INJECTED by the consumer via `createSession({ contracts })`, typed by a structural join (`src/session/contracts.ts`: `ContractsSchema` / `ComponentContractsSchema`) that describes the SHAPE a contract must have (`z.discriminatedUnion('component', [...])` of `z.strictObject` members carrying optional `state` and `actions` sub-schemas) without importing any concrete Zod class nor the Coveo schema package. The runtime resolves the component discriminant, the full/partial `*State` sub-schema, and the action payload sub-schema directly from the injected value, so the same engine works with ANY A2-UI contract of that shape — the Coveo schema is just one contract among those a consumer can inject. It's the concrete realization of the spike's multi-consumer principle: a second, different schema package could drive the same `@coveo/thermidor` with no code change.

It's proved by `src/session/injection-seam.test.ts`, which builds a hand-written `Widget` contract with the package's own Zod (no concrete package import) and drives discriminant resolution, full/partial inbound validation, and outbound action-payload validation through the real runtime. The `packages/thermidor` unit suite is entirely self-contained: each test builds its contract locally, so `pnpm --filter @coveo/thermidor run test` is GREEN (the package's whole unit suite) with no dependency on `@coveo/thermidor-schema` (the package declares no dependency on it in any form). The stack's redirect checker (`scripts/pnpm/verify-redirect.cjs`) doesn't list `@coveo/thermidor` among its consumers: the core intentionally isn't a schema consumer; only the `demo-schema-react` sample is.

## Findings (smells and risks)

### S1 (CRITICAL) — The frozen binder reads **Zod 3** internals; our generated schemas are **Zod 4**

`@coveo/thermidor-schema`'s generator emits Zod 4 schemas, so each `XxxPropsSchema` is a Zod 4 object. The frozen `@a2ui/web_core@0.9.0` binder (`rendering/generic-binder.js`, `scrapeSchemaBehavior` / `getFieldBehavior`) classifies each prop field by reading **Zod 3** runtime internals — `_def.typeName` (`'ZodUnion'` / `'ZodObject'` / `'ZodArray'` / `'ZodString'` / ...), `_def.options`, and `_def.shape()` (a function). On a Zod 4 object, `_def.typeName` is `undefined`, so **each field falls back to STATIC**, a `{ path }` binding leaks unresolved, and the renderer crashes — the concrete symptom is `NextActionsBar.tsx: actions.map is not a function` (the `actions` binding never resolved to an array). A TypeScript cast can't fix this: the binder inspects the runtime object, not the type.

It's exercised at runtime: the mocked unit tests pass because they render already-resolved props and never exercise the real binder, so a regression test drives the REAL catalog through `A2UIProvider` / `A2UIRenderer` + `processMessages` (`src/a2ui/binding-resolution.test.tsx`): it fails without the shim (the exact `actions.map` crash) and passes with it.

**The smell / the remaining shim.** A runtime Zod 4 → Zod 3 migration, `toBinderProps` (`src/a2ui/catalog-props-migration.ts`), rebuilds each `XxxPropsSchema` as a real Zod 3 `ZodObject` that the binder classifies as DYNAMIC, harvesting the Zod 3 instance (and A2-UI's canonical dynamic-value unions) from the renderer's own `basicCatalog` — no new `zod@3` dependency, no lockfile or catalog change. It's coupled to the frozen renderer's private `_def` internals and disappears only when the renderer moves to Zod 4 (or we own the renderer). It's the most fragile point in the whole pipeline.

**Two properties of the shim.**

1. The shim is applied in **one single place**: `asCatalogDefinitions` (in `src/a2ui/components.tsx`) runs `toBinderProps` on each definition's `props` internally, so the catalog's 16 definitions pass the RAW generated `XxxPropsSchema` and all the workaround (runtime rebuild + Zod3-vs-Zod4 type cast) is concentrated in this single function. Removing it when the renderer moves to Zod 4 is a single-point change.
2. `migrateField` handles the current generated schemas, which declare composition child-refs as `z.string().optional()` / `z.array(z.string()).optional()` (STATIC), distinct from the bindable `Dynamic*Schema` unions. It (a) unwraps `optional` / `nullable` / `default`, (b) maps a Zod 4 union to a Zod 3 dynamic union ONLY when it actually carries a `{ path }` DataBinding member (otherwise STATIC), and (c) maps a bare non-union `string` / `string[]` to a simple Zod 3 static `ZodString` / `ZodArray(ZodString)` (harvested from the basic catalog's `Card.child`) so the binder lets the composition ids pass INTACT — preserving the named-slot delivery validated in `named-slot-delivery.test.tsx`.

Because a `{ path }` binding only resolves once the field is classified DYNAMIC, this Zod version mismatch **silently defeated the very mechanism the spike set out to validate**: the Q1/Q2 granular merge only works once the field is resolvable.

**Same root cause, second symptom: which copy of the schema the tests load.** `@coveo/thermidor` is decoupled from any concrete schema (it imports no concrete schema, see P5), so its unit suite is GREEN and this symptom does NOT affect it. The symptom only appears in the `demo-schema-react` SAMPLE, which legitimately injects the concrete Coveo contract, and it depends entirely on **which copy** of `@coveo/thermidor-schema` vite/vitest loads: the hoisted published copy, or the local submodule the `link:` symlink points to. When the stack's redirect is active (after `mise run install`, which builds the local submodule and materializes the `link:` via the pnpmfile), the sample resolves the **local build** — at runtime AND under vitest — and the sample's full suite passes. The residual risk is the inverse case: if the published `beta.x` copy is hoisted (redirect not materialized), the sample loads a stale schema shape and tests asserting the local shape (`{ path }` binding resolution, `*State`/`*Actions` shapes) fail. DECISION for this spike: no workaround vitest `resolve.alias` is added (this keeps the runtime clean and avoids a test-only shim); the source of truth is the stack's `link:` redirect, to be kept active. The durable fix is for the lockfile to resolve `catalog:` to the submodule's local build.

### S3 (MINOR SMELL) — Renderers must guard against unresolved bindings, by convention only

Binding resolution is asynchronous: on first render, before the node's `/state/<id>` op arrives, a binding-backed object/array prop is `undefined`; a renderer that dereferences it synchronously (`.map` / `.length` / destructuring) crashes.

**A2-UI standard.** The spec defines no default nor placeholder for an unresolved binding; it mandates progressive rendering (see [Renderer Development](https://a2ui.org/guides/renderer-development/), "Progressive Rendering"). The "binding not yet resolved" state is a normal operating state, and the standard delegates its tolerance to the renderer and its components, not to a typed default. Our defensive guards honor this contract.

**Validation.** Confirmed against `@copilotkit/a2ui-renderer` v1.61 / `@a2ui/web_core` 0.9 — the renderer resolves `{ path }` against its own DataModel and exposes `undefined` until the corresponding `updateDataModel` op arrives, with no typed "possibly-unresolved" projection exposed to component code.

**What was done.** The renderers touched in the sample migration were made defensive; in particular RegularFacet, NumericFacet, CategoryFacet, QuerySummary and Sort were hardened (`values ?? []`, `facetSearch ?? {...}`, destructuring with defaults like `const {ancestry = [], children = []} = values ?? {}`, `totalEntries ?? 0`, `availableSorts ?? []`), and the others were already scalar-safe or guarded.

**The smell.** The protection is by convention, not enforced by the types — the generated `XxxState` types describe the fields as always present (their resolved shape), so nothing at compile time prevents a new renderer or a new field from reintroducing the first-render crash. It disappears only if the resolved-vs-unresolved distinction is made visible in the types the renderer consumes (a "possibly-unresolved" projection), which we don't control as long as the frozen renderer owns resolution.

**Re-confirmed by PageSize (manual runtime test).** During manual testing of the sample against the mock, `PageSize` resurfaced this smell at runtime as a React warning: `Each child in a list should have a unique "key" prop` in `PageSizeRenderer`. Root cause: `PageSize` builds its `<option>` list from `[...new Set([...DEFAULT_PAGE_SIZE_OPTIONS, pageSize])]`, and on first render `pageSize` (a `{ path }`-bound value) is `undefined` until its `/state/<id>` op arrives — so an `<option key={undefined}>` is emitted and `.sort()` compares `NaN`. Fixed with the same inline-guard convention (only fold a real `number` into the options list). `PageSize` was NOT among the hardened renderers (unlike RegularFacet/NumericFacet/CategoryFacet/QuerySummary/Sort), which is itself evidence of the smell: the guard is easy to forget because nothing enforces it.

**The duplication question (open question).** Because the guard is by convention, every new renderer, every new bound field, and every new control (e.g. another `<select>` that derives its options from a bound value the way `PageSize` and `Sort` do) must independently re-apply the same defensive shape (`?? []`, `?? {}`, type-narrowing filters, destructuring with defaults). This will accumulate near-identical defensive code across the sample and invites exactly the kind of omission that `PageSize` demonstrated. Two remediation directions were considered and DEFERRED (out of this spike's scope): (1) a small TARGETED sample-side helper for the specific recurring pattern (e.g. building a unique, sorted numeric `<select>` options list from defaults plus a possibly-unresolved current value) — this removes the per-select duplication but does NOT remove the underlying convention, since a renderer must still remember to route its bound field through the helper; it's a local ergonomic gain, not a structural fix; (2) the STRUCTURAL fix (the real one, consistent with the existing S3 conclusion) — making the resolved-vs-unresolved distinction visible in the generated types, i.e. typing each `{ path }`-bound field on `XxxState` as possibly unresolved (`T | undefined`) in the projection the renderer consumes, so the compiler FORCES a guard at each dereference site rather than leaving it to convention; this lives in `@coveo/thermidor-schema` (the projection), not the sample, and is only achievable if/while we can shape these consumer-exposed types — which is not something the frozen renderer's resolution lets us express today. Record the decision: for the spike we keep the inline guards (idiomatic, consistent with the five already-hardened renderers) and do NOT introduce a generic "defensive" helper, because it would displace the convention rather than eliminate it. The possibly-unresolved typed projection is the durable remediation and is noted as follow-up work belonging to the schema projection.

### S4 (DESIGN CONFIRMATION) — Commerce search reactivity requires a server round-trip, not local two-way binding

A2-UI offers local two-way writing (`data-context.js#set` → `dataModel.set`), suited to an optimistic local echo — which is exactly what `useOptimisticFacetSearch` does for the facet search INPUT (in-progress typing kept in local React state, never written to the shared data model).

But commerce actions (selectPage, toggleSelect, setPageSize, selectSort) require the server/engine to recompute results, facet counts, and pagination; the client can't derive the new state locally. The correct model is: action → HTTP POST to the Action_Channel → response stream → state reapplication via inbound `updateDataModel` ops (validated in transit on the fold). On the KIT-6193 baseline, the dispatch entry is `Session.dispatchAction` (fire-and-forget), which validates the payload in the private execution path before the POST; the response flows the recomputed `/state/<id>` ops back through the fold's in-transit validation.

**Conclusion (a design confirmation, not a smell).** Using A2-UI's "two-way" for commerce state wouldn't reduce the consumer glue; it would shift the complexity into state reconciliation and break the "the server is the source of truth" model. This settles the recurring "should we use two-way instead?" question, and it's consistent with the intentional-divergence statement recorded in ADR-011 (local in-progress typing; actions on the non-two-way HTTP Action_Channel).

### S6 (PERSISTENT DEBT) — Inventory of persistent shims (tied to the frozen renderer)

The shims below exist ONLY because of the frozen `@copilotkit/a2ui-renderer` v1.61.2 / `@a2ui/web_core` 0.9. The frozen renderer is the common root, but the shims split by what forces them — the version gap alone, or the inline state model layered on top:

1. `src/a2ui/catalog-props-migration.ts` (`toBinderProps`) — runtime migration of the Zod 4 → Zod 3 catalog props (S1). **Introduced by the inline model:** feeding the catalog with the `{ path }` dynamic unions of `*PropsSchema` is what drags the Zod 4 schemas across the Zod 3 binder boundary. Now applied in **one single place**, inside `asCatalogDefinitions` (`components.tsx`). **Removal trigger:** the renderer upgrades its binder to Zod 4 (or we own the renderer).
2. `src/a2ui/surfaces.tsx#convertV1ToV09` — v1.0 → v0.9 message bridge (Q5). **Predates the inline model:** the renderer only speaks v0.9 while the backend emits v1.0, so this bridge is required under any state transport mode and would remain even without `updateDataModel`. **Removal trigger:** the renderer supports v1.0 natively.
3. First-render null-safety guards across the renderers (S3) — they honor A2-UI's progressive rendering contract as long as the frozen renderer owns binding resolution. **Introduced by the inline model:** asynchronous resolution of `{ path }` bindings is a direct consequence of state arriving per binding rather than pre-resolved. **Removal trigger:** the resolved-vs-unresolved distinction becomes expressible in the consumed types (or we own resolution).

Cross-reference: S1's second symptom — the absence of a vitest `resolve.alias` (intentionally NOT added, see S1) — means the `demo-schema-react` sample's tests resolve the hoisted published copy of the schema. It's not a shim in the repo, but it belongs to the same frozen-renderer / published-copy debt cluster.

**Conclusion.** Together, these constitute a concentrated, renderer-version-tied debt that a "home-grown renderer" (see [Options analysis](#options-analysis), option B) would remove wholesale. The inline model added the Zod shim (1) and the S3 guards (3) on top of the preexisting v0.9 bridge (2).

## Implementation obstacles encountered

### O1 (RESOLVED) — Leaf vs container: don't impose `children` where there is no child

**The obstacle.** The frozen renderer contract (`RendererProps<T>`) always carries `children: (id) => ReactNode`, because the renderer always provides it. But most components are LEAVES that compose no children — Pagination, PageSize, Sort, QuerySummary, the facets, ProductList, ProductCarousel, ProductSummary, ComparisonTable, NextActionsBar. Making a leaf type carry `children` pushes onto the consumer the knowledge that "this component is a leaf" as a convention (remove the unused member), the same class of smell as S3.

**Chosen resolution (adjacency-list conformance).** Rather than exposing renderer-props types from `@coveo/thermidor-schema` (an intermediate iteration had generated `LeafRendererProps` / `ContainerRendererProps`; they were **removed**), the package exposes only the resolved DATA types `XxxProps`, and it's their **shape** that encodes the distinction:

- a **leaf** is exactly its state — `PaginationProps = PaginationState` — so no composition;
- a **container** is its state intersected with its composition fields — `CommerceSearchProps = CommerceSearchState & { sidebarChild?: string; mainChild?: string }`, `LayoutStackProps = LayoutStackState & { children?: string[] }`, `FacetManagerProps = FacetManagerState & { children?: string[] }`.

The consumer links these data types to the frozen renderer contract via a single local type, `TypedRendererProps<TProps, TAction>` (in `renderer-props.ts`): it reuses the renderer's `props` and `children` and narrows `dispatch` to the `XxxAction` union. A leaf renderer types itself `TypedRendererProps<PaginationProps, PaginationAction>` and never calls `children`; a container destructures `{ props, children }`. The leaf/container distinction therefore lives in the shape of `XxxProps` (generated), not in a renderer-props wrapper the package would have to expose — which keeps `@coveo/thermidor-schema` free of any renderer dependency (Req 8).

**Validation.** The schema gate `mise //integration/thermidor-schema:check` passes (the generated matches the generator; generator, package, and Java tests green), and the sample type-checks: its renderers use `TypedRendererProps<XxxProps, XxxAction>` with no `Omit<…, 'children'>`. The change is purely at the projected-type level (identical Zod at runtime, `check:generated` passed); no `pnpm install`, no lockfile/catalog change.

## Options analysis

The consumer-side dispatch glue has already disappeared (see [P3](#positive-findings)); the open architectural question is whether to keep adapting the frozen renderer or replace it with our own. The options:

| Option                                     | What it does                                                                                                                                                   | Cost                                                                                                                                                                              | Removes                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. Keep the frozen renderer (current)**  | Adapt it: `Session.dispatchAction` consumes the standard A2-UI message and resolves the component core-side; the Zod4→Zod3 and v1→v0.9 shims (S6) bridge the rest. | Low                                                                                                                                                                              | Nothing more for the consumer; the S6 shims remain, internal.                                                                                              |
| **B. Home-grown renderer**                 | Replace `@copilotkit/a2ui-renderer` + `@a2ui/web_core` with a Thermidor renderer consuming v1.0 + Zod 4 natively.                                              | High (reimplement the binder: `scrapeSchemaBehavior`, reactive data-model subscriptions, child-list resolution, dispatch with deep binding resolution).                          | The consumer glue **and** all of S6 **and** the S1/S3 root causes. Full control of the format + binding resolution + library versions. |
| **C. Do nothing more**                     | Keep option A as-is.                                                                                                                                            | None                                                                                                                                                                             | Leaves the S1/S6 shims and the S3 fragility in place indefinitely.                                                                                          |

**Why a home-grown renderer is attractive (strategic, beyond removing the glue):**

- Align on our own library versions (e.g. Zod) without being pinned to an external renderer's transitive choices — that's what dissolves S1 at the root rather than shimming it.
- Simplify the internals further: everything derived from the A2-UI standard (identity resolution, binding resolution, dispatch translation) would be handled natively by our renderer, removing the shims (S6) rather than working around them.
- Evolve at our own pace (v1.0 natively, our binding-resolution semantics, our types).

**Possible starting points to evaluate (not a from-scratch rewrite mandate):** the A2-UI ecosystem ships `@a2ui/web_core` (the binder + the data model + the catalog engine), framework wrappers, and a Composer integration bridge. Caveat: `@a2ui/web_core` is exactly the package that imposes Zod 3 (the S1 root cause), and the A2UI Composer is an authoring/preview tool (iframe + postMessage), not a runtime rendering engine. Building on `web_core` would NOT resolve S1 on its own; a version-independent renderer would need to replace or fork the binder. **This trade-off (build-on-`web_core` vs. home-grown binder, and the real impact on S1) is uncertain and consequential — it deserves its own dedicated follow-up spike before any commitment.**

**What a home-grown renderer does NOT remove — but would own and hide from the consumer:** the binding resolution engine, the action→HTTP→response round-trip, and child mounting by id still exist and remain necessary; the point is that we'd **encapsulate** them inside our renderer instead of exposing them (or the adapter glue around them) to the consumer. The only element that stays written by the consumer is the **per-component renderers** — it's their UI, legitimately theirs, neither engine nor glue. This also connects to the "closed catalog" decision recorded in the [Adjacent composition findings](#adjacent-composition-findings-deferred): a home-grown renderer would still leave these per-component renderers to the consumer. Option B therefore doesn't make the per-component UI work disappear; it moves the ENGINE behind our boundary and leaves the consumer only what is legitimately theirs.

## Acceptance criteria

Each of the ticket's acceptance criteria, linked to its proof:

- **Each question has a documented, sourced answer.** Q1–Q5 above, each backed by a schema file, a line of the frozen renderer / core, or a test. ✅
- **The v0.9 renderer's granular merge behavior is confirmed by concrete proof, not an assumption.** Confirmed by the code (`@a2ui/web_core` `data-model.js#set` — leaf-only write + path subscriber notification) and exercised end-to-end by the running `demo-schema-react` sample, plus the P12 (full component) and P14 (partial sub-path) property tests. ✅
- **A clear recommendation is given for continuing the feature.** GO, with the conditions and follow-ups below. ✅

**Optional deliverable (throwaway prototype):** not produced as a separate artifact — the proof lives in the real sample (`demo-schema-react`) and the property tests rather than in a throwaway prototype, which is stronger proof than a prototype would have been.

## Go / No-Go recommendation

**GO** for inline `updateDataModel` transport. The model is sound and confirmed by the code and tests: full and granular updates apply with the right merge semantics (Q1/Q2), state/action typing is preserved and in-transit validation relocated (Q3), A2-UI standard composition holds against the frozen renderer (Q4), and the state-path/resolver rejection cases as well as the v1.0→v0.9 bridge preservation are covered (Q5).

**What this unblocks (KIT-6004):** with inline `updateDataModel` transport validated, KIT-6004 (Thermidor controller state synchronization) can rely on this mechanism as the state channel rather than on ADR-002's AG-UI snapshot/delta path. The hard precondition to carry forward is S1: the Zod 4 ↔ Zod 3 binder mismatch must stay mitigated (shim) or be resolved (home-grown renderer) for the transport to actually deliver resolved state to the renderer — a full or partial op only reaches the UI once its field is classified as resolvable.

**Conditions / follow-ups:**

1. The Zod 4 ↔ Zod 3 binder mismatch (S1) is the primary risk, held by a runtime shim. Track it explicitly; reassess when `@copilotkit/a2ui-renderer` moves to Zod 4.
2. Surface identity resolution is unified core-side (P4): the `'CommerceSearch'` literal stays duplicated between `fold.ts` (`COMMERCE_SEARCH_ROOT_TYPE`) and the sample's `use-navigation.ts` until server-exposed typed routing arrives (interim ADR-015 note). To be closed at that point.
3. Keep the shim inventory (S6) visible; each shim has a defined removal trigger.
4. Renderers must stay defensive against unresolved bindings (S3) as long as binding resolution isn't under our control.
5. Consider a dedicated follow-up spike on a home-grown renderer (option B / the appendix's option A): build on `@a2ui/web_core` + the framework wrappers, or replace the binder outright, and the concrete impact on S1 (independence from the Zod version), on the shim debt (S6), and on our ability to evolve at our pace. The A2UI Composer is an authoring/preview tool only, not a runtime rendering engine.
