# @coveo/thermidor

## 0.6.0

### Minor Changes

- [#8752](https://github.com/coveo/ui-kit/pull/8752) [`f42fabe`](https://github.com/coveo/ui-kit/commit/f42fabe1f6fd27bb2e5daf078cf2ea2ab83cfcb6) - List a loading placeholder in `response.surfaces` only while the run that created it streams: while its turn streams, or while the request in flight streams into it, unless the turn had already left it behind when that request started. A placeholder the agent left behind once its run ended, after a cancelled run, an error or a restore, leaves the list, so a consumer draws a skeleton for every surface whose `isLoading` holds, with no rule of its own.

- [#8751](https://github.com/coveo/ui-kit/pull/8751) [`8b3e1e4`](https://github.com/coveo/ui-kit/commit/8b3e1e4627e4b5039b4544c5599bb906c0751442) - Name the dispatching component in an action request.

  An action request (`session.request` with `kind: 'action'`) now carries `component`, the discriminant of the dispatching node, next to the action `name`. A consumer that keeps its own action lists, such as the actions that keep its surfaces usable while they run, keys them by component and action name, typed by the contracts with the new `ComponentActionNames` type:

  ```ts
  const NON_BLOCKING_ACTIONS = {
    RegularFacet: ["search", "clearSearch", "showMoreSearchResults"],
  } as const satisfies ComponentActionNames<typeof ComponentContractsSchema>;
  ```

  `session.actionError` carries the same `component`, so a consumer tells which component's action failed.

- [#8734](https://github.com/coveo/ui-kit/pull/8734) [`b267405`](https://github.com/coveo/ui-kit/commit/b267405456ead7af591d00a816e84b5505990ba2) - The session sends one request at a time, prompts and actions alike, and withholds a dispatch made while a request is in flight. It exposes `session.request` (the request being sent) and `session.sendAndWait(send)` (calls `send` and resolves once the session has answered that dispatch), which can end an optimistic update. A prompt dispatched during a gesture is now withheld instead of cancelling it.

  Breaking: `Session.actions`, `createDispatchCoordinator`, `createSettledDispatch`, `createDispatchTracker`, `createOptimisticValue`, `createStaleScopes` and their types are removed.

- [#8750](https://github.com/coveo/ui-kit/pull/8750) [`52b40b4`](https://github.com/coveo/ui-kit/commit/52b40b42ecd3af9cb7b0696f49d1d368fbeb7cc9) - Scope surfaces to the session, as ADR-018 decides: a surface lives from its `createSurface` until its `deleteSurface`, whichever turn carries them.

  - `session.surfaces` lists every live surface, in creation order. Each turn's `response.surfaces` lists the live surfaces it created.
  - `session.a2uiMessages` is the whole session's renderer stream, in arrival order. It only grows: feed each new message to a single renderer once. A `deleteSurface` precedes a `createSurface` that replaces a live surface, and an operation on a surface that is not live is left out.
  - `session.state` is the validated data model of every live surface, keyed by surface id, whichever turn wrote it. A `createSurface` or `deleteSurface` ends a surface's state, so a re-created surface starts empty and a deleted one is not persisted.
  - An action resolves its source component across every live surface, so an earlier turn's surfaces keep accepting actions. An action only updates the surfaces: its run never changes a turn's status or response. When it fails, whether it is rejected, streams `RUN_ERROR`, ends without a terminal event or its request cannot be built, `session.actionError` reports it and every turn is left as it is.
  - `retry(turnId)` re-submits only the last turn, when it errored, so its answer never lands before later turns' surfaces.

  **Breaking:** `session.actionError` is now an `ActionError` (`message`, `name`, `surfaceId`, `sourceComponentId`) instead of a string, and a failed action no longer fails the active turn. `TurnResponse.a2uiMessages` and `TurnResponse.state` are removed: read `session.a2uiMessages` and `session.state`. A `createSurface` for a surface id that is still live now replaces that surface, so a producer mints a new id for each new surface. The serialized format moves to version 2: it persists the session's `state` in place of the active turn's, and a version 1 session is refused on restore.

- [#8751](https://github.com/coveo/ui-kit/pull/8751) [`8b3e1e4`](https://github.com/coveo/ui-kit/commit/8b3e1e4627e4b5039b4544c5599bb906c0751442) - Add `session.getSnapshot()`, which returns the session's `turns`, `surfaces`, `a2uiMessages`, `state`, `request` and `actionError` as one frozen `SessionSnapshot`. It returns the same object until one of those changes, and neither it nor `subscribe` relies on `this`, so the pair backs any framework store that compares snapshots by reference:

  ```tsx
  const { turns, a2uiMessages, request } = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
  );
  ```

- [#8752](https://github.com/coveo/ui-kit/pull/8752) [`f42fabe`](https://github.com/coveo/ui-kit/commit/f42fabe1f6fd27bb2e5daf078cf2ea2ab83cfcb6) - Open a new turn for a component action the producer announces as opening one, such as a follow-up chip or a search option, as a prompt does.

  A producer announces, by surface id, the actions whose answer it gives as a new turn of the conversation, in the AG-UI `metadata` of the surface's snapshot:

  ```json
  {
    "metadata": {
      "turnOpeningActions": {
        "<surfaceId>": ["selectAction", "selectSearchOption"]
      }
    }
  }
  ```

  The session opens the turn as soon as the action is dispatched, so a consumer shows the shopper's choice right away and declares nothing. The new turn is `streaming` while its answer streams, records the action in `input.action` (`TurnAction`: component, action name, surface id, source node and payload), and becomes the active turn. The surfaces of the turn the action was sent from keep accepting actions. A failed or cancelled turn-opening action fails only its own turn, and `retry(turnId)` re-sends the action from the surface it was dispatched from. Any other action still streams into the active turn. An activity now keeps the AG-UI `metadata` of its event, and a replacing snapshot merges its `metadata` onto the earlier one by entry.

  **Breaking:** `SERIALIZED_SESSION_VERSION` is now 3, since a persisted turn may carry `input.action`; an earlier session is refused on restore.

## 0.5.0

### Minor Changes

- [#8677](https://github.com/coveo/ui-kit/pull/8677) [`9376531`](https://github.com/coveo/ui-kit/commit/93765319deeee8fd6db2ece35ebc9f9e11a0fa17) - **Breaking:** `response.surfaces` now follows the A2-UI surface lifecycle: a surface the agent deletes (`deleteSurface`) leaves the list, one it re-creates moves to the end, and a `createSurface` without a `catalogId` is ignored, as the renderer projection already drops it. During development, a surface without a catalog or created again while it still exists logs a warning.

  `DiscoveredSurface` has a new `isLoading` field, `true` while the surface's data model declares `isLoading: true`, so a consumer can draw a loading placeholder for its `rootComponentType` from `response.surfaces` alone.

  In `response.a2uiMessages`, a plain inline `createSurface.dataModel` key is now projected as an `updateDataModel` at its root JSON Pointer (`isLoading` → `/isLoading`), and a `deleteSurface` for a surface the turn already created and deleted is dropped. A `replace` snapshot no longer carries forward the earlier data-model writes and components of a surface it creates or deletes.

## 0.4.0

### Minor Changes

- [#8550](https://github.com/coveo/ui-kit/pull/8550) [`dd504cb`](https://github.com/coveo/ui-kit/commit/dd504cb2eabb6f2124982599f6cc301833cdf016) - Add a framework-agnostic optimistic dispatch core so a consumer can reflect a user's intention on screen before the producer answers. New public exports: a dispatch coordinator that sees every dispatch and publishes a single in-flight fact, a dispatch tracker that counts outstanding dispatches per region, an optimistic-value controller that holds a gesture's intended value until its producer catches up, and a per-region stale-scope. The session now exposes an `actions` surface for issuing these dispatches, including a `withholdQueued` that drops the still-waiting gestures (each settled `withheld`) when a prompt turn opens, since the prompt rebuilds the state those gestures were writing. A submitted prompt now PREEMPTS instead of being ignored: it opens its turn immediately, dropping the queued gestures (`withholdQueued`) and cancelling the one in flight (`cancelInFlight`, settled `cancelled`) so its superseded response never touches the surface — a prompt is a new intention that outranks the gestures it makes moot.

- [#8581](https://github.com/coveo/ui-kit/pull/8581) [`94b1cb4`](https://github.com/coveo/ui-kit/commit/94b1cb479df253289701d9168b05f3ab991bbb60) - **Breaking:** `Session.submit({prompt})` is removed. Use `session.dispatchAction({name: 'submitPrompt', payload: {prompt}})` instead.

### Patch Changes

- [#8604](https://github.com/coveo/ui-kit/pull/8604) [`90c45e6`](https://github.com/coveo/ui-kit/commit/90c45e69f2c9ad3dc9d848a74216e62eeb02e4c8) - A context provider that throws while a request is built now fails the turn instead of leaving the session stuck on a `streaming` turn that ignores every later prompt and action.

## 0.3.0

### Minor Changes

- [#8532](https://github.com/coveo/ui-kit/pull/8532) [`058edd2`](https://github.com/coveo/ui-kit/commit/058edd2c59da6266bcdc8d08ef724968872fa405) - Widen the `zod` peerDependency to `3.25.76 || ^4`. The injected-contract seam reads only Zod's stable public API (`.options`, `.shape`, `.value`, `.unwrap()`, `.safeParse`), which behaves identically across both majors, so a consumer may inject a contract built from either a Zod 3 or a Zod 4 schema build without a shim. Zod 4 is accepted as a range; the Zod 3 side is pinned to the exact version the A2-UI renderer's binder resolves, since a Zod 3 consumer must share that single install for its schemas to be assignable.

### Patch Changes

- [#8534](https://github.com/coveo/ui-kit/pull/8534) [`6ba526c`](https://github.com/coveo/ui-kit/commit/6ba526c56f1543a16c119c81b96e3d456a4cd158) - Expose `response.a2uiMessages`, the turn's A2-UI message stream downgraded to the v0.9 shape renderers consume, so consumers can pass it straight to a renderer instead of converting v1.0 themselves.

  Agent Gateway emits A2-UI v1.0 exclusively while every available renderer (`@copilotkit/a2ui-renderer`, via `@a2ui/web_core/v0_9`) consumes v0.9, and no v1.0-capable renderer exists yet. Thermidor performs that downgrade on the consumer's behalf, as a derived projection of `activities` — the activities themselves stay raw v1.0. This is deliberately interim and will be removed in a breaking change once a v1.0-capable renderer ships; see the ADR-015 addendum for the recorded rationale and retirement condition.

## 0.2.0

### Minor Changes

- [#8501](https://github.com/coveo/ui-kit/pull/8501) [`58a1787`](https://github.com/coveo/ui-kit/commit/58a1787b66b78d0033232f4a378e3e6dab2c40aa) - Rework `@coveo/thermidor` into a lean session client for the unified converse endpoint.

  The engine/interface/Redux/facade stack is removed and replaced by a single `createSession(config)` factory returning a `Session` that exposes an observable list of `Turn`s folded from the SSE stream, plus a generic, schema-validated remote controller vended from the session. The contracts schema, endpoint URL, and context are consumer-injected, and `zod` is now a peer dependency. This is a breaking change to the entire public surface.

### Patch Changes

- [#8512](https://github.com/coveo/ui-kit/pull/8512) [`667f3e6`](https://github.com/coveo/ui-kit/commit/667f3e6cf552758340f7f15f9aad33fd232935e3) - Persist Gateway session metadata from AG-UI run events so remote actions stay in the active conversation.

- [#8503](https://github.com/coveo/ui-kit/pull/8503) [`1dbe710`](https://github.com/coveo/ui-kit/commit/1dbe710536179c7f2dbfe1a6cfd342372ce67721) - Use Thermidor Schema beta.5 so the session client exposes the canonical commerce action contracts.

## 0.1.0

### Minor Changes

- [#8482](https://github.com/coveo/ui-kit/pull/8482) [`7891c28`](https://github.com/coveo/ui-kit/commit/7891c284d971f81499a60755aae75e8841791064) - Trimmed `@coveo/thermidor` to the minimal surface consumed by the `demo-schema-react` sample (the unified conversational + `@coveo/thermidor-schema` experience).

  - Removed the legacy `/converse` generative stack, the standalone search/commerce controllers and `public/actions` helpers, the non-unified interface builders (`buildGenerativeInterface`, `buildSearchInterface`, `buildCommerceInterface`), and the internal API/feature machinery that only supported them.
  - Reduced the public API to what the sample uses: `Engine`, `buildGenerativeUnifiedInterface`, `buildUnifiedConverseController`, `buildRemoteController`, `selectRemoteControllerState`, and their supporting types (`GenerativeUnifiedInterface`, `Controller`, `UnifiedConverseControllerState`, `RemoteController`, `RemoteControllerSource`, `ComponentType`, `Activity`, `AgentMessage`, `AgentResponse`, `ReasoningStep`, `ToolCallStep`, `Turn`).
  - Pruned all now-unused exports and dead files across the remaining internal modules, and enabled Knip enforcement for the package to keep it from regrowing.
  - Removed the client-side commerce state-management layer entirely. In the unified experience the remote controller derives all component state from the A2UI snapshot (`agentResponse.state`), so the feature slices/actions/selectors (`facets`, `sort`, `pagination`, `product-list`, `search-box`, `query-correction`, `triggers`), the `commerce-search`/`commerce-query-suggest` API subsystems, and the surface-hydration → slice population they fed were all dead in production (exercised only by their own tests). Surface hydration now produces the routed interface + snapshot only.

### Patch Changes

- [#8484](https://github.com/coveo/ui-kit/pull/8484) [`612cd2b`](https://github.com/coveo/ui-kit/commit/612cd2b608212ce149dbf57efb4d04fee14adeaa) - Removed the remaining dead code in `@coveo/thermidor` after the unified-surface trim.

  - Removed the orphaned snapshot-hydration chain: `Engine.storeHydrationSnapshot` (method, wiring, private impl, `#hydrationSnapshots` map and the `#adoptSlice` consumption branch) and the `generative-hydration.ts` module (`getOrCreateHydrateFromSnapshotAction`), which no runtime code path reached.
  - Removed `deserializeToGenerativeState` (test-only; the controller uses its own private hydration), keeping the still-used `SerializedConverseState` / `SerializedTurn` types.
  - Pruned dead interface-framework types (`SearchInterface`, `CommerceInterface`, `ActionIntent` and its `*Context` inputs, the `search`/`commerce` `InterfaceRegistry` entries) and the matching dead barrel re-exports.
  - Removed unreferenced request context types in the unified endpoint types, the unused `getActiveMessage` selector, and the test-only configuration selectors (`getOrganizationId` / `getAccessToken` / `getEndpoint` and the `createConfigurationSelectors` factory).

- [#8452](https://github.com/coveo/ui-kit/pull/8452) [`95a2707`](https://github.com/coveo/ui-kit/commit/95a2707b292ee5f67aa9f6082a874363113c0c29) - Updated `@coveo/thermidor-schema` dependency to `1.0.0-beta.3`.

## 0.0.3

### Patch Changes

- [#8319](https://github.com/coveo/ui-kit/pull/8319) [`6917368`](https://github.com/coveo/ui-kit/commit/69173688c232edd4beced6df237795ec23e89747) - Export schema-derived remote controller contract, state, and action types from the public package entry point.

## 0.0.2

### Patch Changes

- [#8182](https://github.com/coveo/ui-kit/pull/8182) [`03b4030`](https://github.com/coveo/ui-kit/commit/03b4030581c49ab0304d1608bd79701d47340d2e) - Keep unified turns streaming until their terminal event, distinguish unified generative interfaces from legacy ones, and translate incremental commerce sort updates.

- [#8182](https://github.com/coveo/ui-kit/pull/8182) [`03b4030`](https://github.com/coveo/ui-kit/commit/03b4030581c49ab0304d1608bd79701d47340d2e) - Route unified endpoint calls without temporary AgentCore runtime overrides.

## 0.0.1

### Patch Changes

- [#7884](https://github.com/coveo/ui-kit/pull/7884) [`75d07f2`](https://github.com/coveo/ui-kit/commit/75d07f242050a9b293450fc53798a025d78ac96d) - Publish initial version of `@coveo/thermidor`.
