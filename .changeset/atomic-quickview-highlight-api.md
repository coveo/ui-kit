---
'@coveo/atomic': patch
---

`atomic-quickview-modal` now paints keyword highlights with the CSS Custom Highlight API instead of changing the inline styles of the previewed document. Showing, hiding and navigating keywords no longer modifies that document's DOM. Keyword highlighting in the quickview now requires Chrome 105, Safari 17.2 or Firefox 140 or later.
