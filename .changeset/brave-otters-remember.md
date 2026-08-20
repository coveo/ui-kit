---
'@coveo/atomic': patch
---

Fix prefixed map properties being empty when components are created programmatically.

Properties declared with `mapProperty` — `must-match-*` and `must-not-match-*` on the result,
product and children templates and the field conditions, and `depends-on-*` on the facets — read
their attributes from a Lit initializer, which runs in the constructor. An element parsed from
markup already has its attributes at that point, but one created programmatically does not: a
framework calls `document.createElement`, sets the attributes, then inserts the element. Those
attributes are prefixed, so they never map to a reactive property Lit would observe, and the value
stayed empty for the element's whole lifetime.

For result templates this meant `must-match-*` conditions were dropped, so every template matched
every result and the last registered one won — typically a catch-all. Attributes are now read again
once the element is connected.
