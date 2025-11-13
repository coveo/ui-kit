## <small>1.5.10 (2025-10-30)</small>

* ci: fix pnpm pack including node_modules for create-atomic packages (#6333) ([c9debba](https://github.com/coveo/ui-kit/commits/c9debba)), closes [#6333](https://github.com/coveo/ui-kit/issues/6333)
* ci: migrate to pnpm (#6135) ([00e44cd](https://github.com/coveo/ui-kit/commits/00e44cd)), closes [#6135](https://github.com/coveo/ui-kit/issues/6135)
* [Version Bump][skip ci]: ui-kit publish ([b33d02f](https://github.com/coveo/ui-kit/commits/b33d02f))



## <small>1.5.9 (2025-10-29)</small>

* ci: migrate to pnpm (#6135) ([00e44cd](https://github.com/coveo/ui-kit/commits/00e44cd)), closes [#6135](https://github.com/coveo/ui-kit/issues/6135)



## <small>1.5.6 (2025-10-08)</small>

* chore: more cleanup of dependencies in multiples packages (#6119) ([ff6c837](https://github.com/coveo/ui-kit/commits/ff6c837)), closes [#6119](https://github.com/coveo/ui-kit/issues/6119)



## <small>1.5.3 (2025-09-17)</small>

* chore: deduplicate dependencies in create-atomic-* (#6029) ([ba54e8e](https://github.com/coveo/ui-kit/commits/ba54e8e)), closes [#6029](https://github.com/coveo/ui-kit/issues/6029)



## 1.5.0 (2025-08-27)

* feat(cli): port over atomic-result-component from cli  (#5919) ([2899a2c](https://github.com/coveo/ui-kit/commits/2899a2c)), closes [#5919](https://github.com/coveo/ui-kit/issues/5919)
* chore: add missing workspace link (#5897) ([60ff41f](https://github.com/coveo/ui-kit/commits/60ff41f)), closes [#5897](https://github.com/coveo/ui-kit/issues/5897)



## 1.4.0 (2025-08-07)

* feat: Migrate monorepo build system from NX to Turborepo (#5733) ([e7e1237](https://github.com/coveo/ui-kit/commits/e7e1237)), closes [#5733](https://github.com/coveo/ui-kit/issues/5733)
* chore: update dependencies (major) (#5793) ([8cbf5bc](https://github.com/coveo/ui-kit/commits/8cbf5bc)), closes [#5793](https://github.com/coveo/ui-kit/issues/5793)
* fix(deps): update all dependencies j:kit-282 (#5770) ([214bb00](https://github.com/coveo/ui-kit/commits/214bb00)), closes [#5770](https://github.com/coveo/ui-kit/issues/5770)



## 1.3.0 (2025-07-30)

* ci(create-atomic): fix release phase 1 for new create-atomic packages (#5751) ([ca79c40](https://github.com/coveo/ui-kit/commits/ca79c40)), closes [#5751](https://github.com/coveo/ui-kit/issues/5751)
* feat(cli): port over create-atomic-component from cli  (#5656) ([da1e125](https://github.com/coveo/ui-kit/commits/da1e125)), closes [#5656](https://github.com/coveo/ui-kit/issues/5656)



## 1.2.21 (2024-05-13)

## 1.2.18 (2024-02-21)

## 1.2.17 (2024-02-20)

## 1.2.15 (2023-10-27)

### Features

- support imports from `/headless` ([#1326](https://github.com/coveo/cli/issues/1326)) ([d24bec4](https://github.com/coveo/cli/commits/d24bec48e5050ffdbba406fe130a7f7a83ca9b95))

## 1.1.2 (2023-08-24)

### Bug Fixes

- **cli:** remove deploy.example ([#1321](https://github.com/coveo/cli/issues/1321)) ([a79e335](https://github.com/coveo/cli/commits/a79e335a4b476c011945b56f417e13cbd295cf0d))

## 1.1.1 (2023-07-26)

# 1.1.0 (2023-06-13)

### Bug Fixes

- **accd:** updates deps ([#1302](https://github.com/coveo/cli/issues/1302)) ([bebb09d](https://github.com/coveo/cli/commits/bebb09dca354cb33efaceffe844706d191a400c5))
- remove unnecessary `cd` instruction from success message ([#1303](https://github.com/coveo/cli/issues/1303)) ([f23c4eb](https://github.com/coveo/cli/commits/f23c4eb2d2b3fdf0c77e22f078396b76eadd32d1))

### Features

- **accd:** handle errors from initializers in the CLI ([#1316](https://github.com/coveo/cli/issues/1316)) ([aee4429](https://github.com/coveo/cli/commits/aee4429bb83362a426ddb3f1f1f7b81c6b3be367))
- **organizationendpoints:** add support for organization endpoints for UI commands and projects ([#1289](https://github.com/coveo/cli/issues/1289)) ([3b7653d](https://github.com/coveo/cli/commits/3b7653dbf1b59015afb4575bd265ec0a91b2bcef))

## 1.0.1 (2023-04-21)

### Bug Fixes

- **atomic:** don't need peerDeps ([#1294](https://github.com/coveo/cli/issues/1294)) ([8a7e7a9](https://github.com/coveo/cli/commits/8a7e7a9ae60b3837d2e3820d1af824756e4db549))

# 1.0.0 (2023-04-21)

### Bug Fixes

- **atomic:** wait for atomic to load/init on page component ([#1284](https://github.com/coveo/cli/issues/1284)) ([0113bf6](https://github.com/coveo/cli/commits/0113bf6e0b11cd47e6af988afc1434ea9f95cfbc))

### Features

- add confirmation message upon component creation ([#1270](https://github.com/coveo/cli/issues/1270)) ([e7294ce](https://github.com/coveo/cli/commits/e7294ce591b4c5b62ae63c3037b4ceb8c69f2d87))
- **atomic:** release of ACCD ([#1287](https://github.com/coveo/cli/issues/1287)) ([5ce3cda](https://github.com/coveo/cli/commits/5ce3cda28a7a68ec1cef34e49f60b8f1e82da4b0))
- sanitize custom component name on creation ([#1272](https://github.com/coveo/cli/issues/1272)) ([1c434b6](https://github.com/coveo/cli/commits/1c434b6c83fe688f37ff843c90aa01e84a5a1129))

### BREAKING CHANGES

- **atomic:** ACCD is now stable.

## 0.2.4 (2023-04-05)

### Bug Fixes

- move readme one level higher ([#1230](https://github.com/coveo/cli/issues/1230)) ([25e56f5](https://github.com/coveo/cli/commits/25e56f554ba0307c643e30873328b7ab6d88f037))

### Features

- validate component element name ([#1203](https://github.com/coveo/cli/issues/1203)) ([ca54009](https://github.com/coveo/cli/commits/ca54009607fcf44fdb4087be1f8bb72e81230c40)), closes [#1205](https://github.com/coveo/cli/issues/1205) [#1207](https://github.com/coveo/cli/issues/1207)

## 0.2.1 (2023-03-27)

### Bug Fixes

- **deps:** update all dependencies and jest snaps j:cdx-227 ([#1137](https://github.com/coveo/cli/issues/1137)) ([b72dc31](https://github.com/coveo/cli/commits/b72dc314043174ef9afaadb03e066c8830d7acc1)), closes [#1103](https://github.com/coveo/cli/issues/1103)
- **deps:** update all dependencies and jest snaps j:cdx-227 ([#1149](https://github.com/coveo/cli/issues/1149)) ([2f2273c](https://github.com/coveo/cli/commits/2f2273c7d86f2a2a8414ebbdf8cddb800c888e96)), closes [#1144](https://github.com/coveo/cli/issues/1144)

### Features

- add health-check as prepublish script ([#1169](https://github.com/coveo/cli/issues/1169)) ([bfcaf69](https://github.com/coveo/cli/commits/bfcaf69497a42c10a43c2dd0435a82313d04bcbc)), closes [#1190](https://github.com/coveo/cli/issues/1190)
- improve custom component search page ([#1112](https://github.com/coveo/cli/issues/1112)) ([db1d2cb](https://github.com/coveo/cli/commits/db1d2cbf6bad6ecd3413e73d33d6ee400e5b8ade))

## 0.1.1 (2023-03-02)

# 0.1.0 (2023-03-01)

### Features

- **accd:** add custom-component generators ([#1101](https://github.com/coveo/cli/issues/1101)) ([01442cc](https://github.com/coveo/cli/commits/01442ccdb7065c1e9ca5852084f846f2814501d0))
