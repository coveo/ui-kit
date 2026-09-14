---
"@coveo/thermidor": patch
---

Removed the remaining dead code in `@coveo/thermidor` after the unified-surface trim.

- Removed the orphaned snapshot-hydration chain: `Engine.storeHydrationSnapshot` (method, wiring, private impl, `#hydrationSnapshots` map and the `#adoptSlice` consumption branch) and the `generative-hydration.ts` module (`getOrCreateHydrateFromSnapshotAction`), which no runtime code path reached.
- Removed `deserializeToGenerativeState` (test-only; the controller uses its own private hydration), keeping the still-used `SerializedConverseState` / `SerializedTurn` types.
- Pruned dead interface-framework types (`SearchInterface`, `CommerceInterface`, `ActionIntent` and its `*Context` inputs, the `search`/`commerce` `InterfaceRegistry` entries) and the matching dead barrel re-exports.
- Removed unreferenced request context types in the unified endpoint types, the unused `getActiveMessage` selector, and the test-only configuration selectors (`getOrganizationId` / `getAccessToken` / `getEndpoint` and the `createConfigurationSelectors` factory).
