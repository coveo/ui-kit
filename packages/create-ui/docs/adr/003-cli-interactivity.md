# 003 - CLI Interactivity

**Status:** Proposed  
**Date:** 2026-07-06

## Context

`@coveo/create-ui` (`npm create @coveo/ui`) scaffolds a project from the official samples (see [ADR 001](./001-sample-consumption.md), [ADR 002](./002-sample-publishing.md)). Two inputs drive a run: the **template** and the **project name**. When both are supplied as flags/arguments the CLI runs unattended; when one is missing the CLI offers a small menu to pick it — the interactive selection [ADR 001](./001-sample-consumption.md) §7 left as "planned."

A previous Coveo CLI took interactivity much further: prompts were interleaved with the work itself, and the answer to one prompt decided which branch of logic ran next and which prompt came after. That "wizard" / flow-diagram model was the source of significant, lasting pain — the business logic became a tangle of control flow driven by live user input, and testing it required simulating terminals and scripting prompt sequences. We are deliberately not repeating that.

This ADR records where interactivity is allowed to live in `@coveo/create-ui`, and — more importantly — where it is not. It is scoped to `@coveo/create-ui`; the previous CLI is cited only as the cautionary example that motivates the decision.

## Decisions

### 1. Two phases: resolve inputs, then execute

A run has exactly two phases:

1. **Input resolution** — the only phase where interactivity is allowed. It parses flags/arguments and, for any missing input, prompts for it. Its sole output is one fully-resolved, plain-data options object.
2. **Execution** (`scaffold` and everything it calls) — receives that object and runs to completion. It never prompts.

The options object is the complete description of the run. Given the same object, execution behaves identically whether the values came from flags or from prompts.

### 2. The interactive layer and business logic communicate one way only

Data and control flow in a single direction:

`flags / prompts → resolved options object → execution`

Business logic never calls back into the interactive layer. There is no point at which execution pauses to ask a question, and no prompt whose answer selects which execution step runs next. The rejected alternative is the wizard / flow-diagram model that hurt the previous CLI:

| Aspect         | Accepted (one-way)                  | Rejected (wizard)                   |
| -------------- | ----------------------------------- | ----------------------------------- |
| Prompts        | All upfront, before any side effect | Interleaved with the work           |
| Control flow   | Fixed; driven by the options object | Branches on live prompt answers     |
| Business logic | Pure function of its inputs         | Tangled with I/O and prompt state   |
| Testing        | Pass an object; assert the result   | Simulate a terminal; script prompts |

**Litmus test.** A prompt is forbidden if its answer changes _which execution steps run_, or if it is asked _after_ the first side effect. A prompt is allowed only if it populates the options object (or navigates toward doing so) and completes before execution begins.

### 3. Two kinds of prompts: input and navigation

- **Input prompts** produce a value stored in the options object (`template`, `projectName`). Each has a flag/argument equivalent (`--template`, the positional name). The interactive and non-interactive front-ends are equivalent: any options object producible by prompts is producible by flags, and vice versa.
- **Navigation prompts** produce no stored value; they only organize or narrow an input prompt. The library → template drill-down is one: it groups templates by library for readability, adds no field to the object, and auto-collapses when only one option exists. Grouping is a deliberate UX choice; flattening the menu is not an acceptable substitute.

### 4. State-dependent decisions are resolved upfront, never mid-execution

Some choices depend on the state of the world (e.g. whether the target directory already exists). Such state is probed read-only during input resolution, and the decision is either baked into the options object or turned into a fast failure _before_ execution begins. Execution never discovers a condition and then stops to ask about it.

Worked example: a target directory that already exists and is non-empty is a **hard error** with an actionable message — not an "overwrite? (y/N)" prompt. If overwriting is ever supported, it enters as an upfront flag (e.g. `--force`), never as a mid-run prompt.

## Consequences

- `scaffold` and its helpers are driven solely by the resolved options object (no interactive calls). They are tested by passing an object and asserting the result — no prompt mocking, no simulated terminal.
- The CLI is fully scriptable: every interactive choice has a flag, so a non-interactive invocation reproduces any interactive run.
- Cancelling a prompt (Ctrl-C) aborts before any side effect — there is nothing to roll back — because all prompts precede execution.
