---
title: Product lifecycle
slug: product-lifecycle
---
# Product lifecycle
This high velocity of innovation, combined with ever-changing dependencies (such as Node.js updates), means that certain legacy frameworks, methods, or features must be deprecated.

This article describes the official product lifecycle for each version of the Headless library and its components.
Contractually, Coveo performs needed bug fixes for at least 18 months following the release of a major version.
We end support no earlier than 3 years after the initial release.
For more details, visit Coveo’s [version support lifecycle policy](https://docs.coveo.com/en/1485/).

## Package versions

The latest version of the Headless library can be downloaded from [npm](https://www.npmjs.com/package/@coveo/headless).
Links to older versions are also available, but support is limited as stated in the following table and as provided under the Coveo Support and Service-Level Policies.

| Version number | Release date | Development end date | Bug fix end date | Support end date |
| --- | --- | --- | ---  | --- | 
| v3 | September 2024 | - | - | - |
| v2 | December 2022 | September 2024 | - | - |
| v1 | June 2021 | December 2022 | December 2022 | June 2024 |

## Definitions

### Development end date

There are no more features or improvements for this version after the development end date.
New Headless releases after this date are no longer tested or supported with the listed package version or component.

### Bug fix end date

Major bug fixes are added to the latest official release of the version until the bug fix end date.
This documentation is no longer publicly searchable.

### Support end date

After the support end date, [Coveo Support](https://connect.coveo.com/s/case/Case/Default) will request that you upgrade to a supported version before offering any help.

## 3rd-party support

As of `@coveo/headless` v3.11.0, the following technologies versions are supported:

* TypeScript v4.9+
* Node.js v20 and v22

Support for newer versions of these technologies may be added in either major or minor updates.
Support for older versions may be removed in major updates.
The wrappers may come with limitations compared to the version of Atomic that uses native components.

If the `peerDependencies` restrictions of one of these packages are more restrictive than those listed here, the `peerDependencies` restrictions are to be considered the source of truth.