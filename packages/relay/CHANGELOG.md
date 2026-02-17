## 2.0.2 (2026-02-17)

## 2.0.1 (2026-02-12)

# 2.0.0 (2026-02-04)

### Features

- **relay:** emit events using fetch API, simplify Environment interface ([#228](https://github.com/coveo/relay/issues/228)) ([f171e25](https://github.com/coveo/relay/commits/))

### BREAKING CHANGES

- **relay:** Relay now uses fetch with keepalive instead of navigator.sendBeacon to transmit analytics events, since keepalive is now supported by all major browsers (including Firefox 133+).

The change ensures event payloads are visible in browser developer tools, and enhances security by making it possible to pass authentication tokens via request headers instead of the request URL. The keepalive option preserves the same delivery guarantees as sendBeacon, ensuring events are sent even when the page is being unloaded.

As part of the change, the emit method is now asynchronous and returns a Promise. Relay will also throw an error if an event does not conform to the base Event Protocol payload structure.

- **relay:** Relay previously required custom environment implementations to define low-level properties such as generateUUID and storage, even though Relay ultimately only needs a clientId.

The Environment interface has been simplified, replacing generateUUID and storage with a single getClientId method. With storage fully encapsulated, the Storage interface is no longer exported.

This breaking change only affects consumers configuring Relay with a custom environment, which is expected to be a small subset of implementations.

## 1.2.15 (2025-12-04)

### Bug Fixes

- **deps:** update dependency next to v16 ([#215](https://github.com/coveo/relay/issues/215)) ([dcb40f0](https://github.com/coveo/relay/commits/))

## 1.2.14 (2025-10-28)

### Bug Fixes

- Update to NodeJS 24 for npm version [UA-10577] ([#211](https://github.com/coveo/relay/issues/211)) ([f85f525](https://github.com/coveo/relay/commits/))

## 1.2.13 (2025-10-22)

## 1.2.12 (2025-10-21)

## 1.2.11 (2025-10-02)

### Bug Fixes

- **deps:** update all non-major dependencies ([#206](https://github.com/coveo/relay/issues/206)) ([c28b789](https://github.com/coveo/relay/commits/))

## 1.2.10 (2025-09-23)

### Bug Fixes

- **deps:** update all non-major dependencies ([#203](https://github.com/coveo/relay/issues/203)) ([c340ef2](https://github.com/coveo/relay/commits/))
- **deps:** update dependency uuid to v13 ([#205](https://github.com/coveo/relay/issues/205)) ([ac3373e](https://github.com/coveo/relay/commits/))

## 1.2.9 (2025-09-15)

### Bug Fixes

- **deps:** update all non-major dependencies ([#197](https://github.com/coveo/relay/issues/197)) ([8aa36e0](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#202](https://github.com/coveo/relay/issues/202)) ([9959592](https://github.com/coveo/relay/commits/))

## 1.2.8 (2025-08-27)

### Bug Fixes

- **deps:** update all non-major dependencies ([#196](https://github.com/coveo/relay/issues/196)) ([4fde800](https://github.com/coveo/relay/commits/))

## 1.2.7 (2025-07-29)

### Bug Fixes

- **deps:** update all non-major dependencies ([#190](https://github.com/coveo/relay/issues/190)) ([7c50b51](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#193](https://github.com/coveo/relay/issues/193)) ([5625014](https://github.com/coveo/relay/commits/))
- **relay:** use node16 moduleResolution ([#192](https://github.com/coveo/relay/issues/192)) ([c4b900d](https://github.com/coveo/relay/commits/))

## 1.2.6 (2025-07-16)

### Bug Fixes

- **deps:** update all non-major dependencies ([#181](https://github.com/coveo/relay/issues/181)) ([b1fb064](https://github.com/coveo/relay/commits/))
- **deps:** update mantine monorepo to v8 (major) ([#173](https://github.com/coveo/relay/issues/173)) ([0028256](https://github.com/coveo/relay/commits/))
- improve URL truncation to account for encoded characters ([#189](https://github.com/coveo/relay/issues/189)) ([444fd20](https://github.com/coveo/relay/commits/))

## 1.2.5 (2025-06-30)

### Bug Fixes

- trim location and referrer beyond 1024 characters ([#186](https://github.com/coveo/relay/issues/186)) ([c93c241](https://github.com/coveo/relay/commits/))

## 1.2.4 (2025-06-30)

## 1.2.3 (2025-06-10)

## 1.2.2 (2025-05-22)

## 1.2.1 (2025-05-19)

# 1.2.0 (2025-05-07)

### Features

- **relay:** make storage optional ([#172](https://github.com/coveo/relay/issues/172)) ([1f6a48c](https://github.com/coveo/relay/commits/))

## 1.1.3 (2025-05-01)

## 1.1.2 (2025-04-29)

### Bug Fixes

- **deps:** update all non-major dependencies ([#157](https://github.com/coveo/relay/issues/157)) ([f3e3fa1](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#161](https://github.com/coveo/relay/issues/161)) ([93a8170](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#162](https://github.com/coveo/relay/issues/162)) ([7fe99d1](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#163](https://github.com/coveo/relay/issues/163)) ([dc3cc69](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#164](https://github.com/coveo/relay/issues/164)) ([67492e0](https://github.com/coveo/relay/commits/))
- **deps:** update dependency next to v15.2.4 [security] ([#169](https://github.com/coveo/relay/issues/169)) ([0e2f02f](https://github.com/coveo/relay/commits/))

## 1.1.1 (2025-02-21)

# 1.1.0 (2025-02-12)

### Bug Fixes

- **deps:** update all non-major dependencies ([#149](https://github.com/coveo/relay/issues/149)) ([a2dd519](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#153](https://github.com/coveo/relay/issues/153)) ([b4ef5e3](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#154](https://github.com/coveo/relay/issues/154)) ([842cda7](https://github.com/coveo/relay/commits/))

### Features

- **relay:** add new config option to provide an environment ([#158](https://github.com/coveo/relay/issues/158)) ([32208b5](https://github.com/coveo/relay/commits/))

# 1.0.0 (2025-01-22)

- ([f652f24](https://github.com/coveo/relay/commits/)), closes [#150](https://github.com/coveo/relay/issues/150)

### BREAKING CHANGES

- major release for the Relay library (v1.0.0)

## 0.8.16 (2025-01-21)

### Bug Fixes

- **deps:** update all non-major dependencies ([#147](https://github.com/coveo/relay/issues/147)) ([399ca57](https://github.com/coveo/relay/commits/))

## 0.8.15 (2025-01-09)

### Bug Fixes

- **deps:** update all non-major dependencies ([#144](https://github.com/coveo/relay/issues/144)) ([05121fd](https://github.com/coveo/relay/commits/))

## 0.8.14 (2025-01-06)

### Bug Fixes

- **deps:** update all non-major dependencies ([#137](https://github.com/coveo/relay/issues/137)) ([3b8a29c](https://github.com/coveo/relay/commits/))
- **deps:** update all non-major dependencies ([#141](https://github.com/coveo/relay/issues/141)) ([c6b1a77](https://github.com/coveo/relay/commits/))
- **deps:** update react monorepo to v19 (major) ([#140](https://github.com/coveo/relay/issues/140)) ([8109bbc](https://github.com/coveo/relay/commits/))

## 0.8.13 (2024-12-12)

## 0.8.12 (2024-11-05)

### Bug Fixes

- **deps:** update dependency next to v15 (#128) ([f5161c6](/commits/f5161c6e001f43a59a15a43865eff996f23179eb)), closes [#128](/issues/128)

## 0.8.11 (2024-11-04)

## 0.8.10 (2024-11-04)

### Bug Fixes

- **deps:** update dependency uuid to v11 (#129) ([0a6884d](/commits/0a6884d5823f96356a1f67bc16766c1148084b21)), closes [#129](/issues/129)

## 0.8.9 (2024-11-04)

## 0.8.8 (2024-10-22)

## 0.8.7 (2024-10-21)

## 0.8.6 (2024-10-17)

## 0.8.5 (2024-10-17)

## 0.8.4 (2024-10-15)

## 0.8.3 (2024-10-03)

### Bug Fixes

- **deps:** update dependency next to v14.2.10 [security] (#106) ([7f0ca74](/commits/7f0ca744304df06bc6b7c43fe6ba2ae028a7ffe2)), closes [#106](/issues/106)
- update notifications to publish to channel on failure [UA-9176] (#109) ([0b2c37f](/commits/0b2c37f29092fd7e2f4fc7349b7c23607cf98b73)), closes [#109](/issues/109)

## 0.8.2 (2024-09-27)

## 0.8.1 (2024-09-11)

# 0.8.0 (2024-09-03)

### Features

- Changed deployments notification Slack channel [UA-9208] (#98) ([0f362bd](/commits/0f362bd254e0982631038130248255fa1be6f5cf)), closes [#98](/issues/98)
- Removed Jenkins [UA-9213] (#97) ([0367b23](/commits/0367b2349255c26c980b458708f2e8ca918ce085)), closes [#97](/issues/97)

## 0.7.10 (2024-07-09)

### Bug Fixes

- add defensive code around storage access (#96) ([0b8a616](/commits/0b8a616bef12899d159983a3889829f4851f1fb8)), closes [#96](/issues/96)

## 0.7.9 (2024-07-04)

### Bug Fixes

- bump @coveo/explorer-messenger; move license file so it gets included in the relay package (#94) ([62e6115](/commits/62e611517851e988a4d3c3d5394dd77e3a33527c)), closes [#94](/issues/94)

## 0.7.8 (2024-06-12)

### Bug Fixes

- remove clearStorage method (#92) ([0599c31](/commits/0599c316134e5f7855ed07dde5ca738c24d1a0b4)), closes [#92](/issues/92)

## 0.7.7 (2024-03-27)

### Bug Fixes

- **ci:** update credential to pull coveo-platform repo (#89) ([16a83d5](/commits/16a83d519ab67a5675bf72ae49255478695fda5e)), closes [#89](/issues/89)

## 0.7.6 (2024-03-13)

### Bug Fixes

- **playground:** updates the alt text for the image (#87) ([128d6ae](/commits/128d6ae7dafb540fc0b470df812e0aaff6b20853)), closes [#87](/issues/87)

## 0.7.5 (2024-02-23)

### Bug Fixes

- adjust playground event names (#80) ([1b452a2](/commits/1b452a2daacdabd1952818691f76856564c97163)), closes [#80](/issues/80)
- **playground:** update href based on env (#70) ([f0af35f](/commits/f0af35fccf5ab4812b3de827804e8924730ad7ab)), closes [#70](/issues/70)

## 0.7.4 (2024-01-11)

## 0.7.3 (2024-01-09)

## 0.7.2 (2024-01-08)

### Bug Fixes

- **relay:** move user key under meta.config (#77) ([f20e36b](/commits/f20e36b9238e61707b5be1386dfabf6fd54cbbb8)), closes [#77](/issues/77)

## 0.7.1 (2024-01-05)

# 0.7.0 (2024-01-04)

### Features

- **playground:** mantinize the playground; add CDN example (#66) ([fa3fe5a](/commits/fa3fe5a0dbaa78acf3132a1f72b867d768e20181)), closes [#66](/issues/66)

## 0.6.12 (2023-12-18)

### Bug Fixes

- **ci:** resolve errors blocking pipeline in staging (#64) ([60df7f4](/commits/60df7f4b2c0dfcb7ce89ac9f7c386172011d952d)), closes [#64](/issues/64)

## 0.6.11 (2023-12-14)

### Bug Fixes

- **relay:** use null environment when running relay on node (#63) ([9522cfb](/commits/9522cfbb6a73af9f4fcf3d824169c3cfeb4f7c6e)), closes [#63](/issues/63)

## 0.6.10 (2023-12-11)

## 0.6.9 (2023-12-08)

## 0.6.8 (2023-11-29)

### Bug Fixes

- **relay:** update clientIdManager when environment is changed (#59) ([9cba29d](/commits/9cba29d38d58a0358284b4de4578bfa1b981473b)), closes [#59](/issues/59)

## 0.6.7 (2023-11-28)

### Bug Fixes

- loosen RelayPayload value type from unknown to any (#56) ([c3cc15b](/commits/c3cc15bf758c1a247de9de616bb73522a5028a2e)), closes [#56](/issues/56)

## 0.6.6 (2023-11-23)

## 0.6.5 (2023-11-13)

## 0.6.4 (2023-10-31)

## 0.6.3 (2023-10-30)

## 0.6.2 (2023-10-19)

## 0.6.1 (2023-10-16)

### Bug Fixes

- **relay:** only call listeners if relay is active (#50) ([bbbd3fb](/commits/bbbd3fb8f6945d46901f966fce78d5168d2ffdd3)), closes [#50](/issues/50)

# 0.6.0 (2023-10-12)

### Features

- use native uuid gen (#47) ([583d9ea](/commits/583d9ea4229943b235d869a621e7441104a20829)), closes [#47](/issues/47)

# 0.5.0 (2023-10-11)

### Features

- add disabled mode ([808baee](/commits/808baee3f59aac4ff1937e8e33c7eff1262c0409))

## 0.4.4 (2023-10-11)

## 0.4.3 (2023-10-02)

## 0.4.2 (2023-09-29)

## 0.4.1 (2023-09-28)

### Bug Fixes

- combine host and organizationId into url option (#44) ([ad82fad](/commits/ad82fad6486ed1359a3d9f5ef200390c359b0dd2)), closes [#44](/issues/44)

# 0.4.0 (2023-09-28)

### Bug Fixes

- remove sku from playground events (#41) ([204ea8b](/commits/204ea8be29ab049666d504e0548113b9dd37d8c3)), closes [#41](/issues/41)

### Features

- read and persist client ID for browser environment the same way it is done for coveo.analytics.js ([3ea29b6](/commits/3ea29b69b2d2c52d430c773c3fb3b533c31f1013))

## 0.3.3 (2023-09-27)

## 0.3.2 (2023-09-27)

## 0.3.1 (2023-09-26)

# 0.3.0 (2023-09-25)

### Features

- add mode option, by default it is emit (#34) ([d15c495](/commits/d15c495ecb261028556d195fde6e9631174263aa)), closes [#34](/issues/34)

# 0.2.0 (2023-09-21)

### Features

- **relay:** add getMeta function (#36) ([cb6c7d4](/commits/cb6c7d40527cf980b81dfc87c11de42fde2b3dee)), closes [#36](/issues/36)

## 0.1.2 (2023-09-14)

### Bug Fixes

- **playground:** resolve assets using relative links (#27) ([2a5592f](/commits/2a5592fece12ca2181d8435506bf1f894771dbad)), closes [#27](/issues/27)

## 0.1.1 (2023-09-12)

# 0.1.0 (2023-09-11)

### Features

- **page:** update payload when select new type (#19) ([3a7f0d5](/commits/3a7f0d5fc04593e6b09d27f96abd07ed130a669a)), closes [#19](/issues/19)
- **playground:** add commerce sample events (#22) ([52009c9](/commits/52009c9545ec64571c77db6b94ae74d8ac61729e)), closes [#22](/issues/22)

## 0.0.6 (2023-08-29)

### Bug Fixes

- **deploy:** fix bad substitution (#11) ([2b02c54](/commits/2b02c54d41918439ca129dc22b879480eb7fd8a5)), closes [#11](/issues/11)
- **version-bump:** set remote to push to (#13) ([ae7c08d](/commits/ae7c08d839d0b461be3840086780c890b35aed7e)), closes [#13](/issues/13)
