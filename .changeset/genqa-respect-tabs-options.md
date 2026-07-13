---
"@coveo/headless": patch
"@coveo/atomic": patch
---

Fix `atomic-generated-answer` not respecting `tabs-included`/`tabs-excluded` when generating answers. The component no longer sends answer-generation queries when it is hidden on the current tab, including on the initial load. The Answer API and Agent API generation paths now honor the generated answer `isEnabled` state, and `buildGeneratedAnswer`'s `initialState.isEnabled` is now applied.
