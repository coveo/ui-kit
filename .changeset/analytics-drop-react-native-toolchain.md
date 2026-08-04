---
"coveo.analytics": minor
---

Removed `react-native-get-random-values` from the runtime dependencies. The polyfill is already inlined into `dist/react-native.es.js` at build time, but shipping it as a dependency pulled `react-native`, `metro` and `image-size` into every consumer install, including plain web projects. React Native consumers keep the same behavior with no action required.
