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
| 22  | Cart controller scope        | `setItems(items[])` only                                                        |
| 23  | A2UI contract style          | Typed operation union + normalized render-agnostic state                        |
| 24  | Phase 3 mode model           | `search-first \| assistant-first` only                                          |

---

## Phase Map

### Phase 0 — Cleanup PR

Delete: `api/adapters/`, current `api/conversation/`, `api/protocol/` (move first), `core/internal/{conversation,surfaces,orchestration,context-bridge,navigator-context}/`, matching `core/interface/` and `public/controllers/` dirs.
Move: `api/protocol/*.ts` → `api/shared/` (rename `types.ts` → `stream-types.ts`).
Update exports in `src/index.ts`, `core/index.ts`, `interface-types.ts`, `controllers/index.ts`, `actions/index.ts`.

### Phase 0.5 — Sample Bootstrap

Create `samples/headless-future/` — Vite + React 18 + TypeScript. Engine instantiated from env vars. Listed in `pnpm-workspace.yaml`.

### Phase 1 — Basic Conversation Flow

- **1.0** Types-only PR: `ConversationController` interface + `ConversationControllerState`
- **1.1** Conversation state domain (Layer 0): slice, mutators, selectors, tests
- **1.2** Engine constructor + `EngineOptions` + navigator context provider
- **1.3** Cart controller: `buildCartController` with `setItems` only
- **1.4** HTTP + stream utilities: `api/shared/http.ts` + `api/shared/stream.ts`
- **1.5** Request builder: `buildConverseRequestBody(engine, input)`
- **1.6** Event dispatcher + turn lifecycle helpers
- **1.7** Conversation runtime (Layer 1 WeakMap singleton)
- **1.8** Conversation controller (Layer 2) + export
- **1.9** Sample: wire controller to real endpoint — full end-to-end

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

| Sub-phase | Branch                     | Status         |
| --------- | -------------------------- | -------------- |
| Phase 0   | add-conversational-support | ✅ completed   |
| Phase 0.5 | —                          | ⬜ not started |
| Phase 1.0 | —                          | ⬜ not started |
| Phase 1.1 | —                          | ⬜ not started |
| Phase 1.2 | —                          | ⬜ not started |
| Phase 1.3 | —                          | ⬜ not started |
| Phase 1.4 | —                          | ⬜ not started |
| Phase 1.5 | —                          | ⬜ not started |
| Phase 1.6 | —                          | ⬜ not started |
| Phase 1.7 | —                          | ⬜ not started |
| Phase 1.8 | —                          | ⬜ not started |
| Phase 1.9 | —                          | ⬜ not started |
| Phase 2.0 | —                          | ⬜ not started |
| Phase 2.1 | —                          | ⬜ not started |
| Phase 2.2 | —                          | ⬜ not started |
| Phase 2.3 | —                          | ⬜ not started |
| Phase 3.0 | —                          | ⬜ not started |
| Phase 3.1 | —                          | ⬜ not started |
| Phase 3.2 | —                          | ⬜ not started |
