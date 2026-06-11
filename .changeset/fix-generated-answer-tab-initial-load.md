---
"@coveo/headless": patch
"@coveo/atomic": patch
---

fix(atomic): prevent agentic stream request on initial load when tab is excluded via `tabs-included`/`tabs-excluded`

The `buildCoreGeneratedAnswer` controller now honors `initialState.isEnabled`, and `atomic-generated-answer` passes `isEnabled: false` when the initial active tab is excluded.
