---
name: commit-changes
description: Guides composing commits and PR descriptions following Conventional Commits 1.0.0. Use when committing changes, writing PR titles, or composing PR descriptions.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

## Commit message

### Commit subject (title)

This repository follows Conventional Commits 1.0.0.

Use the package directory name under `packages/` as the scope.
For infrastructure changes use `ci`, `deps`, `agents`, or `changesets`.
Comma-separate when multiple scopes apply.

### Commit body (description)

1. Select the template that matches your change type:

    | Type                                                         | Jira work item | Use when                                           |
    | ------------------------------------------------------------ | -------------- | -------------------------------------------------- |
    | [`feat`](../../../.github/PULL_REQUEST_TEMPLATE/feature.md)  | Story / Task   | Adding new functionality or enhancements           |
    | [`fix`](../../../.github/PULL_REQUEST_TEMPLATE/bugfix.md)    | Bug            | Fixing a defect                                    |
    | [`chore`](../../../.github/PULL_REQUEST_TEMPLATE/chore.md)   | Task           | Maintenance, dependency updates, tooling, refactor |
    | [`style`](../../../.github/PULL_REQUEST_TEMPLATE/style.md)   | Task           | Formatting/whitespace with no logic change         |
    | [`docs`](../../../.github/PULL_REQUEST_TEMPLATE/docs.md)     | Task           | Documentation-only changes                         |
    | [`test`](../../../.github/PULL_REQUEST_TEMPLATE/test.md)     | Task           | Adding or updating tests only                      |
    | [`revert`](../../../.github/PULL_REQUEST_TEMPLATE/revert.md) | —              | Reverting a previous commit                        |

2. Read the selected template file.
3. Fill in its sections using GitHub Markdown.
4. Remove sections that are empty or do not apply.

## Jira work item

Ask the user to either:
1. Provide a Jira to replace the placeholder link (`https://coveord.atlassian.net/browse/TICKET-ID`) in the description template.
2. Automatically create a Jira in a bucket using the [`jira-create-issue-in-bucket`](../jira-create-issue-in-bucket/SKILL.md) skill.
3. Skip adding a Jira and remove the Jira section from the description.

## Changeset

This repository uses [changeset](https://changesets.dev/guide/getting-started).

Required whenever you modify source code of a public package.

However, do not create changesets for trivial or internal changes. See the PR templates for each corresponding change type for guidance.

If you determine that a changeset is required, run `pnpm changeset` and follow the instructions as prompted.

## Commit changes

If the user is only asking for a commit message or PR description, output that in GitHub Markdown format and STOP.

If the user is asking to commit changes or open a PR:

1. Make sure you are on a branch other than `main` that is relevant to the current changes.
    1. If not on a branch, offer to create it for the user.
    2. If unclear or uncertain, pause and ask for clarification.
2. Identify which changes should be part of this commit. If unclear or uncertain, pause and ask for clarification. 
3. `.kiro/specs` files do not always go in commits. If present, ask the user if they want to include them in the commit.
4. Stage the relevant parts using `git add`.
5. Commit using `git commit -m "<type>(<scope>): <summary>" -m "<Description>"`

## Open a draft Pull Request

If changes were successfully committed, offer to the user to open a PR.

If they agree:

1. Push the branch to GitHub
2. Open a draft pull request, using the title and description from before
3. Print the link to the PR.
   