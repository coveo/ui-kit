---
'@coveo/atomic': minor
---

Add the `clear-recent-button-position` property to `atomic-search-box` and `atomic-commerce-search-box`. It defaults to `top`, which keeps the current behavior, but `bottom` will become the default in the next major version of Atomic (v4). When it is set to `bottom`, the "Recent searches" title above the recent queries is no longer a suggestion, and a "Clear recent searches" button is rendered at the bottom of the suggestions, next to "See all results" when instant results are displayed. The Down arrow key goes straight to the first suggestion, the button is reached with the Tab key, and pressing Escape on it closes the suggestions. The button can be styled with the new `recent-query-clear-button` part.
