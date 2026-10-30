---
'@coveo/thermidor': minor
---

Send the actions a producer announces as concurrent beside the session's single request, and reuse the answers of those it announces as cached.

- A producer announces them with a surface, in the AG-UI `metadata` of its snapshot, by surface id: `concurrentActions` (`{"<surfaceId>": ["fetchInstantProducts"]}`) and `cachedActions` (`{"<surfaceId>": {"fetchInstantProducts": {"ttlMs": 60000}}}`). The latest announcement for a surface wins, an empty entry revokes it, and a cached action must also be concurrent.
- A concurrent action is sent at once, whatever request is in flight, and never sets `session.request`; a prompt or `cancel()` does not stop it. Only the latest dispatch from a node is applied: an older uncached request is aborted, while a cached one runs to the end so its answer is cached, and a dispatch with the same payload joins it.
- A cached action dispatched again with the same payload within its lifetime sends nothing. The session keeps the last 100 answers in memory and never serializes them.
- Its answer may only update the data model of nodes the session holds, and is not recorded in a run: `session.state` shows it on top of the recorded state until a recorded write to the same path replaces it, and `session.serialize()` leaves it out. Its failure is a dev-only warning and sets no `session.actionError`.

A producer that announces nothing gets today's behavior.
