# @coveo/create-ui

## 0.2.0

### Minor Changes

- [#7905](https://github.com/coveo/ui-kit/pull/7905) [`93855ca`](https://github.com/coveo/ui-kit/commit/93855caab19890c6b08af800389f96b0a8e251cd) - Add Headless SSR commerce templates (Next.js App Router and Express) to the scaffolding CLI.

### Patch Changes

- [#8036](https://github.com/coveo/ui-kit/pull/8036) [`3c643da`](https://github.com/coveo/ui-kit/commit/3c643dac76a89f5d706f6c39a6d1914845a10ddc) - Fix execution through npm-installed binaries.

## 0.1.1

### Patch Changes

- [#8010](https://github.com/coveo/ui-kit/pull/8010) [`870a09e`](https://github.com/coveo/ui-kit/commit/870a09eed5414c4c55fa17490baf69961e5a123a) - Strip the `repository` field when scaffolding a project. Published samples now declare the `coveo/ui-kit` repository (required for npm provenance), and that URL must not carry over into a user's standalone project.

## 0.1.0

### Minor Changes

- [#7952](https://github.com/coveo/ui-kit/pull/7952) [`97ec83f`](https://github.com/coveo/ui-kit/commit/97ec83fc8a24ba5e576cdc5806e41c6a6a89e8e4) - Initial release of `@coveo/create-ui`.

- [#7954](https://github.com/coveo/ui-kit/pull/7954) [`5b3471b`](https://github.com/coveo/ui-kit/commit/5b3471b659aa58cee0b0ebb3b9179ab24e516de0) - Write a `.coveo/create-ui.json` provenance file at scaffold time, recording the template, versions, and tooling used to create the project.
