---
'@coveo/thermidor': minor
---

Add `session.getSnapshot()`, which returns the session's `turns`, `surfaces`, `a2uiMessages`, `state`, `request` and `actionError` as one frozen `SessionSnapshot`. It returns the same object until one of those changes, and neither it nor `subscribe` relies on `this`, so the pair backs any framework store that compares snapshots by reference:

```tsx
const {turns, a2uiMessages, request} = useSyncExternalStore(
  session.subscribe,
  session.getSnapshot
);
```
