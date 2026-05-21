# Conversational POC — Overarching Plan

> Branch: `add-conversational-support` → PR #7540
> Repo: `coveo/ui-kit` → `packages/headless-future`

## Goal

Deliver an end-to-end agentic conversation flow in three phases, each built bottom-up with unit tests before wiring.

**Cadence:** Every sub-phase = ~1 PR on a dedicated branch, merged into `add-conversational-support`. Build + tests must pass on every PR. Sample at `samples/headless-future/` updated every sub-phase.

---

## Workflow (per sub-phase)

1. Check out a new branch off `add-conversational-support`
2. Start a new planning session — attach `.github/prompts/conversational-poc-subphase-kickoff.prompt.md`
3. Run the grill-me interview (focused on that sub-phase only)
4. Implement
5. Review + merge into `add-conversational-support`

---

## Architecture Quick Reference

- **packages/headless-future**: Four-layer architecture: Layer 0 (Engine/Redux hidden), Layer 1 (API clients, internal), Layer 2 (controllers, public factory functions), Layer 3 (actions, public escape hatch)
- **Engine**: `new Engine(options?: EngineOptions)` — `EngineOptions = { configuration?: ConfigurationState; navigatorContextProvider?: () => NavigatorContext }`
- **Navigator context**: Provider called lazily per turn (NOT stored in state slice)
- **Converse endpoint**: `{endpoint}/rest/organizations/{orgId}/commerce/unstable/agentic/converse`
- **Controller shape**: Factory function + plain object (modeled on `buildSearchBoxController`)
- **Test runner**: Vitest — `pnpm --filter @coveo/headless-future test`

---

## Locked Decisions

| #   | Decision                     | Chosen                                                                          |
| --- | ---------------------------- | ------------------------------------------------------------------------------- |
| 1   | PR scope                     | Phase 0 (hard reset) first, then 1 sub-phase per PR                             |
| 2   | Phase 1 scope                | Banned: A2UI, persistence, retry, orchestration, context-bridge                 |
| 3   | Phase 1 success              | User submits prompt, sees streamed text in sample                               |
| 4   | Controller style             | Factory function returning plain object                                         |
| 5   | submitTurn return            | `Promise<void>` — errors in state                                               |
| 6   | abortTurn with no turn       | Silent no-op                                                                    |
| 7   | State minimal                | messages, turns, activeTurnId, session, isLoading, error, streaming.isConnected |
| 8   | subscribe callback           | `() => void`; consumer reads controller.state                                   |
| 9   | HTTP/stream split            | `api/shared/http.ts` + `api/shared/stream.ts`                                   |
| 10  | SSE parsing location         | Moved flat into `api/shared/`                                                   |
| 11  | Auth                         | accessToken from configuration state                                            |
| 12  | Token refresh                | No in Phase 1; set error in state                                               |
| 13  | Request body                 | Barca wire format, read from engine state                                       |
| 14  | Event scope Phase 1          | Parse broadly, store only essential fields                                      |
| 15  | Unknown/custom events        | Record warning in turn state                                                    |
| 16  | Missing terminal event       | Failed/interrupted (barca parity)                                               |
| 17  | Session continuity           | In-memory across turns via conversation.session                                 |
| 18  | Adapters                     | Deleted entirely in Phase 0                                                     |
| 19  | Orchestration/context-bridge | Deleted in Phase 0; reintroduced in Phase 3                                     |
| 20  | Navigator context slice      | Deleted; provider pattern replaces it                                           |
| 21  | Engine constructor update    | Separate PR in Phase 1.2 (not in cleanup)                                       |
| 22  | Cart controller scope        | `setItems(payload)` and `updateItemQuantity(payload)`                           |
| 23  | A2UI contract style          | Typed operation union + normalized render-agnostic state                        |
| 24  | Phase 3 mode model           | `search-first \| assistant-first` only                                          |

---

## Phase Map

### Phase 0 — Cleanup PR

Delete: `api/adapters/`, current `api/conversation/`, `api/protocol/` (move first), `core/internal/{conversation,surfaces,orchestration,context-bridge,navigator-context}/`, matching `core/interface/` and `public/controllers/` dirs.
Move: `api/protocol/*.ts` → `api/shared/` (rename `types.ts` → `stream-types.ts`).
Update exports in `src/index.ts`, `core/index.ts`, `interface-types.ts`, `controllers/index.ts`, `actions/index.ts`.

Completed checklist:

- [x] Deleted `api/adapters/` and `api/conversation/` (including associated tests)
- [x] Moved protocol files to `api/shared/` and renamed `types.ts` to `stream-types.ts`
- [x] Deleted targeted Layer 0 domains under `core/internal/` and `core/interface/` for conversation, surfaces, orchestration, context-bridge, and navigator-context
- [x] Deleted targeted Layer 2/3 modules: conversation/surface/orchestration/context-bridge controllers and navigator-context actions
- [x] Updated exports and references in `src/index.ts`, `src/api/index.ts`, `core/interface/interface-types.ts`, `public/controllers/index.ts`, and `public/actions/index.ts`
- [x] Deleted obsolete doc `packages/headless-future/docs/unified-interface-example.md`
- [x] Updated conversational POC plan trackers (`.github/prompts/conversational-poc-plan.md` and `/memories/repo/conversational-poc-plan.md`) with Phase 0 completion details
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

### Phase 0.5 — Sample Bootstrap

Create `samples/headless-future/` — Vite + React + TypeScript. Engine instantiated from env vars. Listed in `pnpm-workspace.yaml`.

Completed checklist:

- [x] Created new sample app at `samples/headless-future/conversation-react` (Vite + React + TypeScript scaffold)
- [x] Added sample package scripts and workspace wiring (`dev`, `build`, `preview`, `test`, `e2e`, `e2e:watch`) and included `samples/headless-future/*` in `pnpm-workspace.yaml`
- [x] Added environment bootstrap files (`.env.example`, `.env.e2e`) and runtime env loader enforcing required Coveo vars
- [x] Initialized Headless Future engine from sample env-backed configuration in sample runtime
- [x] Added minimal sample UI shell rendering initialized configuration metadata
- [x] Added sample unit smoke test (Vitest) and browser smoke test (Playwright) for app-load validation
- [x] Added sample test config split (`vite.config.ts` + `vitest.config.ts`) with alias resolution needed by `@coveo/headless-future`
- [x] Updated sample documentation (`samples/README.md` and sample-local README) to include the new Headless Future category and setup
- [x] Verified sample health with `pnpm --filter @samples/headless-future-conversation-react test` and `pnpm --filter @samples/headless-future-conversation-react e2e`
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

### Phase 1 — Basic Conversation Flow

- **1.0** Types-only PR: `ConversationController` interface + `ConversationControllerState`
- **1.1** Conversation state domain (Layer 0): slice, mutators, selectors, tests
- **1.2** Engine constructor + `EngineOptions` + navigator context provider
- **1.3** Cart controller: `buildCartController` with `setItems` and `updateItemQuantity`
- **1.4** HTTP + stream utilities: `api/shared/http.ts` + `api/shared/stream.ts`
- **1.5** Conversation API facade + request contributors: compose the converse request from registered contributors (modeled after the search endpoint facade pattern)
- **1.6** Event dispatcher + turn lifecycle helpers
- **1.7** Conversation runtime (Layer 1 WeakMap singleton)
- **1.8** Conversation controller (Layer 2) + export
- **1.9** Sample: wire controller to real endpoint — full end-to-end

Completed checklist for 1.0:

- [x] Added Layer 0 conversation interface types under `src/core/interface/conversation/conversation-types.ts`
- [x] Defined documented `ConversationController` public interface in `src/public/controllers/conversation/conversation-controller.ts`
- [x] Exported `ConversationController` and `ConversationControllerState` through `src/public/controllers/index.ts`
- [x] Re-exported conversation interface types and added optional `conversation` state to the root `State` interface in `src/core/interface/interface-types.ts`
- [x] Kept the public contract minimal for Phase 1.0: `submitTurn(input)`, `abortTurn()`, `state`, and `subscribe(callback)`
- [x] Refined the conversation domain shape during Phase 1.0 review: roles are `user | agent`, `TurnStatus` is a discriminated union derived from a `TurnStatusMap`, turns use ordered `messageIds`, and session continuity includes optional `conversationToken`
- [x] Added a shell test file placeholder for future controller implementation tests in Phase 1.8
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

Completed checklist for 1.1:

- [x] Added the Layer 0 conversation slice under `src/core/internal/conversation/conversation-slice.ts`
- [x] Implemented the Phase 1.1 reducer surface: `startTurn`, `appendAgentChunk`, `completeTurn`, `failTurn`, `abortTurn`, `setSession`, `setError`, and `setStreamingConnected`
- [x] Kept reducers pure with caller-supplied turn/message IDs and silent no-op behavior for unknown turns
- [x] Modeled agreed lifecycle behavior: eager placeholder agent message creation, terminal action cleanup, abort placeholder removal, and full session replacement
- [x] Added library-agnostic conversation mutators and selectors under `src/core/interface/conversation/`
- [x] Added reducer and engine-backed selector/mutator coverage for the conversation state domain
- [x] Documented public operation payload types and normalized JSDoc formatting in `src/core/interface/conversation/conversation-types.ts`
- [x] Strengthened slice test coverage: added high-priority test cases for fail/abort no-ops, fail-after-streaming, and multi-turn accumulation (16 tests total)
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

Completed checklist for 1.2:

- [x] Added `EngineOptions` under `src/core/interface/engine/engine-options.ts` with optional `configuration` and `navigatorContextProvider`
- [x] Added minimal navigator context types under `src/core/interface/navigator-context/navigator-context-types.ts` (`clientId`, `location`, `referrer`, `userAgent`)
- [x] Updated `Engine` constructor to `new Engine(options?: EngineOptions)` and wired navigator context provider storage for lazy retrieval
- [x] Implemented `getNavigatorContextProvider()` for Phase 1.5 request-contributor composition in the conversation API facade (exposed via `FullEngine` type only; internal to preserve minimal public API)
- [x] Restored planned missing-provider behavior: warn and continue when no `navigatorContextProvider` is configured (warn-on-first-use)
- [x] Updated `Engine` constructor tests to cover options-based configuration, provider wiring, and missing-provider warning behavior
- [x] Exported `EngineOptions`, `NavigatorContext`, and `NavigatorContextProvider` via `src/core/index.ts` and package root `src/index.ts`
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`
- [x] Post-Phase-1.2 refinement: moved `getNavigatorContextProvider()` from public `Engine` to internal `FullEngine` type to minimize public API surface

Completed checklist for 1.3:

- [x] Added the Layer 2 cart controller under `src/public/controllers/cart/cart-controller.ts`
- [x] Added dedicated cart controller contracts under `src/public/controllers/cart/cart-controller-types.ts` and shared base contracts under `src/public/controllers/controller-types.ts`
- [x] Implemented `buildCartController(options)` with `state`, `setItems(payload)`, `updateItemQuantity(payload)`, and `subscribe(callback)`
- [x] Kept cart controller state minimal (`{items}`) and removed derived `products` exposure from the public cart selector surface
- [x] Exported `buildCartController`, `CartController`, and `CartControllerOptions` through `src/public/controllers/index.ts`
- [x] Refactored cart mutators to payload-based contracts (`SetCartItemsPayload`, `UpdateItemQuantityPayload`)
- [x] Simplified cart domain types by removing unused aggregation types/utilities (`CartItemParam`, `getProductsFromCartState`)
- [x] Refactored Layer 3 cart actions to named payload-based exports (`setCartItems`, `updateCartItemQuantity`)
- [x] Added/updated cart domain coverage: selector unit tests (pure fixtures), mutator shape tests, controller tests, and action wiring tests
- [x] Refined cart controller tests to a hybrid strategy: public behavior coverage (including explicit `state` getter assertions) plus minimal isolated wiring checks
- [x] Added JSDoc for cart controller and cart actions public contracts
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

Completed checklist for 1.4:

- [x] Replaced legacy shared HTTP client module with `src/api/shared/http.ts` while preserving the result-style `executeHttpRequest` contract
- [x] Added callback-based raw SSE stream utility in `src/api/shared/stream.ts` (`readEventStream`)
- [x] Updated Layer 1 exports in `src/api/index.ts` and migrated search API wiring to import HTTP utility from `src/api/shared/http.ts`
- [x] Added HTTP utility unit coverage in `src/api/shared/http.test.ts`
- [x] Added stream utility unit coverage in `src/api/shared/stream.test.ts`
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

Completed checklist for 1.5:

- [x] Added dedicated conversation endpoint client contracts under `src/api/interface/conversation-endpoint/conversation-endpoint-types.ts`
- [x] Added Layer 1 conversation endpoint client under `src/api/interface/conversation-endpoint/conversation-endpoint-client.ts` for converse transport calls
- [x] Implemented converse request contract mapping to include tracking/config fields, navigator context, cart context, session continuity, and hardcoded `targetEngine: 'AGENT_CORE'`
- [x] Added conversation endpoint client unit coverage in `src/api/interface/conversation-endpoint/conversation-endpoint-client.test.ts`
- [x] Added Layer 1 conversation API facade under `src/core/interface/api/conversation-endpoint/conversation-endpoint-facade.ts`
- [x] Introduced pull-model request contribution infrastructure with engine-scoped endpoint-keyed registry in `src/core/internal/api/base-facade/endpoint-contributor-registry.ts`
- [x] Added conversation endpoint state ownership (`status`, `error`, `streaming.isConnected`, `configuration`) under `src/core/internal/api/conversation-endpoint/` with interface wrappers/tests in `src/core/interface/api/conversation-endpoint/`
- [x] Narrowed conversation domain ownership by removing endpoint-operational fields (`isLoading`, `error`, `streaming`) from `src/core/internal/conversation/conversation-slice.ts` and corresponding conversation selector/mutator surface
- [x] Added feature-owned loaders for pull-model contributions:
  - [x] `src/core/interface/api/conversation-endpoint/conversation-endpoint-loader.ts`
  - [x] `src/core/interface/conversation/conversation-loader.ts`
  - [x] `src/core/interface/cart/cart-loader.ts`
- [x] Updated request composition merging to safely compose nested cross-feature fragments in `src/core/internal/api/base-facade/endpoint-facade-request-builder.ts`
- [x] Inlined conversation endpoint default contributor registration into `conversation-endpoint-loader` and removed standalone helper module
- [x] Hardened contributor registry API by returning readonly snapshots (no mutable internal array exposure)
- [x] Removed request-configuration double source ambiguity by centralizing configuration reads in internal `configuration-reader` helpers reused by facades/loaders (no endpoint-config snapshot write dependency in the facade)
- [x] Centralized endpoint keys as shared exported constants under `src/core/internal/api/base-facade/endpoint-keys.ts`
- [x] Tightened interface boundaries by removing cross-interface loader calls from `conversation-endpoint-facade` (it now loads only `conversation-endpoint`)
- [x] Removed pure-indirection `endpoint-client-configuration` wrapper in favor of direct usage of internal `configuration-reader` helpers
- [x] Added/updated unit coverage for new loaders, registry, request-builder behavior, and conversation endpoint facade behavior
- [x] Exported conversation endpoint facade/contracts through `src/core/index.ts` and `src/api/index.ts`
- [x] Verified package health with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`

Carry-forward checklist (to avoid losing architectural intent in 1.6/1.7/1.8):

- [ ] **1.6** Move conversation endpoint terminal lifecycle transitions fully into event dispatcher flow (`pending -> streaming -> completed/failed/aborted`) so endpoint status represents full turn+stream lifecycle
- [ ] **1.6** Ensure stream connectivity (`streaming.isConnected`) is driven by stream open/close events rather than request completion timing
- [ ] **1.7** Keep conversation runtime as owner of stream consumption and terminal status/error mutations; facade should remain transport/request orchestration only
- [ ] **1.7** Add runtime-level safeguards for overlapping submissions/aborts so concurrent turns cannot leave endpoint status in inconsistent state
- [ ] **1.8** Compose controller state from conversation domain + conversation endpoint state and verify subscribe semantics remain stable across both slices
- [ ] **1.8** Add controller-focused tests asserting lifecycle visibility (loading/streaming/error) against runtime-driven transitions

### Phase 2 — A2UI Surface Parsing

- **2.0** A2UI protocol contract in `stream-types.ts`
- **2.1** Surface state domain (Layer 0)
- **2.2** Surface operations processor (Layer 1)
- **2.3** Surface controller (Layer 2) + sample rendering

### Phase 3 — Orchestration

- **3.0** `OrchestrationMode` domain + local heuristic
- **3.1** Orchestration controller + context-bridge reintroduction
- **3.2** Sample handoff — search + conversation side-by-side

---

## Status Tracker

| Sub-phase | Branch                           | Status         |
| --------- | -------------------------------- | -------------- |
| Phase 0   | add-conversational-support       | ✅ completed   |
| Phase 0.5 | add-conversational-support       | ✅ completed   |
| Phase 1.0 | add-conversation-types           | ✅ completed   |
| Phase 1.1 | add-slice-mutators-and-selectors | ✅ completed   |
| Phase 1.2 | add-navigator-context            | ✅ completed   |
| Phase 1.3 | adjust-cart                      | ✅ completed   |
| Phase 1.4 | add-stream-utils                 | ✅ completed   |
| Phase 1.5 | add-conversation-endpoint        | ✅ completed   |
| Phase 1.6 | —                                | ⬜ not started |
| Phase 1.7 | —                                | ⬜ not started |
| Phase 1.8 | —                                | ⬜ not started |
| Phase 1.9 | —                                | ⬜ not started |
| Phase 2.0 | —                                | ⬜ not started |
| Phase 2.1 | —                                | ⬜ not started |
| Phase 2.2 | —                                | ⬜ not started |
| Phase 2.3 | —                                | ⬜ not started |
| Phase 3.0 | —                                | ⬜ not started |
| Phase 3.1 | —                                | ⬜ not started |
| Phase 3.2 | —                                | ⬜ not started |
