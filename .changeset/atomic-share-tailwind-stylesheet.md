---
'@coveo/atomic': patch
---

Parse the global Tailwind stylesheet once per page instead of once per component type. Every component now adopts the same `CSSStyleSheet`, which saves about 0.2 MB of memory and 0.4 ms of style parsing for each component type on the page. When a layout sets `mobile-breakpoint`, the components that follow it adopt their own copy with that breakpoint, so the other components keep theirs as before.
