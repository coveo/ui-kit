---
'@coveo/headless': patch
---

Correct the deprecation notice of `ControllerDefinitionOption`, which types the `listing` and `search` options of seven `@coveo/headless/ssr-commerce` definers such as `definePagination`. It said the interface was no longer used; it now says these options will be removed in the next major version, and to omit them so the controller is built for both search and product listing pages. The documentation of the seven definers now says the same, because editors don't show the interface's notice where these options are passed.
