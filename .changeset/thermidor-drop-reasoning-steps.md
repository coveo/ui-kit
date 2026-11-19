---
'@coveo/thermidor': minor
---

Drop the model's reasoning text from the session. `TurnAgent.reasoningSteps` becomes `toolCalls`, a `ToolCall[]` with no `type` discriminant, and `ReasoningStep`, `ReasoningMessageStep` and `ToolCallStep` are removed. `REASONING_MESSAGE_*` events are now ignored. The serialized session version moves to 6, so sessions saved by earlier versions are rejected on restore.
