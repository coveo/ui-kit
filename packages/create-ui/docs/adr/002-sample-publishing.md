# 002 - Publishing Samples to npm

**Status:** Proposed  
**Date:** 2026-06-25

## Context

Samples live in the `coveo/ui-kit` monorepo and use `workspace:*` / `catalog:` protocols that only resolve inside the workspace. For `@coveo/create-ui` to scaffold install-ready projects, samples must be published somewhere with those protocols already resolved to real versions.

The previous design downloaded the monorepo source tarball from GitHub and resolved protocols at run time on the user's machine. The team reversed this: **publish samples to npm at release time**.

Why:

- **Immutable.** npm versions cannot be re-published. Git tags can be force-moved.
- **No rate limiting.** npm is CDN-backed. GitHub REST API caps at 60 req/hr/IP unauthenticated.
- **Smaller download.** One sample package (~50 KB) vs. the entire monorepo tarball (~4.5 MB).
- **Protocol resolution at publish time.** pnpm already rewrites `workspace:*` and `catalog:` to concrete versions when it publishes. No custom run-time logic needed.
- **Free toolchain.** dist-tags, provenance, deprecation, corporate mirrors, lockfile integrity — all built in.

## Decisions

### 1. One npm package per sample: `@coveo/ui-kit-sample-<template-name>`

Example: `samples/headless/search-react` → `@coveo/ui-kit-sample-headless-search-react`.

1:1 mapping with the `--template` name in the CLI. Each sample versions and deprecates independently.

### 2. pnpm resolves `workspace:*` / `catalog:` at publish time

Samples are published from a release commit — a workspace-consistent snapshot where every referenced package version exists on npm. pnpm's native publish behavior rewrites the protocols. No custom tooling.

### 3. Reuse the existing changesets release pipeline

To make a sample publishable:

- Remove `"private": true`
- Add `"name": "@coveo/ui-kit-sample-<name>"`, `publishConfig.access: "public"`, `files` allowlist

Same "Version Packages" → publish flow as the libraries. No second pipeline.

### 4. Use `pacote` to fetch published samples at scaffold time

[`pacote`](https://www.npmjs.com/package/pacote) is the npm client's own library for resolving and fetching packages from a registry. `@coveo/create-ui` will use it to download and extract the `@coveo/ui-kit-sample-*` tarballs during scaffolding. It handles dist-tags, version ranges, authentication, and corporate registry mirrors out of the box.

## Consequences

- KIT-5842 (run-time protocol resolution) is eliminated — resolved at publish time by pnpm.
- Samples become public API surface; a broken sample fails at publish/install time, not silently at scaffold time.
- Pinning a specific sample version is supported via `--template-version <version>` (a semver or npm dist-tag), which replaces the old `--ref <branch>` and defaults to `latest` (see [ADR 001](./001-sample-consumption.md) decision #3).
