---
'@coveo/headless': patch
---

Stop warning consumers about peer dependencies they do not need.

`pino-pretty` is now marked optional. It is only needed by consumers who opt into pretty-printed logs; nothing in Headless configures a `pino-pretty` transport.

`encoding` is removed from `peerDependencies`. It was the optional charset peer of `node-fetch`, which is now a development-only dependency used in tests. Consumers of Headless never need it.

Neither change affects what Headless does at runtime.
