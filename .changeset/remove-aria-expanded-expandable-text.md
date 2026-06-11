---
'@coveo/atomic': patch
---

Removed `aria-expanded` from the expandable text "Show more" button when it is a one-way reveal (non-collapsible). The attribute is preserved when `isCollapsible` is true, since that follows the disclosure pattern.
