# Contributing to ui-kit

Thank you for contributing to coveo/ui-kit. This guide describes the conventions we use in this monorepo. The goal is a clean, consistent commit history — you're welcome to achieve that however works for you, as long as the end result meets the quality bar described below.

## Where does my PR go?

`v3` was cut from `main` on November 25, 2026. Until the v4 GA, `v3` releases every package except Thermidor: the 3.x versions of Headless, Atomic, Quantic and the packages built on them, and Auth, Bueno, coveo.analytics, create-ui and Relay. `main` takes the v4 breaking changes and publishes only Thermidor.

| Your change                                                                              | Base branch | What happens next                                                                                                                            |
| ---------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A fix, a feature, a deprecation or a warning in a published package other than Thermidor | `v3`        | Ships in the next release from `v3` and reaches `main` with the next merge of `v3` into `main`.                                              |
| A fix that v3 customers need, found while working on `main`                              | `v3`        | The same: make it on `v3`, and the next merge brings it to `main`.                                                                           |
| A breaking change: a removal, a rename, a new default, a raised Node.js or peer floor    | `main`      | Needs a `major` changeset, the upgrade guide entry and `!` in the title. The v3 deprecation it relies on must already be released from `v3`. |
| Thermidor                                                                                | `main`      | Nothing changes.                                                                                                                             |
| The experimental SSR entry points                                                        | `main`      | Ships with v4. Their v3 version stays as released; a fix goes to `v3` only when a customer is blocked.                                       |
| Docs, tooling or CI that ships nothing                                                   | `main`      | When `v3` needs it too, open a second PR there with the same change.                                                                         |

`v3` is merged into `main` before the first v4 prerelease and again just before GA. Each merge brings the 3.x fixes, versions and changelog entries to `main`, so a change made on `v3` needs no second PR. When your `v3` fix touches code that changed on `main` since the cut, add the `forwardport` label, so whoever runs the merge knows where to look.

## PR title

We follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). Because we use **squash merge**, the PR title becomes the final commit message on the base branch.

Your PR title **should** follow this pattern:

```
<type>(<scope>): <short lowercase imperative summary>
```

Imperative mood, lowercase start, no trailing period. Append `!` after the scope for breaking changes.

### Scope Selection

Use the package directory name under `packages/` as the scope.
For infrastructure changes use `ci`, `deps`, `agents`, or `changesets`.
Comma-separate when multiple scopes apply.

### Examples

```
feat(atomic): add new facet breadcrumb component
fix(headless, quantic): correct subscription cleanup on unmount
chore(deps): bump vitest to v3
feat(relay)!: change event payload structure
```

## PR description

Your PR description **should** follow one of the templates in [`.github/PULL_REQUEST_TEMPLATE/`](.github/PULL_REQUEST_TEMPLATE/). Pick the one that matches your change type:

| Type                                                | Jira work item | Use when                                           |
| --------------------------------------------------- | -------------- | -------------------------------------------------- |
| [`feat`](.github/PULL_REQUEST_TEMPLATE/feature.md)  | Story / Task   | Adding new functionality or enhancements           |
| [`fix`](.github/PULL_REQUEST_TEMPLATE/bugfix.md)    | Bug            | Fixing a defect                                    |
| [`chore`](.github/PULL_REQUEST_TEMPLATE/chore.md)   | Task           | Maintenance, dependency updates, tooling, refactor |
| [`style`](.github/PULL_REQUEST_TEMPLATE/style.md)   | Task           | Formatting/whitespace with no logic change         |
| [`docs`](.github/PULL_REQUEST_TEMPLATE/docs.md)     | Task           | Documentation-only changes                         |
| [`test`](.github/PULL_REQUEST_TEMPLATE/test.md)     | Task           | Adding or updating tests only                      |
| [`revert`](.github/PULL_REQUEST_TEMPLATE/revert.md) | —              | Reverting a previous commit                        |

If a template doesn't fit your situation, feel free to structure the description differently — the point is giving reviewers enough context to understand the what, why, and how.

## Commit messages

Individual commit messages within a PR are **optional** to format — they get squashed away. That said, you **could** follow the same Conventional Commits pattern for your commits so that the PR title and description pre-fill automatically when you open the PR.

## Changeset

This repository uses [Changesets](https://changesets.dev/guide/getting-started).

Required whenever you modify source code of a public package under `packages/`.
However, do not create changesets for trivial or internal changes. See the PR templates for each corresponding change type for guidance.

If you determine that a changeset is required, run `pnpm changeset` and follow the instructions as prompted.

## Contribution Workflow

1. **Create a branch** from the base branch of your change (see [Where does my PR go?](#where-does-my-pr-go)) — no naming convention enforced.
2. **Make your changes** in the relevant package(s).
3. **Add a changeset** when applicable (see [above](#changeset)).
4. **Commit** A [Husky](https://typicode.github.io/husky/) pre-commit hook runs `pnpm run pre-commit` to catch lint and formatting issues.
5. **Open a pull request** against that base branch — pick a [PR template](#pr-description) and write a title that follows [Conventional Commits](#pr-title).
6. **Address review feedback** — push additional commits; they'll be squashed on merge.

## Additional References

- [AGENTS.md](./AGENTS.md) — Instructions for AI agents.
