---
'@coveo/thermidor': minor
---

**Breaking:** `DiscoveredSurface` has a new required `isLoading` field, `true` while the surface's data model declares `isLoading: true`, so a consumer can draw a loading placeholder for its `rootComponentType` from `response.surfaces` alone. `response.surfaces` now follows the A2-UI surface lifecycle: a surface the agent deletes (`deleteSurface`) leaves the list, and one it re-creates moves to the end.

In `response.a2uiMessages`, a plain inline `createSurface.dataModel` key is now projected as an `updateDataModel` at its root JSON Pointer (`isLoading` → `/isLoading`), and a `deleteSurface` for a surface the turn already created and deleted is dropped. A `replace` snapshot no longer carries forward the earlier data-model writes and components of a surface it creates or deletes.
