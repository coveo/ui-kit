---
'@coveo/thermidor': patch
---

Submit prompts through `session.dispatchAction({name: 'submitPrompt', payload: {prompt}})`, the same entry point as every other interaction. The action opens a new streaming turn exactly as `session.submit({prompt})` does: it needs no rendered component or active turn, it is ignored while a turn is streaming, and `retry(turnId)` re-drives the turn it opened. The request sent to the converse endpoint is unchanged. The new `SubmitPromptAction` type is exported.
