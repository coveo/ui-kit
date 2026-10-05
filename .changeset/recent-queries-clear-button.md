---
'@coveo/atomic': minor
---

Move the option to clear recent queries out of the list of suggestions. In `atomic-search-box` and `atomic-commerce-search-box`, the "Recent searches / Clear" item no longer sits at the top of the suggestions, where it was the first item reached with the Down arrow key. A "Clear recent searches" button is now rendered below the suggestion panels instead. When the suggestions are open, pressing Tab in the search box moves the focus to that button, Shift+Tab or Escape returns to the search box, and the focus goes back to the search box once the recent queries are cleared.

The `recent-query-title-item`, `recent-query-title-content` and `recent-query-title` parts were removed. The `recent-query-clear` part is now on the new button. New parts are available to style the buttons below the suggestion panels: `suggestions-actions` and `suggestions-action`.

Custom suggestion components can render their own buttons below the suggestion panels by returning them from the new optional `renderActions` method of `SearchBoxSuggestions`.
