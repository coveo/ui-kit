---
name: conversational-poc-subphase-kickoff
description: Kick off a sub-phase of the conversational POC. Use at the start of each sub-phase session.
agent: agent
---

You are starting a new sub-phase of the headless-future conversational POC.

## Step 1 — Load context

Read the overarching plan from `/memories/repo/conversational-poc-plan.md`. Also read `/memories/repo/headless-future-streaming-refactor-notes.md` if it exists. This gives you the full picture of what's been decided and what's been done.

## Step 2 — Confirm the sub-phase

Ask the user which sub-phase they want to work on (e.g., "Phase 0", "Phase 1.3"). Look it up in the plan.

## Step 3 — Grill me

Run a focused design interview for **only** that sub-phase. Do not re-litigate decisions already in the Locked Decisions table. Surface only the open questions specific to this sub-phase's implementation details. Use `vscode_askQuestions` in batches. Keep drilling until there is zero ambiguity.

## Step 4 — Implement

Once the interview is complete and all questions are resolved, switch to implementation mode. Follow test-first discipline: unit tests before wiring. Verify with `pnpm --filter @coveo/headless-future test && pnpm --filter @coveo/headless-future build`.

## Step 5 — Update the plan

After implementation, update the status tracker in `/memories/repo/conversational-poc-plan.md` to mark the sub-phase complete and record the branch name.
