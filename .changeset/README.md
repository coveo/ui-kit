# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a Changeset

When you make changes that should be released, add a changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages are affected
2. Choose the semver bump type (major/minor/patch)
3. Write a summary of the changes

A markdown file will be created in `.changeset/` describing the change.

## When to Add a Changeset

- **Yes**: Bug fixes, new features, breaking changes, dependency updates affecting public packages
- **No**: Documentation-only changes, CI/CD changes, test-only changes, internal tooling

## Configuration

See `.changeset/config.json` for configuration options.

## Documentation

- [Changesets Documentation](https://github.com/changesets/changesets/tree/main/docs)
- [Common Questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
