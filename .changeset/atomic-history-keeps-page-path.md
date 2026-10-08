---
'@coveo/atomic': patch
---

Keep the page path when `atomic-search-interface` and `atomic-commerce-interface` reflect their state in the URL on pages that declare a `<base href>`, such as Angular apps. The URL used to be rewritten to the base path, so reloading or sharing the page opened a different route.
