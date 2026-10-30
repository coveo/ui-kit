---
'@coveo/atomic': patch
---

In `atomic-search-box` and `atomic-commerce-search-box`, pressing Enter now runs a search after a suggestion was highlighted with the arrow keys and the suggestions were closed, for example with Escape. Before, Enter did nothing until the text in the search box was changed.
