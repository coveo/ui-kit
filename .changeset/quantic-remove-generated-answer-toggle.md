---
'@coveo/quantic': major
---

`QuanticGeneratedAnswer` no longer has a `withToggle` property, and the toggle that let end users turn the generated answer on or off is removed. The generated answer is now always shown, and the hidden state saved in the session storage is no longer read. Remove `with-toggle` from every `c-quantic-generated-answer` in your components. If you need to save space, set `collapsible` to show a shorter answer that end users can expand.
