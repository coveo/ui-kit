# Git history strategy for folding repos into ui-kit

**Status**: `🟡 Proposed`

## 1. Context

We are folding `@coveo/relay` and `coveo.analytics.js` into the `ui-kit` monorepo.
Each source repo has hundreds of commits (relay ~300+). We must decide what happens
to that history once the code lands in ui-kit.

- **Drivers**: keep ui-kit's `main` history clean and readable; preserve full
  authorship/`git blame` for the imported code; minimize process friction (ui-kit
  is squash-merge only).
- **Constraints**: ui-kit branch protection currently allows **squash merges only**.
  Source repos are archived after the move.
- **Assumptions**: an uncluttered `main` history (not buried under hundreds of
  imported commits) keeps everyday `git log`, bisect, and release tooling readable;
  deep blame on imported code is valuable but occasional.

## 2. Decision Statement

**Adopt Option A: squash-merge the integration PR for a clean `main`, preserve the
full path-rewritten history as a permanent `archive/<lib>-history` branch, and
publish a `git replace` graft so any developer can opt into deep `git blame`/`git log`
on demand.**

This is the only option that keeps `main` at a single commit per integration **and**
keeps the full history (with original authors) reachable from inside ui-kit, without
weakening ui-kit's squash-only merge policy.

## 3. Options Considered

"Commits on `main`" = how many commits appear in GitHub's commit list / default
`git log` (not just `--first-parent`).

|                           | A — Squash + archive ref + graft _(Selected)_ | B — Squash + archive old repo | C — Merge commit        |
| ------------------------- | --------------------------------------------- | ----------------------------- | ----------------------- |
| Commits on `main`         | 🟢 1                                          | 🟢 1                          | 🔴 300+ (relay)         |
| History & blame in ui-kit | 🟢 Preserved, on-demand                       | 🔴 Old repo only              | 🟢 Automatic            |
| Keeps squash-only policy  | 🟢 Yes                                        | 🟢 Yes                        | 🔴 No (needs exception) |
| One-time setup            | 🟡 push archive ref + graft                   | 🟢 None                       | 🟢 None                 |

### Option A (Selected): Squash + permanent `archive/*` history ref + published graft

- **Summary**: Squash-merge for a clean `main`. Publish the full path-rewritten
  history as a permanent `archive/<lib>-history` branch, plus a `git replace` graft
  (`refs/replace/*`) that stitches it under the squash commit. Developers opt into
  deep blame with one `git fetch`.
- **Pros**: `main` stays at **1 commit per integration**; full history (original
  authors) is **preserved inside ui-kit**; **respects the squash-only merge policy**
  (no exception); deep blame is one `git fetch` away; uses the modern, supported
  `git replace --graft`.
- **Cons**: Blame is opt-in (replace refs aren't fetched on clone); the active graft
  makes the local view diverge from CI/GitHub; the graft dangles if the `archive/*` branch
  is deleted.
- **Risks & mitigations**: Default state is graft-off, so CI/tooling are unaffected;
  history is always present via `archive/*` even without the graft; protect the
  `archive/*` branch from cleanup. The tooling is standard/supported (`git replace`),
  but the composition is uncommon, so it's documented here + in a runbook.

### Option B: Squash, keep history in the archived source repo

- **Summary**: Squash-merge; rely on the archived GitHub repo for old history.
- **Pros**: `main` gets 1 clean commit; no policy exception; nothing extra to set up.
- **Cons**: **No history or `git blame` for imported code inside ui-kit** — you must
  leave the repo and dig in the archived one. In practice this is "out of sight, out
  of mind"; blame dead-ends at the squash commit.
- **Risks**: History effectively abandoned from a day-to-day standpoint.

### Option C: Merge commit (`git merge --allow-unrelated-histories`)

- **Summary**: Land the integration via a real merge commit (the draft's original choice).
- **Pros**: Full history preserved; `git blame` automatic for everyone, zero setup;
  well-trodden.
- **Cons**: All **300+ source commits appear in `main`'s commit list** permanently
  (GitHub/GUIs walk all ancestry); only `git log --first-parent` stays clean. Requires
  **relaxing ui-kit's squash-only branch protection** for the PR — a standing policy
  exception and a foot-gun (wrong merge button drops or stacks history).
- **Risks**: Permanent history-view noise; ancestry/merge-base side effects for every
  contributor, forever — not just on demand.
  - _Example_: `git bisect` on `main` traverses the imported commits, which don't
    build at their old paths/deps — so bisecting a regression hits unbuildable
    revisions. Also skews `git describe`, commit counts, and `shortlog` author lists.

## 4. Decision Rationale

An uncluttered `main` history keeps everyday `git log`, bisect, and release tooling
readable; automatic-but-noisy history (Option C) imposes a permanent cost on everyone
to serve an occasional need. Option A inverts that correctly: pay the cost (a `git fetch`) only
when you actually need deep blame, and keep `main` pristine the rest of the time.

A dominates B because it keeps the same clean `main` **without** abandoning history —
the full record stays inside ui-kit, one `git fetch` from full blame, instead of
requiring a trip to an archived repo. A beats C because it preserves history **without**
carving a permanent exception into ui-kit's squash-only merge policy and **without**
dumping 300+ commits into everyone's history view.

The trade-offs are real but bounded and one-time/opt-in, and the
tooling is modern and supported (`git replace --graft`). The result is the best
clean-trunk-to-history-preserved ratio of the three.

## 5. Operational & Rollout Impact

- **Migration** (per the technical draft + Option A's additions):
  1. Final release + freeze the source repo; `git-filter-repo` path rewrite.
  2. Publish history: `git push origin archive/<lib>-history` (never merged into `main`).
  3. Open the integration PR; **squash-merge** it.
  4. Publish the graft:
     ```sh
     SQUASH=$(git rev-parse HEAD)
     git replace --graft "$SQUASH" "$SQUASH^" origin/archive/<lib>-history
     git push origin 'refs/replace/*'
     ```
  5. Protect the `archive/*` branch from cleanup; archive the source repo.
- **Developer runbook** (separate doc): activate `git fetch origin 'refs/replace/*:refs/replace/*'`,
  deactivate `git replace -d "$(git replace -l)"`.
- **CI**: unaffected — default state is graft-off; keep authoritative tooling on the
  real `main` (`--no-replace-objects` if ever needed).
- **Rollback**: fully revertable before the source repo is archived.
