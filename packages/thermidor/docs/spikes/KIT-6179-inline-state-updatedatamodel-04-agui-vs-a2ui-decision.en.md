# Appendix KIT-6179 — Component data: via AG-UI or via A2-UI? Decision aid

- **Type:** Decision-aid note.
- **Accompanies:** the spike (`-02-`, "does `updateDataModel` work?" — yes) and the agnostic appendix (`-03-`, "how to consume Thermidor from any framework?").
- **Purpose:** help settle a single choice — **which protocol component data travels through**: AG-UI (as today) or A2-UI (`updateDataModel`, in the same protocol as composition)? AG-UI remains the channel for the agentic flow (turns, messages, tool calls, lifecycle) in all cases — there's no question of abandoning it. We first test the argument we thought decisive (multi-consumer interop), then isolate the criterion that truly settles it. We reason on facts verified in the code, not on the spike's rhetoric.

## The starting hypothesis: interop would settle it

Thermidor isn't the only consumer of Coveo's generative backend. One might therefore believe the choice is decided on interop: which protocol exposes state in the most reusable way for another client (mobile app, CLI, public API)? That's the natural intuition — and we're going to test it. We'll see (section "Observations") that it **doesn't settle it**: a consumer that only wants the data belongs to a dedicated endpoint, outside the UI channel. Interop set aside, the real criterion appears elsewhere.

## The framing: the debate is only about component data

AG-UI isn't in question. Fact verified in the current branch: the two protocols already coexist. The tool calls (`route_bundle`, `coveo_commerce_search`, `store_render_plan`...), the text messages, and the lifecycle (`RUN_STARTED` / `RUN_FINISHED`) pass through **AG-UI** events; component state passes through **A2-UI** (`updateDataModel`, carried in the `a2ui-surface` activities). The sole object of the choice below is therefore the transport of **component state** — the rest (agentic flow) stays in AG-UI whatever the verdict.

## The schema vision

The architecture evolved from a "one controller per component, hand-coded" model toward a "everything is dictated by the schemas" model:

- **Before: custom `*Controller`s, one per component.** (`pagination-controller`, `sort-controller`, `cart-controller`, etc.) Each carried its logic and its **selectors** to extract, from a state, the information relevant to that component.
- **After: a generic `RemoteController`.** A single controller, whose state and actions are **typed by the schemas** (`RemoteController<T, TContracts>`; `dispatch<A>(action, payload: ActionPayloadFor<...>)`). No more hand-written controller per component.
- **Direct consequence.** For a **generic** `RemoteController` to work without a hand-written selector, the response must arrive **1-to-1 with the component**: the controller reads `response.state.components[componentId]` and validates it against the component's contract. There's no more code that would know how to extract, from a business state, the pieces relevant to a given component — that code (the selectors) has precisely been removed.

In other words: the `RemoteController`'s genericity has an implicit price — it **requires** the data to arrive already split by component.

## AG-UI: an independent data transport

AG-UI (`STATE_SNAPSHOT` / `STATE_DELTA`) is the event-based protocol that Thermidor already uses for the agentic flow.

- In the 1-to-1 situation the `RemoteController` imposes, the AG-UI state must carry an **identity field** (`componentId`) to link each piece of state to the corresponding A2-UI component. That's the `componentId` ↔ state bridge.
- AG-UI can transport **any agent state**, including state not tied to a component (conversation state, metadata, intermediate data). It's already the case today for the agentic flow — the assistant's text messages, tool calls, lifecycle — which has no associated A2-UI component and travels in AG-UI.

## A2-UI: a data transport via `updateDataModel`

A2-UI offers `updateDataModel` as a state mechanism, in the same protocol as composition.

- `updateDataModel` pushes and updates component data directly via the A2-UI protocol; the renderer resolves the `{ path }` bindings against the populated data model.
- It returns data **tied to a component** that the renderer mounts. Honest corollary: state that has no component to mount (pure session state, preference, context with no representation) doesn't express naturally in A2-UI — the renderer mounts what the catalog declares, we don't control "this doesn't display". That's precisely where AG-UI, which transports free state, keeps a clean use.
- It uses a system of **JSON pointers (JSON Pointer, RFC 6901)** to indicate where the data is in the `dataModel`. The shape of these pointers is **not** dictated by the standard.

## Observations tied to the premise

Three observations follow from the above — and the third corrects a too-hasty conclusion:

- **AG-UI with `componentId`: unconsumable by a third party.** State is indexed by UI-component identifiers (`components["pagination-2"]` rather than `search.pagination`): no business landmark. A third party wouldn't know what to read. State is cut for Thermidor's UI.
- **A2-UI, even with a business state, remains a UI flow.** One can organize the `dataModel` as **business state** (`/search/results`, `/commerce/cart`) and use the pointers as **selectors** — that's more readable than a per-component scope. But a third party consuming that flow still consumes A2-UI: surfaces, components, a catalog. A consumer that wants ONLY the data would have to understand a UI protocol to extract it. That's not its place.
- **Consequence: the premise doesn't settle this debate.** A third party that only wants the business state, without UI, belongs to a **dedicated endpoint** of the backend — a data API decoupled from the UI channel — neither AG-UI nor A2-UI, which are both UI channels. "Data-only" interop is therefore not an argument for choosing A2-UI over AG-UI as the transport of component state. That choice must be justified on other criteria (model coherence, simplicity, alignment on the state the backend already keeps).

## The real criterion: `componentId` bridge vs native correlation

Interop set aside, a concrete distinction remains between the two protocols for the transport of component state — and it holds to the correlation between a component and its state:

- **AG-UI imposes a `componentId` bridge.** The generic `RemoteController` reads `response.state.components[componentId]`; the AG-UI state must therefore carry that identifier, and a layer links the state (AG-UI) to the component (A2-UI). Two protocols to correlate by an identifier.
- **A2-UI correlates natively.** State lives under `/state/<id>` in the **same** protocol as the component's `{ path }` prop bindings. The component-to-state correspondence is carried by the message itself — no bridge to maintain.

This is the only technical argument, verified and non-rhetorical, that distinguishes the two for component state: A2-UI removes a correlation layer that AG-UI makes necessary. The advantage is real but circumscribed — it says nothing about the data model shape (a distinct question, below), nor about the agentic flow (which stays in AG-UI anyway).

## Could we have a business state with AG-UI while keeping the `RemoteController`'s generic abstraction?

In theory yes, but we fall back on the problem the schema vision precisely wanted to eliminate.

For a **business** AG-UI state to feed a generic `RemoteController`, you need to know, for each component, **which piece of the state to read**. Two ways, neither satisfactory:

- **A client-side selector** — that's reintroducing the per-component custom code we just removed.
- **A protocol-side pointer** (the A2-UI message indicates the path in the state) — but that's then, shape aside, what `updateDataModel` already does, except that the state would stay in AG-UI instead of A2-UI. We thereby split the pointer (A2-UI) and its target (AG-UI) into two protocols, with a correlation to maintain between them.

This "A2-UI pointer to AG-UI state" assembly would have only one benefit: letting a third party consume the AG-UI state **alone, without UI**. But that third party would be better served by a **dedicated data endpoint** — Thermidor's purpose is to generate UI, not to be a data API. **Simpler: two separate paths** — the UI path (Thermidor) and the data path (dedicated endpoint), rather than a cross-protocol pointer that twists the architecture for a need that isn't Thermidor's.

## How to model `updateDataModel` to consume a business state?

The idea: a surface's `dataModel` is no longer a collection of per-component states, but a **business model**, and component props are **bindings** (`{ path }`) to that model.

- Today (per-component shape): `path = /state/<componentId>/<field>`. The `path` is the node's state, 1-to-1. That's what the spike put in place, and what makes the typed dynamic wrapper so direct (component type → its `XxxState` → its `/state/<id>`, no selector).
- Business shape: `path = /search/results`, `/search/pagination`, `/commerce/cart`. The `Pagination` component would bind its props to `/search/pagination`; a `ProductGrid` to `/search/results`. The component no longer owns the data, it **observes** part of the model — a selector expressed in JSON Pointer, close to MVVM data-binding.

It remains to choose the right granularity level: a **business** model, stable and recognizable (e.g. `search.results`, `search.pagination`), neither a persistence model too low-level, nor a model modeled on the UI. A simple test to situate it: does a third party naturally recognize this node without knowing Thermidor's UI? `search.results` — yes; `productGrid.data` — no.

The honest cost of this shape: each component must declare which business path it observes (a binding to define and maintain), and the typed 1-to-1 mapping — component type → its `XxxState` → `/state/<id>` — gets more complex: a component's state is no longer "its" node, but the result of a binding to a shared business subtree.

## What is the current state of the stateful backend?

Fact verified: **the backend keeps a business state, not a per-component state.** On the `agent-smith` side, `context.state` is a dictionary indexed by business concepts — `query`, `render_plan`, `response_plan` (see `graph_runtime.py` and `PredictStateMapping`, which maps a tool argument to a business `state_key`). The simplest example observed is `{ "query": "boots" }`.

Consequences:

- The business shape (previous section) is **not** a model to invent: it realigns the transport on what the backend already holds.
- The `componentId` link that the state carries today was introduced on **our** side (frontend and sample, with mocks), to satisfy the generic `RemoteController`. It's not the nature of the backend state.
- The backend remains, on this subject, behind the vision — deliberately. The vision (schemas, agnostic contract) was worked out on the frontend side with mocked data; backend emission aligned on a business model remains to be done.

## Conclusion

The doc started from an intuition — interop would settle it — and set it aside: a third party that only wants the data belongs to a dedicated endpoint, not the UI channel. Neither AG-UI nor A2-UI is made for that. Interop therefore doesn't distinguish the two protocols.

Once this false lead is removed, **one** concrete criterion remains for the transport of component state: the component-to-state correlation. AG-UI requires it via a `componentId` bridge (the generic `RemoteController` reads `response.state.components[componentId]`); A2-UI carries it natively (`/state/<id>` in the same protocol as the bindings). **A2-UI removes a layer that AG-UI makes necessary.** It's a real advantage, but modest and circumscribed to component state.

Decision, therefore: for the **transport of component state**, A2-UI (`updateDataModel`) is the simplest choice — one correlation fewer. The **agentic flow** (turns, messages, tool calls, lifecycle) stays in AG-UI in all cases. And a **data-only** third party would belong to a **dedicated endpoint**, independent of this choice.

What remains open — and is a **distinct** decision, not to be confused with the protocol choice:

- **The A2-UI data model shape.** Per-component (`/state/<id>`, simple DX, typed 1-to-1 mapping — the current shape) or business (`/search/results`, aligned on the state the backend already keeps, but component-to-path bindings to maintain)? It's a domain-model choice that engages the contract emitted by the backend, not the protocol.
- **The backend timeline.** The backend already keeps a business state but emits, deliberately, a per-component state on the mocks side. Aligning emission on the chosen shape remains to be planned.

In short: the protocol choice for component state is settled and low-stakes (A2-UI, native correlation); the truly structuring decision — the data model shape — remains open and deserves its own framing.
