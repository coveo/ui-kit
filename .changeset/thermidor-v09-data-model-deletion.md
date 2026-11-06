---
'@coveo/thermidor': patch
---

The renderer stream now deletes a data-model key when Agent Gateway deletes it. A2-UI v1.0 deletes the key at `path` with `updateDataModel` and `value: null`, while the v0.9 renderers delete it only when `value` is omitted and otherwise store `null`. Such an `updateDataModel` is now forwarded without `value`, and an inline `createSurface.dataModel` key set to `null` is no longer seeded. A facet that a refinement removes from a search surface now reads as absent instead of `null`.
