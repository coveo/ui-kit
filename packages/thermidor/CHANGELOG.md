# @coveo/thermidor

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
