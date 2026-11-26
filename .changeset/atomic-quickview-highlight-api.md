---
'@coveo/atomic': patch
---

`atomic-quickview-modal` now finds the query keywords in the previewed document itself and paints them with the CSS Custom Highlight API. The document is retrieved without the Search API highlight tags and is no longer modified to show, hide or navigate keywords. Keyword highlighting in the quickview now requires Chrome 105, Safari 17.2 or Firefox 140 or later.
