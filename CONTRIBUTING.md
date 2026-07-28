# Contributing to ui-kit

Thank you for contributing to coveo/ui-kit. This guide covers the conventions and workflow for submitting changes to this monorepo.

## Commit message

### Commit subject (title)

This repository follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Because we use **squash merge**, the PR title becomes the final commit message.

Your PR title must follow this pattern:

```
<type>(<scope>): <short lowercase imperative summary>
```

Use the imperative mood, start with a lowercase letter, and omit trailing punctuation.

### Scope Selection

Use the package directory name under `packages/` as the scope.
For infrastructure changes use `ci`, `deps`, `agents`, or `changesets`.
Comma-separate when multiple scopes apply.

### Breaking changes

Append `!` after the scope to signal a breaking change (e.g., `feat(headless)!: remove deprecated controller`).

### Examples

```
feat(atomic): add new facet breadcrumb component
fix(headless, quantic): correct subscription cleanup on unmount
chore(deps): bump vitest to v3
feat(relay)!: change event payload structure
```

### Commit body (description)

Read the selected template file and fill in its sections using [GitHub Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

All templates include a Jira link placeholder (`https://coveord.atlassian.net/browse/TICKET-ID`). If the change is not associated with a Jira, remove the Jira section from the description.

When you prepare a commit message, select the template that matches your change type from [`.github/PULL_REQUEST_TEMPLATE/`](.github/PULL_REQUEST_TEMPLATE/).

| Type                                                | Jira work item | Use when                                           |
| --------------------------------------------------- | -------------- | -------------------------------------------------- |
| [`feat`](.github/PULL_REQUEST_TEMPLATE/feature.md)  | Story / Task   | Adding new functionality or enhancements           |
| [`fix`](.github/PULL_REQUEST_TEMPLATE/bugfix.md)    | Bug            | Fixing a defect                                    |
| [`chore`](.github/PULL_REQUEST_TEMPLATE/chore.md)   | Task           | Maintenance, dependency updates, tooling, refactor |
| [`style`](.github/PULL_REQUEST_TEMPLATE/style.md)   | Task           | Formatting/whitespace with no logic change         |
| [`docs`](.github/PULL_REQUEST_TEMPLATE/docs.md)     | Task           | Documentation-only changes                         |
| [`test`](.github/PULL_REQUEST_TEMPLATE/test.md)     | Task           | Adding or updating tests only                      |
| [`revert`](.github/PULL_REQUEST_TEMPLATE/revert.md) | —              | Reverting a previous commit                        |

Each template pre-fills the relevant sections and includes a shared checklist.

## Changeset

This repository uses [changeset](https://changesets.dev/guide/getting-started).

Required whenever you modify source code of the public API surface.

However, do not create changesets for trivial or internal changes. See the PR templates for each corresponding change type for guidance.

If you determine that a changeset is required, run `pnpm changeset` and follow the instructions as prompted.

## Contribution Workflow

1. **Create a branch** — no specific naming convention is enforced.
2. **Make your changes** in the relevant package(s).
3. **Add a changeset** (when applicable) — run `pnpm changeset` and select the affected packages. Required whenever you modify source code of a public package; CI will fail if one is missing.
4. **Commit** using the [Conventional Commits format](#commit-subject-title). A [Husky](https://typicode.github.io/husky/) pre-commit hook automatically runs `pnpm run pre-commit` to catch lint and formatting issues.
5. **Open a pull request** — select the appropriate [PR template](#commit-body-description) and ensure the PR title follows Conventional Commits format.
6. **Address review feedback** — push additional commits as needed; they will be squashed on merge.

## Additional References

- [AGENTS.md](./AGENTS.md) — Instructions for AI agents.
