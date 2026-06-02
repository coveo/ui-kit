---
'@coveo/atomic': patch
---

Pressing Escape in the search box (search and commerce) now collapses the suggestions popup deterministically, preventing a late asynchronous query-suggestion fetch from re-opening it after dismissal.
