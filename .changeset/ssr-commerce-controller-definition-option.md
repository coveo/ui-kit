---
'@coveo/headless': patch
---

Correct the deprecation notice of `ControllerDefinitionOption`, which types the `listing` and `search` options of seven `@coveo/headless/ssr-commerce` definers such as `definePagination`. It said the interface was no longer used; it now says to omit these options, so the controller is built for both search and product listing pages, as on `@coveo/headless/ssr-commerce-next`.
