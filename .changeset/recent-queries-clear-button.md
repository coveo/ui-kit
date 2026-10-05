---
'@coveo/atomic': minor
---

Move the option to clear recent queries out of the list of suggestions in `atomic-search-box` and `atomic-commerce-search-box`. It is now a "Clear recent searches" button below the suggestions that is reached with the Tab key, instead of the first item reached with the Down arrow key. While this button is displayed, pressing Tab no longer closes the suggestions.

The `recent-query-title-item`, `recent-query-title-content` and `recent-query-title` parts were removed, and the `recent-query-clear` part now targets the button.
