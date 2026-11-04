---
'@coveo/thermidor': minor
---

Let shoppers act while the agent answers, when the endpoint supports it. With `actionsDuringAnswer` in `SessionConfig`:

- An action on the newest results is sent beside the answer in progress, in the order the shopper made them, and is recorded with the turn that owns its surface.
- A prompt sent while an answer streams, or a follow-up clicked then, is added to that answer instead of opening a turn. `Turn.addedMessages` lists each one with its status: `sending`, `waiting`, `applied`, `askedNext` (the answer ended without taking it, so it was asked next) or `notAdded` (the shopper stopped the answer first).

`Turn.foundProducts` lists the products the agent found while answering (its `products_found` events), each once, before the answer shows its own, so the shopper can react to them early.

`Session.stop()` stops the answer in progress through the converse request (`stop: true`). The answer keeps what it streamed, and `Turn.stopped` is set once it really stopped.
