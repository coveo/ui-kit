---
'@coveo/thermidor': patch
---

Expose `response.a2uiMessages`, the turn's A2-UI message stream downgraded to the v0.9 shape renderers consume, so consumers can pass it straight to a renderer instead of converting v1.0 themselves.

Agent Gateway emits A2-UI v1.0 exclusively while every available renderer (`@copilotkit/a2ui-renderer`, via `@a2ui/web_core/v0_9`) consumes v0.9, and no v1.0-capable renderer exists yet. Thermidor performs that downgrade on the consumer's behalf, as a derived projection of `activities` — the activities themselves stay raw v1.0. This is deliberately interim and will be removed in a breaking change once a v1.0-capable renderer ships; see the ADR-015 addendum for the recorded rationale and retirement condition.
