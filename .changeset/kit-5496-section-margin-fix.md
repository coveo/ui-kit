---
'@coveo/atomic': patch
---

Fix section elements with margins showing unwanted whitespace when children are empty or hidden. Added a `MutationObserver` in `ItemSectionMixin` to re-check visibility when children are added/removed or their `style` attribute changes. Also updated `isVisualNode` to treat elements with `style.display: none` as non-visual.
