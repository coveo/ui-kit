---
'@coveo/atomic': minor
---

Stop category facets from clearing every filter when the selected value is clicked. In `atomic-category-facet` and `atomic-commerce-category-facet`, the deepest selected value is no longer interactive: it shows which filter is applied instead of acting as a button that discarded the whole path. The applied value is now also displayed as a pill next to a `Clear` button, which is what removes the filter.

The `active-parent` part is now rendered on a non-interactive `span` instead of a `button`. Custom styles or scripts that targeted it as a button (e.g., hover or focus styles, or programmatic clicks) need to be updated. New parts are available to style the pill: `selected-value`, `selected-value-pill`, `selected-value-clear-button` and `selected-value-clear-button-icon`.
