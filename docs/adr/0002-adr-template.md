---
status: Accepted
date: 2025-01-20
related:
  - docs/adr/ADR-template.md
  - https://coveord.atlassian.net/wiki/spaces/PENG/pages/3874160922/ADRs+Architecture+Decision+Records
  - https://coveord.atlassian.net/wiki/spaces/PENG/pages/3874259132/ADR+-+Template
---

# ADR template and convention for ui-kit

## Context and Problem Statement

The ui-kit monorepo had multiple ADR templates across packages with inconsistent structure, scope guidance, and lifecycle rules. Contributors could not quickly determine where to place a new ADR, how to number it, what statuses were valid, or when to delete an obsolete record. A unified convention removes ambiguity and makes ADRs useful rather than ceremonial.

## Decision Drivers

- ADRs should record durable, non-obvious decisions whose rationale future maintainers may need.
- Each ADR should contain one primary decision to stay focused and reviewable.
- Decisions should live close to their scope so maintainers find them naturally.
- Numbering must be predictable and conflict-free across independent directories.
- The lifecycle must be minimal and unambiguous.
- Deleted records must remain recoverable without cluttering the working tree.
- Every package should have frictionless access to the canonical template.
- ADRs and RFCs serve different purposes and should not be confused.

## Considered Options

### Option A: Lightweight single-template convention with directory-local numbering

- **Summary:** One canonical template at `docs/adr/ADR-template.md`, distributed via symlinks. Local numbering per directory. Three statuses only. Obsolete ADRs deleted with Git as archive.
- **Pros:** Simple, predictable, low ceremony, scales across the monorepo.
- **Cons:** Deleted ADRs require Git history navigation to read.

### Option B: Full [MADR](https://adr.github.io/madr/) with centralized numbering and superseded status

- **Summary:** Adopt [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) verbatim with a single global sequence and `Superseded` status linking old to new.
- **Pros:** Richer status model, established community standard.
- **Cons:** Global numbering creates merge conflicts in a monorepo with independent packages. `Superseded` chains become stale and confusing. Heavier template discourages short records.

## Decision Outcome

Adopt Option A: a lightweight convention with one canonical template, directory-local numbering, and deletion as the mechanism for removing obsolete records.

### Rationale

Option A keeps the template short enough that contributors actually use it, avoids global numbering conflicts in a monorepo with many packages, and relies on Git history rather than status chains to preserve deleted records. Option B's richer status model adds complexity without proportional value when deep history access is rare.

## Convention

### When to write an ADR

An ADR is appropriate for a durable, non-obvious decision whose rationale future maintainers may need. If a decision is obvious, temporary, or easily reversed, it probably does not need an ADR.

### One decision per ADR

Each ADR records one primary decision. When a topic involves multiple decisions, split them into separate ADRs that reference each other.

### Monorepo versus package location

- When a decision concerns the monorepo as a whole or establishes a convention across packages, the ADR lives under `docs/adr/`.
- When a decision concerns one package, the ADR lives under `packages/<package>/docs/adr/`.
- When scope is ambiguous, the author chooses between monorepo and package scope explicitly.

Existing ADRs remain in their current locations.

### Directory-local numbering

Each ADR directory maintains an independent local sequence:

- Numbers are zero-padded to four digits (`NNNN`).
- The next number is one greater than the highest existing number in the destination directory.
- Missing numbers are never reused.
- Only files matching the ADR filename pattern contribute to numbering; unrelated files are ignored.

### Filename conventions

ADR filenames follow the pattern `NNNN-kebab-case-title.md`:

- The slug contains only lowercase letters, numbers, and hyphens.
- The numeric prefix uses the directory-local sequence described above.

### Status lifecycle

The supported statuses are:

- `Proposed` — the default for new ADRs.
- `Accepted` — maintainers agree to the decision.
- `Deprecated` — the decision still describes existing behavior but should not guide new work.

There is no `Rejected` or `Superseded` status. Abandoned proposals or ADRs that no longer describe the repository should be deleted.

### Deletion and Git-history policy

- An abandoned proposal may be deleted.
- An ADR that no longer describes the repository should be deleted.
- Git history serves as the archive for deleted ADRs.

Before deleting, search the repository for references (filename, relative path, title) and report any that may break. Require explicit confirmation. If scope is unclear, do not delete.

This means the working tree contains only decisions that are currently active (`Accepted`) or winding down (`Deprecated`). When a decision is fully gone from the codebase, the ADR is removed and its content remains accessible through `git log` or `git show`.

### Package symlink distribution

Every immediate directory under `packages/` contains `docs/adr/ADR-template.md` as a relative symlink to the canonical root template (`../../../../docs/adr/ADR-template.md`). No package maintains a separate copy of the template.

This ensures contributors can easily create a package ADR without locating or copying the root template and publicizes the existence of a common template.

### ADR versus RFC distinction

ADRs are short, one-decision records that capture the what, why, and consequences. RFCs are longer documents for deep analysis of complex problems that may involve multiple decisions or require extended discussion. When an ADR draft grows toward RFC depth, link to a supporting RFC rather than inlining the analysis.

## Consequences

- **Positive:** Simpler browsing of the ADR directory because only active or winding-down decisions are present. No confusion about which decisions are current versus superseded.
- **Negative:** Reading a deleted ADR requires navigating Git history (`git log --diff-filter=D -- path/to/deleted.md`, then `git show <commit>:path`). Contributors unfamiliar with Git history commands face a higher barrier to accessing archived decisions.
- **Neutral:** Git history preservation means nothing is truly lost. The trade-off shifts discoverability effort from "scan past superseded markers" to "look up deleted files in history," which matches the observed low frequency of deep-history lookups in this repository.
