---
"@coveo/atomic": patch
---

Fixed keyboard focus being lost after clicking "Load more" in both `atomic-load-more-results` and `atomic-commerce-load-more-products`. Focus now correctly moves to the first newly-loaded item. The underlying issue was a timing problem in the shared `item-list-common` infrastructure where the focus target was evaluated before the new result element finished rendering its shadow DOM.
