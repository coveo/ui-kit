---
'@coveo/thermidor': patch
---

A surface that a later answer creates again under its live id now stays with the turn that first created it. Before, a `createSurface` that replaced a live surface moved it to the turn that recorded the replacement, so the answer to an action that opens no turn, such as `restoreState`, moved an earlier turn's surface to the latest turn. `TurnResponse.surfaces` keeps the surface, and a surface the initialization created stays in no turn. A surface created again after its `deleteSurface` still belongs to the turn that creates it.
