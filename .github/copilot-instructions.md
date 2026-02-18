# GitHub Copilot PR Review Instructions

This file contains instructions to help GitHub Copilot review PRs specifically in this repository.

Outside of what is specified in this file, GitHub Copilot should review PRs as it normally does, without any special instructions.

## Headless documentation tips

When reviewing code changes in `packages/headless` and `packages/headless-react`, have a look at the handwritten documentation articles under `packages/headless/source_docs`, in case they are impacted.

## Samples

When reviewing code changes, have a look at the `samples` directory, in case it contains samples that need to be updated.

## Commenting on files not included in the PR

If you spot changes that need to be made in files not included in the PR (e.g., if code changes in `packages/headless` affect documentation articles in `packages/headless/source_docs`, but the latter aren't touched in the PR), write a top-level comment to that effect in the PR (don't try to comment on the affected articles, because unless such files are included in the PR, the comment won't appear).