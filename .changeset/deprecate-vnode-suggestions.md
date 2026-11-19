---
'@coveo/atomic': minor
---

Passing a Stencil `VNode` as the `content` of a search box suggestion is deprecated: use an `Element` instead, as the built-in suggestions do. A search box now logs a warning through the engine logger, once per engine, when one of its suggestions has `VNode` content. Version 4 accepts only an `Element`.
