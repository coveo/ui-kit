---
'@coveo/thermidor': minor
---

Each `AgentMessage` keeps the id of its `TEXT_MESSAGE_START` event as `id`, so a client can tie activities that refer to a message, such as an answer's citations, to that message.

Breaking: `id` is required on `AgentMessage`, and `SERIALIZED_SESSION_VERSION` is now `2`. Restoring a version `1` session, whose messages have no id, throws `UnsupportedSerializedSessionVersionError`.
