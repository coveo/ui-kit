---
'@coveo/atomic': patch
---

Stop category facets from clearing every filter when the selected value is clicked. In `atomic-category-facet` and `atomic-commerce-category-facet`, the deepest selected value is no longer interactive: it shows which filter is applied instead of acting as a button that discarded the whole path. The applied value is now also displayed as a pill next to a `Clear` button, which is what removes the filter.
