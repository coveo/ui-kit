# Git history strategy for folding repos into ui-kit

**Status**: `🟡 Proposed`

## 1. Context

We are folding `@coveo/relay` and `coveo.analytics.js` into the `ui-kit` monorepo.
Each source repo has hundreds of commits (relay ~300+). We must decide what happens
to that history once the code lands in ui-kit.

- **Drivers**: keep ui-kit's `main` history clean and readable; keep the original
  history available _somewhere_ for the rare deep dive; minimize process friction
  and long-term complexity (ui-kit is squash-merge only).
- **Constraints**: ui-kit branch protection currently allows **squash merges only**.
  Source repos are archived after the move.
- **Assumptions**: an uncluttered `main` history (not buried under hundreds of
  imported commits) keeps everyday `git log`, bisect, and release tooling readable;
  deep `git blame` on the folded libs is rare (near-zero over the last ~2 years),
  so "good enough" access to old history is acceptable.

## 2. Decision Statement

**Adopt Option B: squash-merge the integration PR for a clean `main`, and preserve
history by keeping the original `relay` and `coveo.analytics.js` repos archived
(read-only) on GitHub — not imported into ui-kit.**

This keeps `main` at a single commit per integration and avoids introducing any new,
long-term git constructs. The accepted trade-off: in-repo `git blame` on the folded
code stops at the squash commit; deep history remains available in the archived repos.

## 3. Options Considered

"Commits on `main`" = how many commits appear in GitHub's commit list / default
`git log` (not just `--first-parent`).

|                           | A — Squash + archive ref + graft | B — Squash + archive old repo _(Selected)_ | C — Merge commit        |
| ------------------------- | -------------------------------- | ------------------------------------------ | ----------------------- |
| Commits on `main`         | 🟢 1                             | 🟢 1                                       | 🔴 300+ (relay)         |
| History & blame in ui-kit | 🟢 Preserved, on-demand          | 🟡 Old repo only                           | 🟢 Automatic            |
| Keeps squash-only policy  | 🟢 Yes                           | 🟢 Yes                                     | 🔴 No (needs exception) |
| Long-term complexity      | 🟡 new `archive/*` ref + graft   | 🟢 None                                    | 🟢 None                 |

### Option B (Selected): Squash, keep history in the archived source repo

- **Summary**: Squash-merge the integration PR; rely on the archived (read-only)
  GitHub repos for the original history.
- **Pros**: `main` gets **1 clean commit** per integration; no branch-protection
  exception; **no new long-term git concepts** to learn or maintain (KISS); history
  is not lost — it stays in the archived repos.
- **Cons & mitigations**: In-repo `git blame` dead-ends at the squash commit — for
  deep history you go to the archived repo. Mitigated by the fact that deep blame on
  these libs is rare; when it's needed, the archived repo is good enough (and quickly
  becomes "too old to care" anyway).
- **Risks**: Minimal. Requires keeping the archived repos reachable (read-only, not deleted).

### Option A: Squash + permanent `archive/*` history ref + published graft

- **Summary**: Squash-merge for a clean `main`, but also publish the full history as
  a permanent `archive/<lib>-history` branch plus a `git replace` graft so developers
  can opt into in-repo deep blame with one `git fetch`.
- **Pros**: Clean `main` **and** history reachable from inside ui-kit; deep blame is
  one `git fetch` away; uses the modern, supported `git replace --graft`.
- **Cons**: Blame is opt-in (replace refs aren't fetched on clone) and must be toggled
  off before making changes — in practice this is close to B for daily work. Adds a new
  long-term `archive/*` ref + published graft (a non-standard, if supported, composition).
- **Why not chosen**: The extra long-term git surface isn't justified given how rarely
  deep blame on these libs is needed; B reaches the same clean `main` with less to
  explain and maintain.

### Option C: Merge commit (`git merge --allow-unrelated-histories`)

- **Summary**: Land the integration via a real merge commit (the draft's original choice).
- **Pros**: Full history preserved; `git blame` automatic for everyone, zero setup;
  well-trodden.
- **Cons**: All **300+ source commits appear in `main`'s commit list** permanently
  (GitHub/GUIs walk all ancestry); only `git log --first-parent` stays clean. Requires
  **relaxing ui-kit's squash-only branch protection** for the PR — a standing policy
  exception and a foot-gun (wrong merge button drops or stacks history).
- **Why not chosen**: Permanent history-view noise and ancestry/merge-base side effects
  for every contributor, forever.
  - _Example_: `git bisect` on `main` traverses the imported commits, which don't
    build at their old paths/deps — so bisecting a regression hits unbuildable
    revisions. Also skews `git describe`, commit counts, and `shortlog` author lists.

## 4. Decision Rationale

Keep it simple. All three options can keep `main` clean; the real question is how much
long-term machinery we take on to preserve history _inside_ ui-kit — and the team's
read is that deep blame on relay/`coveo.analytics.js` is rare enough that it isn't worth much.

- **B over A**: A's opt-in graft is, for day-to-day work, barely different from B (you
  must deactivate it to make changes; it's just a quick IDE peek). It isn't worth a new
  long-term `archive/*` ref + published graft. Fewer permanent git references is better;
  when someone genuinely needs old blame, the archived repo covers it.
- **B over C**: C dumps 300+ commits into `main` forever and requires carving a
  permanent exception into the squash-only merge policy, for a benefit (automatic blame)
  we rarely use.

History is preserved (archived repos), `main` stays clean, and we add zero new git
concepts. Best simplicity-to-value trade-off.

## 5. Operational & Rollout Impact

- **Migration** (per the technical draft):
  1. Final release + freeze the source repo; `git-filter-repo` path rewrite.
  2. Open the integration PR; **squash-merge** it.
  3. Update NPM Trusted Publisher settings to publish from `coveo/ui-kit`.
  4. **Archive** the source repo read-only on GitHub (add a README pointer to ui-kit).
- **CI**: no special handling; standard squash merge.
- **Deep history**: available in the archived source repos on GitHub.
- **Rollback**: fully revertable before the source repo is archived.
