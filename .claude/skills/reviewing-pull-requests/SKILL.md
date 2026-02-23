---
name: reviewing-pull-requests
description: Reviews pull requests by cross-checking code changes against handwritten documentation and sample projects. Use when reviewing PRs, performing code reviews, or when users mention PR review, pull request review, or documentation impact.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Reviewing Pull Requests

Outside of what is specified in this skill, review PRs as you normally would, without any special instructions.

## Cross-Check Headless Documentation

When reviewing code changes in `packages/headless` or `packages/headless-react`, check the handwritten documentation articles under `packages/headless/source_docs/` to determine whether any articles are impacted by the changes and need updating.

## Cross-Check Samples

When reviewing code changes, check the `samples/` directory to determine whether any sample projects are impacted by the changes and need updating.

## Commenting on Files Not in the PR Diff

If changes need to be made in files that are **not included in the PR** (e.g., code changes in `packages/headless` affect documentation articles in `packages/headless/source_docs/`, but those articles are not part of the PR), write a **top-level comment** on the PR calling this out.

Do not attempt to leave inline comments on files that are not part of the PR diff — such comments will not appear.
