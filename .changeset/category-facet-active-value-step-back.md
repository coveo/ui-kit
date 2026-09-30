---
'@coveo/atomic': patch
---

Fix category facets clearing every filter when the deepest selected value is clicked. In `atomic-category-facet` and `atomic-commerce-category-facet`, clicking the active (deepest selected) value now moves back up one level instead of discarding the whole path, matching what clicking a parent value already does. This was most disruptive on leaf values, where the active value is the only element representing the selection. Clearing the entire facet remains available through the "All Categories" button and the facet header's clear-filters button.
