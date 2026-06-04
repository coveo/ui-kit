---
'@coveo/atomic': patch
---

Pressing Escape in the search box (search, commerce and insight) now collapses the suggestions popup deterministically, preventing a late asynchronous query-suggestion fetch from re-opening it after dismissal.
