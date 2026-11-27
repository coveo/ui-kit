---
'@coveo/thermidor': minor
---

Carry the A2-UI v1.0 messages of Agent Gateway to the renderer unchanged, for renderers built on the `@a2ui/web_core` v1.0 message processor, such as `@a2ui/react`.

- `session.a2uiMessages` holds the messages as Agent Gateway sent them: a `createSurface` keeps its inline `components` and `dataModel`, and an `updateDataModel` with `value: null` deletes its key. Only messages whose envelope `version` is `"1.0"` enter the stream.
- The stream still follows the surface lifecycle across runs, so one renderer can process it: a `deleteSurface` precedes a `createSurface` that replaces a live surface, and an `updateComponents` or `updateDataModel` for a surface that is not live is left out.
- `session.dispatchAction` takes the action a v1.0 renderer reports, `{name, surfaceId, sourceComponentId, context, timestamp}`, so it can be the renderer's action handler: `new MessageProcessor(catalogs, session.dispatchAction)`.
- A `createSurface` without a `catalogId` now creates a surface in `session.surfaces`, since A2-UI v1.0 makes the default catalog optional.

**Breaking:** `session.a2uiMessages` and `SessionSnapshot.a2uiMessages` are A2-UI v1.0 messages (`A2uiMessage`) instead of v0.9 ones (`A2uiV09Message`, removed). `session.dispatchAction` takes an `A2uiRendererAction` instead of an `A2uiClientMessage` (removed), whose `userAction` it no longer unwraps. Sessions serialized by earlier versions can no longer be restored: `createSession` throws an error named `UnsupportedSerializedSessionVersionError` for them, so catch it and start a new session.
