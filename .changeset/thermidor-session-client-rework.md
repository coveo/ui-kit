---
'@coveo/thermidor': minor
---

Rework `@coveo/thermidor` into a lean session client for the unified converse endpoint.

The engine/interface/Redux/facade stack is removed and replaced by a single `createSession(config)` factory returning a `Session` that exposes an observable list of `Turn`s folded from the SSE stream, plus a generic, schema-validated remote controller vended from the session. The contracts schema, endpoint URL, and context are consumer-injected, and `zod` is now a peer dependency. This is a breaking change to the entire public surface.
