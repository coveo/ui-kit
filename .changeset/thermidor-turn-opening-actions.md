---
'@coveo/thermidor': minor
---

Open a new turn for a component action the producer announces as opening one, such as a follow-up chip or a search option, as a prompt does.

A producer announces, by surface id, the actions whose answer it gives as a new turn of the conversation, in the AG-UI `metadata` of the surface's snapshot:

```json
{"metadata": {"turnOpeningActions": {"<surfaceId>": ["selectAction", "selectSearchOption"]}}}
```

The session opens the turn as soon as the action is dispatched, so a consumer shows the shopper's choice right away and declares nothing. The new turn is `streaming` while its answer streams, records the action in `input.action` (`TurnAction`: component, action name, surface id, source node and payload), and becomes the active turn. The surfaces of the turn the action was sent from keep accepting actions. A failed or cancelled turn-opening action fails only its own turn, and `retry(turnId)` re-sends the action from the surface it was dispatched from. Any other action still streams into the active turn. An activity now keeps the AG-UI `metadata` of its event, and a replacing snapshot merges its `metadata` onto the earlier one by entry.

**Breaking:** `SERIALIZED_SESSION_VERSION` is now 3, since a persisted turn may carry `input.action`; an earlier session is refused on restore.
