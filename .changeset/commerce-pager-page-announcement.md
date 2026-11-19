---
'@coveo/atomic': patch
---

`atomic-commerce-pager` now announces the 1-based page number to screen readers ("Page 4 loaded" on the button labelled 4), as `atomic-pager` and `atomic-insight-pager` do. Before, it announced the 0-based page index, one less than the page shown.
