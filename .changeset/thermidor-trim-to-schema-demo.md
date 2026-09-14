---
"@coveo/thermidor": patch
---

Trimmed `@coveo/thermidor` to the minimal surface consumed by the `demo-schema-react` sample (the unified conversational + `@coveo/thermidor-schema` experience).

- Removed the legacy `/converse` generative stack, the standalone search/commerce controllers and `public/actions` helpers, the non-unified interface builders (`buildGenerativeInterface`, `buildSearchInterface`, `buildCommerceInterface`), and the internal API/feature machinery that only supported them.
- Reduced the public API to what the sample uses: `Engine`, `buildGenerativeUnifiedInterface`, `buildUnifiedConverseController`, `buildRemoteController`, `selectRemoteControllerState`, and their supporting types (`GenerativeUnifiedInterface`, `Controller`, `UnifiedConverseControllerState`, `RemoteController`, `RemoteControllerSource`, `ComponentType`, `Activity`, `AgentMessage`, `AgentResponse`, `ReasoningStep`, `ToolCallStep`, `Turn`).
- Pruned all now-unused exports and dead files across the remaining internal modules, and enabled Knip enforcement for the package to keep it from regrowing.
