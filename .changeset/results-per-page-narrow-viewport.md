---
'@coveo/atomic': patch
---

Improve how pagination components render on narrow viewports.

- `atomic-pager`, `atomic-commerce-pager` and `atomic-insight-pager` now stay on a single row. When the page buttons don't fit in the available width, the ones farthest from the current page are hidden, so the previous and next buttons stay next to the page numbers instead of wrapping onto another line. All the page buttons set by `number-of-pages` are displayed again as soon as there is enough room.
- `atomic-results-per-page` and `atomic-commerce-products-per-page` now move their choices below the label when they don't fit on one line, instead of breaking the label over several lines and pushing individual choices onto their own row.
