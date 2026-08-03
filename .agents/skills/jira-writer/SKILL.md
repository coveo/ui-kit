---
name: jira-writer
description: Drafts and creates Jira task artifacts (epics, spikes, user stories, bugs) from notes or source artifacts, with strict routing and confirmation gates.
metadata:
  version: "1.0.0"
  last-evaluated: "2026-07-06"
  maturity: 4/5      # Production
---

# Jira Writer

Use this skill when the user asks to write or create Jira task artifacts.

## Core rules

- Supported issue types: `Epic`, `Spike`, `Story`, `Bug`.
- Always show a complete draft before creating the Jira issue.
- Never create the Jira issue until the user explicitly confirms the draft.
- If the user asks for a task artifact in Confluence by mistake, ask a targeted routing question and recommend Jira.
- Use the project requested by the user; if none is provided, ask or apply a team default project policy when known.
- For `Bug`/`Spike`/`Story`, apply a team default parent epic only when a project-specific policy is known; otherwise ask.
- `Epic` has no default parent/epic linkage.
- If no project-specific parent policy is known, ask for parent behavior (or proceed without parent if the user prefers).

## Routing and ambiguity rules

- Jira artifacts: epics, spikes, bugs, execution-ready stories.
- User stories are phase-based:
  - Planning/review -> Confluence (`user-story` skill)
  - Accepted/execution-ready -> Jira (`jira-writer` skill)
- If platform intent is unclear, ask exactly one targeted question before creating anything.
- If clear intent was already stated earlier in the same conversation, follow that intent.

## Process

1. Identify issue type and source.
2. Gather context from source artifacts and user notes.
3. Ask focused follow-up questions for missing critical data.
4. Produce a draft using the issue-type template.
5. Request explicit confirmation.
6. Create Jira issue.
7. Return created issue key + URL + short recap.

## 1) Identify type and input source

Determine the target issue type first:

- `Bug`: production defect or incorrect behavior.
- `Spike`: timeboxed investigation/prototype/research task.
- `Story`: execution-ready unit of customer or internal value.
- `Epic`: larger outcome that groups related stories/spikes/bugs.

Then capture source input.

Accept any of the following:

- Jira support ticket URL or key (for example `CMS-256`)
- Other artifact links (Slack thread, Confluence page, logs, screenshots)
- Free-form user prompt with no source link

If a Jira issue is provided, fetch and extract at least:

- Summary
- Description
- Priority
- Labels/components when useful
- Relevant comments/investigation notes when available

## 2) Gather context

Collect and normalize the issue into clear facts:

- Problem statement
- Expected vs actual behavior
- Impact and urgency
- Reproduction details
- Technical clues (payloads, stack traces, code references)
- Proposed behavior when ambiguous (for example OR vs AND aggregation)

When there are contradictions between source and user, prefer the latest user clarification and mention the discrepancy in Open Questions.

## 3) Ask focused follow-ups

Ask only for missing, decision-critical information. Prefer concise questions.

Typical follow-ups:

- Target project key
- Parent epic for `Bug`/`Spike`/`Story` (apply team default only when known; otherwise ask)
- Parent behavior for `Epic` only if the user explicitly requests hierarchy linkage
- Severity/priority if unclear
- Any missing acceptance criteria
- Assignee/labels/components if the user cares

## 4) Draft using issue-type templates

Use one of:

- `references/BUG_REPORT_TEMPLATE.md`
- `references/SPIKE_TEMPLATE.md`
- `references/USER_STORY_TEMPLATE.md`
- `references/EPIC_TEMPLATE.md`

Draft quality bar:

- Clear title focused on outcome and scope.
- Concrete behavior statements and boundaries; avoid vague language.
- Acceptance criteria must be testable and unambiguous.
- Include source ticket/artifact links.
- Use strict standardized headings from the templates. Do not rename or reorder sections.
- Omit empty optional sections rather than including them with placeholder text.

## 5) Confirmation gate (mandatory)

After drafting, ask for explicit confirmation in plain terms, adapting the wording based on whether a parent/epic is set:

- For `Epic` with no parent/epic: "Ready to create this as a Jira Epic in <PROJECT> with no parent/epic?"
- For non-`Epic` when there is a parent/epic: "Ready to create this as a Jira <ISSUE TYPE> in <PROJECT> under <PARENT>?"
- For non-`Epic` when there is no parent/epic: "Ready to create this as a Jira <ISSUE TYPE> in <PROJECT> with no parent/epic?"

Do not create anything before this confirmation.

## 6) Create Jira issue

On confirmation:

- Create issue type `Epic`, `Spike`, `Story`, or `Bug` in chosen project.
- Build the description payload as ADF per the Description Formatting Contract.
- Set parent/epic linkage when applicable to issue type and requested/defaulted.
- Apply priority/labels/components/assignee if provided.
- After creation, run the Post-Create Verification step.

`Epic` does not use default parent/epic linkage and Jira hierarchy rules may reject Epic-under-Epic links. If parent/epic linkage cannot be set with the current API flow, create the issue and clearly tell the user what to set manually.

## 7) Final response

Return:

- Created issue key and URL
- Target project and parent/epic used (if applicable)
- One-line recap of what was captured
- Any manual follow-up still needed

## Description Formatting Contract (Mandatory)

All Jira issue descriptions must use Atlassian Document Format (ADF). Never send the full description as a single `paragraph` node.

### ADF node mapping rules

- Section headings -> `heading` (level 2)
- Story statements, problem descriptions -> `paragraph`
- Acceptance criteria, reproduction steps -> `orderedList`
- Scope, details, investigation, references, risks, deliverables -> `bulletList`
- JSON or code examples -> `codeBlock` with `language: "json"` (or appropriate language)

### Strict heading names per issue type

**Story:**

1. `User Story` (paragraph)
2. `Acceptance Criteria` (orderedList)
3. `Additional Details` (bulletList)

**Bug:**

1. `Problem` (paragraph)
2. `Expected Behavior` (paragraph)
3. `Reproduction Steps` (orderedList)
4. `Investigation` (bulletList)

**Spike:**

1. `Problem` (paragraph)
2. `Scope` (bulletList)
3. `Questions to Answer` (bulletList)
4. `Deliverables` (bulletList)
5. `Timebox` (paragraph or bulletList)

**Epic:**

1. `Objective` (paragraph)
2. `Problem` (paragraph)
3. `Scope` (bulletList)
4. `Risks` (bulletList)

### Additional rules

- Use exactly the heading names listed above. Do not rename or reorder sections.
- Omit empty optional sections rather than including them with placeholder text.
- Routing metadata (project, parent epic, priority) must never appear in the rendered Jira description. Use Jira fields for these.
- If a section contains code examples, place the `codeBlock` node immediately after the related `paragraph` or `listItem` node.

## Post-Create Verification (Mandatory)

After creating the issue:

1. `GET` the issue from the Jira API and inspect `fields.description.content` top-level node types.
2. Assert the expected node sequence for the issue type. For example, a Story should have: `heading`, `paragraph`, `heading`, `orderedList`, `heading`, `bulletList`.
3. If the node sequence is wrong (for example, the entire description is a single `paragraph` node), immediately `PUT` a corrected ADF description.
4. Report "Description verified" or "Description auto-corrected" in the final response to the user.

## Output conventions

- Keep wording concise and operational.
- Prefer bullets and short sections.
- Preserve raw technical evidence exactly when quoting payloads/logs.
