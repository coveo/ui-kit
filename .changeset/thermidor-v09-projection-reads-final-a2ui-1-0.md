---
'@coveo/thermidor': minor
---

The A2-UI v0.9 renderer projection (`session.a2uiMessages`) now also reads the final A2-UI v1.0 that Agent Gateway is switching to, so a v0.9 renderer keeps working across the switch.

- Messages with the final `version: "1.0"` envelope get the same conversion and surface lifecycle as today's `version: "v1.0"` ones.
- In a `"1.0"` message, final data bindings, `{"@path": x}`, become v0.9 bindings, `{"path": x}`, in component nodes at any depth. A `"v1.0"` message is converted exactly as before. Other `path` keys, such as `updateDataModel.path` or a ChildList template's `path`, are left as they are.
- Component ids are forwarded unchanged, whether snake_case or hyphenated.

The public API is unchanged. Reading both inputs is transitional: the projection goes away once a v1.0 renderer is available.
