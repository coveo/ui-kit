---
name: managing-architecture-decision-records
description: Manages the ADR lifecycle including creating, bootstrapping, drafting, reviewing, accepting, deprecating, and deleting Architecture Decision Records. Use when the user wants to document a decision, change an ADR status, or remove an obsolete record.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

# Managing Architecture Decision Records

All conventions (scope, numbering, filenames, statuses, deletion policy) are defined in [ADR 0002](../../../docs/adr/0002-adr-template.md). Read it before proceeding.

## Creating an ADR

1. Determine the target directory per ADR 0002 (monorepo: `docs/adr/`, package: `packages/<pkg>/docs/adr/`). Ask if unclear.
2. Compute the next number:
   ```bash
   node .agents/skills/managing-architecture-decision-records/scripts/next-adr-number.mjs <adr-directory>
   ```
3. Slugify the title (lowercase, hyphens, no special chars). Example: `"Use Event Sourcing"` → `use-event-sourcing`
4. Assemble path: `<adr-directory>/<NNNN>-<slug>.md`
5. Copy `docs/adr/ADR-template.md` to that path. Set status to `Proposed`, fill today's date.
6. Guide the author through each section collaboratively.

## Reviewing an ADR

Verify: one decision, drivers distinct from decision, options evaluated against drivers, rationale explains why alternatives lost, positive/negative/neutral consequences present. Flag RFC-depth content.

## Accepting

Confirm maintainer agreement, verify outcome and consequences are complete, set status to `Accepted`, update date.

## Deprecating

Confirm the ADR still describes existing behavior, record why new work should diverge, set status to `Deprecated`, update date.

## Deleting

Search for references first. Report any that may break. Require explicit user confirmation naming the ADR. Never delete without confirmation.
