# Jira Writer Skill

Use this skill to draft and create Jira task artifacts from source notes, tickets, and investigation context.

## What It Does

- Supports issue types: `Epic`, `Spike`, `Story`, `Bug`.
- Gathers context from source artifacts (Jira links, docs, logs, screenshots, or free-form notes).
- Produces a complete draft before any Jira write.
- Requires explicit user confirmation before creating an issue.
- Uses structured issue templates and ADF formatting rules from the skill.

## When to Use

- You need to turn support or investigation context into a Jira `Bug`.
- You need an execution-ready `Story` or timeboxed `Spike`.
- You need a new `Epic` with clear scope, problem, and risks.
- You want consistent Jira issue quality and creation flow.

## Prerequisites

- Atlassian MCP access is required for direct Jira issue creation.
- Without Jira write access, the skill can still draft issue content for manual creation.

## How to Use

- Load the skill (for example: `skill({ name: "jira-writer" })` or `$jira-writer`).
- Provide source inputs and intent:
  - issue type (`Epic`, `Spike`, `Story`, or `Bug`)
  - target project key
  - parent/epic behavior when relevant
  - optional priority, labels, components, assignee
- Review the generated draft.
- Explicitly confirm creation when ready.
- Capture the returned Jira key, URL, and recap.

## Safety and Quality Gates

- Do not create Jira issues before explicit confirmation.
- Keep routing metadata in Jira fields, not inside rendered description text.
- Verify post-create description structure per ADF contract.

## Files in This Skill

- `SKILL.md`
- `references/BUG_REPORT_TEMPLATE.md`
- `references/EPIC_TEMPLATE.md`
- `references/SPIKE_TEMPLATE.md`
- `references/USER_STORY_TEMPLATE.md`
