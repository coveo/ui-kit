---
'@coveo/atomic': minor
---

Add `atomic-facet-popover`, which displays a facet as a popover menu, and deprecate `atomic-popover`, which it replaces. The new component takes the same slotted facet and exposes the same parts, so you only need to rename the tag, including in your `::part()` selectors. `atomic-popover` still works and logs a warning through the engine logger, once per engine. Version 4 removes it.
