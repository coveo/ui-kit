---
'@coveo/thermidor': minor
---

**Breaking:** `response.surfaces` now follows the A2-UI surface lifecycle: a surface the agent deletes (`deleteSurface`) leaves the list, one it re-creates moves to the end, and a `createSurface` without a `catalogId` is ignored, as the renderer projection already drops it. During development, a surface without a catalog or created again while it still exists logs a warning.

`DiscoveredSurface` has a new `isLoading` field, `true` while the surface's data model declares `isLoading: true`, so a consumer can draw a loading placeholder for its `rootComponentType` from `response.surfaces` alone.

In `response.a2uiMessages`, a plain inline `createSurface.dataModel` key is now projected as an `updateDataModel` at its root JSON Pointer (`isLoading` → `/isLoading`), and a `deleteSurface` for a surface the turn already created and deleted is dropped. A `replace` snapshot no longer carries forward the earlier data-model writes and components of a surface it creates or deletes.
