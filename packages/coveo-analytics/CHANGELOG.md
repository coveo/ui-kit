# coveo.analytics

## 2.32.0

### Minor Changes

- [#8121](https://github.com/coveo/ui-kit/pull/8121) [`a1b2af5`](https://github.com/coveo/ui-kit/commit/a1b2af5c56bacd9a3756f55322295da8c13a5217) - Removed `react-native-get-random-values` from the runtime dependencies. The polyfill is already inlined into `dist/react-native.es.js` at build time, but shipping it as a dependency pulled `react-native`, `metro` and `image-size` into every consumer install, including plain web projects. React Native consumers keep the same behavior with no action required.

## 2.31.0

### Minor Changes

- [#8118](https://github.com/coveo/ui-kit/pull/8118) [`0047895`](https://github.com/coveo/ui-kit/commit/00478950dddf7005a1f8079c99f7a0edee9b5278) - Update `uuid` from 9 to 14, and stop declaring `@types/uuid`, which is redundant now that `uuid` ships its own type declarations.

  `uuid` is bundled into the distributed files, so no emitted JavaScript imports it at runtime and behavior is unchanged. The published type declarations are also unchanged. What changes is the installed dependency set: `@types/uuid` is no longer pulled in, and `uuid` resolves to 14.

- [#8076](https://github.com/coveo/ui-kit/pull/8076) [`1dcb32f`](https://github.com/coveo/ui-kit/commit/1dcb32f02bc848b115a6016a083242cce9200cb2) - Add the `disableBrowserPrivacySignals` client option. When set to `true`, the analytics clients (search page, insight, case assist) and the underlying analytics client stop honoring browser privacy signals (Do Not Track and Global Privacy Control), so analytics is sent regardless of those signals. It defaults to `false` (signals are honored) and does not override an explicit `enableAnalytics: false`. The integrator that enables it is responsible for complying with the applicable privacy obligations.

### Patch Changes

- [#8112](https://github.com/coveo/ui-kit/pull/8112) [`b69393a`](https://github.com/coveo/ui-kit/commit/b69393a3663b8b295964fbf6f75c8c3c5acd9bc5) - Build the package with `@rollup/plugin-commonjs` 29. The CommonJS, ESM, and React Native bundles are regenerated with the newer plugin's interop output; the browser bundles and declarations are unaffected.

- [#8117](https://github.com/coveo/ui-kit/pull/8117) [`f1ee3a9`](https://github.com/coveo/ui-kit/commit/f1ee3a9e6c1d281e437733fda9cc0d8b02beba2c) - Bundle with Rollup 4. Emitted JavaScript changes because the newer bundler generates slightly different output; the published type declarations are unchanged.

- [#8111](https://github.com/coveo/ui-kit/pull/8111) [`333a834`](https://github.com/coveo/ui-kit/commit/333a83499f3accd3ecaed83f2634dcd4bdd6b595) - Build the package with `@rollup/plugin-typescript` instead of the unmaintained `rollup-plugin-typescript2`. Emitted bundles are equivalent but not byte-identical, and eight redundant duplicate declaration files under `dist/definitions/src` and `dist/definitions/bundle` are no longer emitted. The `types` entry and every declaration reachable from it are unchanged.

- [#8156](https://github.com/coveo/ui-kit/pull/8156) [`c2ebb1b`](https://github.com/coveo/ui-kit/commit/c2ebb1b490e2dd0ac8710c017825376c2ee94fe0) - Add `Secure` attribute on cookie when using HTTPS session

- [#8116](https://github.com/coveo/ui-kit/pull/8116) [`30abbfb`](https://github.com/coveo/ui-kit/commit/30abbfb43f4e0c303bcba6619768c93dec4a0e71) - Update to TypeScript 6. The newer compiler emits slightly different JavaScript; the published type declarations are unchanged.
