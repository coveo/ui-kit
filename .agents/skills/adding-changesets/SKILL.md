---
name: adding-changesets
description: Adds changeset files to track version bumps and changelog entries for published packages. Use when modifying source code of any public package, fixing bugs, adding features, or making breaking changes. Do not use for documentation-only, CI/CD, test-only, or internal tooling changes.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

# Adding Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs across the monorepo.

## What Is a Changeset?

A changeset is a Markdown file stored in the `.changeset/` directory. It declares which packages are affected by a change and what kind of semver bump each package needs. During the release process, changesets are consumed to automatically bump versions and generate changelogs.

## When to Add a Changeset

**Add a changeset when:**

- Fixing a bug in a public package
- Adding a new feature to a public package
- Making a breaking change to a public package
- Updating a dependency that affects a public package's behavior

**Do NOT add a changeset when:**

- Making documentation-only changes
- Changing CI/CD configuration
- Adding or modifying tests only (no source code change)
- Changing internal tooling or scripts
- Modifying private packages (`@coveo/atomic-a11y`, `@coveo/documentation`, `@coveo/create-atomic-template`, `@coveo/atomic-angular-builder`)

## How to Create a Changeset

Create a new Markdown file in `.changeset/` with a random, descriptive kebab-case name (e.g., `.changeset/bright-pandas-dance.md`).

### File Format

```markdown
---
'@coveo/package-name': patch
---

A brief description of the change for the changelog.
```

The frontmatter is a YAML mapping of package names to semver bump types. The body is a Markdown description that becomes the changelog entry.

### Semver Bump Types

| Bump    | When to Use                                                        | Example                          |
| ------- | ------------------------------------------------------------------ | -------------------------------- |
| `patch` | Bug fixes, minor internal changes that don't affect the public API | `"@coveo/headless": patch`       |
| `minor` | New features, new exports, non-breaking additions to the API       | `"@coveo/atomic": minor`         |
| `major` | Breaking changes: removed/renamed exports, changed behavior        | `"@coveo/headless-react": major` |

### Multiple Packages

If a change spans multiple packages, list all affected packages in the same changeset file:

```markdown
---
'@coveo/headless': minor
'@coveo/atomic': patch
---

Added a new `sortBy` option to the result list controller. Updated Atomic to support the new option.
```

### Writing Good Changelog Descriptions

- Write from the user's perspective — what changed for consumers of the package
- Start with a verb: "Added", "Fixed", "Removed", "Updated"
- Be specific: "Fixed search query encoding for special characters" not "Fixed a bug"
- For breaking changes, describe the migration path

## Public Packages

These are the public packages that require changesets when modified:

- `@coveo/atomic`
- `@coveo/atomic-react`
- `@coveo/atomic-hosted-page`
- `@coveo/atomic-legacy`
- `@coveo/auth`
- `@coveo/bueno`
- `@coveo/headless`
- `@coveo/headless-react`
- `@coveo/quantic`
- `@coveo/shopify`
- `@coveo/create-atomic`
- `@coveo/create-atomic-component`
- `@coveo/create-atomic-component-project`
- `@coveo/create-atomic-result-component`
- `@coveo/create-atomic-rollup-plugin`

## Example

A commit that fixes a bug in `@coveo/headless` and updates `@coveo/atomic` to match:

`.changeset/fix-query-encoding.md`:

```markdown
---
'@coveo/headless': patch
'@coveo/atomic': patch
---

Fixed search query encoding for special characters in the query suggest controller.
```

## Validation Checklist

Before completing, verify:

- [ ] Changeset file exists in `.changeset/` with a kebab-case `.md` filename
- [ ] Frontmatter lists every affected public package with the correct bump type
- [ ] Description is written from the consumer's perspective and starts with a verb
- [ ] No private packages are listed in the frontmatter
