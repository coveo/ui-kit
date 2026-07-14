---
'@coveo/atomic': patch
---

fix(atomic): render result excerpt in Chrome at compact density

Removed the redundant `max-height` from the `atomic-result-section-excerpt` list and table utilities. A `max-height` equal to the clamped number of lines, stacked on top of `-webkit-line-clamp`, caused Chrome/Blink to collapse the excerpt to 0 height (the text was present in the DOM but not rendered) at `density="compact"` on desktop viewports (>= 1024px). Truncation is now handled by `-webkit-line-clamp` alone, consistent with the grid variant, which was unaffected.
