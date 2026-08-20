---
'@coveo/atomic': patch
---

Fix `must-match-*`, `must-not-match-*` and `depends-on-*` attributes being ignored when a component
is created in JavaScript rather than written in HTML.

These attributes were only read in the constructor, before `setAttribute` had been called. On result
templates the conditions were dropped, so every template matched every result and a catch-all won.
They are now read again once the element is connected.
