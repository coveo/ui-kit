---
name: working-on-ui-kit-v4
description: Guides the delivery of a UI-Kit v4 story end to end, including its track (v3, v4, experimental or no-release), which branch to target, the changeset bump, the v3 to v4 upgrade guide entry, sample and test updates, and the pull request. Use when a Jira issue belongs to the UI-KIT v4 epics (KIT-3377, KIT-4387, KIT-4621, KIT-5934) or its summary starts with a "v3:" or "v4:" prefix, when removing or renaming a public API, when adding a deprecation, or when the user mentions v4, a breaking change, a major bump or the upgrade guide.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

# Working on UI-Kit v4

One rule holds the whole process together: **a change that breaks a customer ships with the text that migrates that customer, in the same pull request.** Everything below exists to make that automatic.

## Current state

Update this table when a decision lands; the rest of the skill reads from it.

| Fact                       | Value                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v3 line                    | `main`, released by `.github/workflows/cd.yml` through Changesets                                                                                                                                                |
| v4 integration branch      | Not created yet. KIT-4387 (v4 preparation) names it. Until then, see "Before the v4 branch exists".                                                                                                              |
| Maintenance branches       | `release/v2`, `release/v3`. CDN hotfixes branch from a release tag as `hotfix/**` (`.github/workflows/hotfix.yml`).                                                                                              |
| Upgrade guide (engineering) | `packages/headless/source_docs/upgrade-from-v3-to-v4.md`, `packages/headless-react/source_docs/upgrade-from-v3-to-v4.md`, `packages/atomic/docs/upgrade-from-v3-to-v4.md`. Not listed in any `typedoc.json` until GA. |
| Published guides           | Headless and Headless React through Typedoc (`projectDocuments`), Atomic on docs.coveo.com by the technical writers (KIT-6388).                                                                                 |
| Story list                 | Jira JQL: `parent in (KIT-3377, KIT-4621, KIT-4387) OR "Epic Link" in (KIT-3377, KIT-4621, KIT-4387)`                                                                                                           |

## Step 1: Pick the track

Decide the track from what the change does to a customer on the latest v3 release. Take the first case that applies:

1. **no-release:** no published package changes. Spikes, evaluations, Markdown docs, samples, tooling and the upgrade guide itself belong here.
2. **experimental:** only an experimental sub-package changes, such as the SSR `-next` entry points.
3. **v4:** something a v3 customer relies on breaks. A member is removed, renamed or made private, a signature or a default changes, or a requirement such as the Node.js version or a peer dependency floor rises.
4. **v3:** everything else. The change adds an API, an opt-in, a warning or a deprecation notice, and nothing breaks.

Newer story titles start with `[Package] v3:` or `[Package] v4:`. Treat that prefix as a hint and let the order above decide: most stories in the epics have no prefix, and `[Docs] v4: write the v3 to v4 upgrade guide` changes no published package, so it is no-release.

| Track            | Example story                                                                        | Base branch                                   | Changeset bump                                     | Upgrade guide entry               |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------- | --------------------------------- |
| **v3**           | KIT-6346 `[Headless] v3: deprecate the legacy commerce facet contract`               | `main`                                        | `minor` for a new API or notice, `patch` for a fix | Optional "planned removal" row    |
| **v4**           | KIT-6347 `[Headless] v4: sunset the legacy commerce facet contract`                  | the v4 integration branch (see Current state) | `major` on every public package whose API breaks   | Required                          |
| **experimental** | A change to the SSR `-next` entry points                                             | `main`                                        | `minor` or `patch`, never `major`                  | Kept in sync, see below           |
| **no-release**   | KIT-4388 `Should we use Zod over Bueno and deprecate Bueno?`                         | `main`, when any file changes                 | None                                               | None, except in the guide's story |

Rules that follow from the track:

- A v4 removal needs a v3 deprecation that already shipped with a replacement customers can use on v3 (KIT-6373 reworded the v3 notices so that each names one). A breaking story without one is two stories: do the v3 part first, as its own PR, and propose the missing v3 story to the user. For example, KIT-4958 renames `atomic-popover`: v3 adds `atomic-facet-popover` and deprecates the old name, and v4 removes it.
- A no-release story adds no changeset. A spike ends with its decision in the Jira issue and, when the decision calls for a change, proposes the v3 and v4 stories that carry it out.
- A v3 deprecation notice names the v3 replacement and never an experimental entry point.
- Experimental sub-packages change without aliases or deprecation periods, but every change is still described in a changeset for customers.
- The experimental SSR sub-packages become the v4 SSR API. When a change there alters what a customer writes, update its upgrade guide entry in the same PR, and remove the entry's `not yet built` marker once the change is built.

## Step 2: Build the change

- One root cause per pull request, at most five PRs in a stack. A story that removes six members is six small PRs or one PR per package, not one large PR.
- **v3 track:** add `@deprecated` with "Use `<replacement>` instead" on every member, where the replacement exists on v3. Keep the old behaviour intact. When a runtime warning helper exists (KIT-6389), emit it once per process, not per call.
- **v4 track:** delete the member, its tests, its stories, its docs and its sample usage in the same PR. Do not leave a shim unless the story asks for one.
- **Inferred public types:** when a change touches generics that customers rely on for IntelliSense (engine definitions, hooks, static and hydrated state), add `expectTypeOf` assertions in a `*.test-d.ts` file next to the code so the inference cannot regress silently. Vitest runs these files only when the package's Vitest config has a `typecheck` block, as `packages/thermidor/vitest.config.js` does; add one when the package lacks it.
- **Samples:** `samples/**` folders without a suffix are the v3 reference and the "before" of the guide; never port them to the new API. A v4 sample lives in a `<sample>-v4` folder until GA, when it replaces the original. Keep samples minimal: the integration point only.
- **Docs in code:** update the module docs of the entry points you touch so the first example a customer reads matches the API.

## Step 3: Write the changeset

Skip this step on the no-release track. Otherwise, run `pnpm changeset` for every public package whose published surface changes, then edit the file by hand so that it:

1. Names the bump of Step 1 for each library package. Sample packages share a "fixed" group with their library in `.changeset/config.json` and move with it, so leave them out.
2. Says what changed and what to do instead, in customer words, in two to five sentences. For a `major` bump, end with the anchor of the guide entry: `See the upgrade guide, "<entry title>".`
3. Never names a customer, and never names an experimental entry point (write "the experimental commerce SSR sub-package").

## Step 4: Write the upgrade guide entry

Required for every `major` bump; recommended for a v3 deprecation, as a "planned removal" row.

Use [references/upgrade-guide-entry.md](references/upgrade-guide-entry.md) for the entry shape. In short: one sentence on what changed, a version 3 block taken from a v3 sample, a version 4 block taken from a v4 sample, one sentence on what to do instead, under 15 lines of prose. Add each removed member to the removals table of its theme. Put the entry in the file of the package that changed; Atomic entries go to `packages/atomic/docs/upgrade-from-v3-to-v4.md`, which the technical writers turn into the docs.coveo.com page.

## Step 5: Check, commit, open the pull request

A no-release story that changes no file, such as most spikes, goes straight to Step 6.

1. Run the checks of the packages you changed, then `pnpm -w run lint:fix`.
2. Run the story check: `node .agents/skills/working-on-ui-kit-v4/scripts/check-v4-change.mjs --track <v3|v4|experimental|no-release>`. It fails when a public package changed without a changeset, when a bump does not match the track, when a `major` bump has no guide entry, when a guide entry names an experimental entry point, or when a no-release branch adds a changeset or changes published source. Fix what it reports.
3. Commit with a Conventional Commits title; a breaking change on the v4 track takes the `!` marker: `feat(headless)!: remove the legacy SSR API`. Sign every commit (`git commit -S`); unsigned commits block the merge.
4. Push the branch, then open the PR only when the piece is ready for review, with the template of its type from `.github/PULL_REQUEST_TEMPLATE/` (see the `commit-changes` skill), the Jira link filled in, against the base branch of the track. When early CI feedback is wanted before the review, open it as a draft and say so.
5. In the PR description, state the track, the bump and the guide entry title, so the reviewer checks all three.

## Step 6: Close the story

- Comment on the Jira issue with the PR, the bump and the guide entry title. For a spike, comment with the decision and the follow-up stories you propose.
- Set "Requires Public Documentation" to Yes when a docs.coveo.com page other than the guide must change, and open a DOC request for the technical writers.
- Leave the story in progress until the PR is merged into the base branch of its track.

## Before the v4 branch exists

A v4 removal cannot merge into `main` while `main` ships v3. Until KIT-4387 names the integration branch: build the removal on a branch stacked on its v3 deprecation branch, push it to `origin`, run the story check with `--track v4`, link the branch from the Jira issue, and do not open a PR against `main`. When the branch exists, rebase and open the PR there.

## Scripts

| Script                  | Purpose                                                             | Usage                                                                      |
| ----------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `check-v4-change.mjs`   | Verifies changesets, bump versus track, guide entry and naming rules | `node scripts/check-v4-change.mjs [--base origin/main] [--track v3\|v4\|experimental\|no-release]` |

## References

- [Upgrade guide entry](references/upgrade-guide-entry.md): the entry template, a filled example and the removals table format.

## Do not

- Do not point customers at an experimental entry point in a deprecation notice, a changeset or the guide.
- Do not remove a member on `main`.
- Do not bump `major` on the v3 or experimental tracks.
- Do not reorganize folders or files in a v4 story unless the story is about that; a removal PR stays a removal.
- Do not edit the v3 samples to the new API.
