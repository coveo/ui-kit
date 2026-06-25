---
"@coveo/atomic": patch
---

Fixed focus escaping modal dialogs by ensuring `atomic-focus-trap` always receives a valid `scope` element. When no explicit scope is provided to `atomic-modal`, it now defaults to the interface element or `document.body` instead of `undefined`.
