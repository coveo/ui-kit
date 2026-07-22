---
'coveo.analytics': patch
---

Bump the resolved production dependencies to `cross-fetch@3.2.0`, `react-native-get-random-values@1.11.0`, and `uuid@9.0.1`. Preserve embedded CDN source maps and keep the Node `encoding` dependency external. Migrate the coveo.analytics unit and functional test suite from Jest to Vitest with jsdom and V8 coverage.
