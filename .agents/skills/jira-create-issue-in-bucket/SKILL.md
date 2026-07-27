---
name: jira-create-issue-in-bucket
description: >
  Given a description of work, select the most appropriate KIT Bucket Epic and
  create a Jira issue as a child of that epic. Use when asked to "create a bucket
  issue", "file a maintenance ticket", "log a bug in KIT", "create a task in KIT",
  "add to the maintenance backlog", or when triaging work into the KIT project
  buckets. Routes to the jira-writer skill for actual issue creation.
metadata:
  version: '1.0.0'
---

# Jira Create Issue in Bucket

Routing layer that classifies work into the correct KIT Bucket Epic and delegates issue creation to the `jira-writer` skill with the parent and project pre-filled.

## Bucket Epics

| Key      | Summary                  | Use for                                                                     |
| -------- | ------------------------ | --------------------------------------------------------------------------- |
| KIT-4019 | Maintenance DXUI         | Customer support issues, bug fixes, incidents, ops work                     |
| KIT-5536 | Continuous Improvement   | Small refactors, process improvements, backlog cleanup, minor optimizations |
| KIT-5635 | Security Vulnerabilities | Security vulnerability remediation, dependency CVEs                         |
| KIT-4434 | Failing or flaky tests   | Flaky/failing test triage and fixes                                         |

## Issue type selection

Pick the type based on the nature of the work:

- **Bug** — Defects, broken behavior, customer-reported issues.
- **Story** — New incremental work that delivers value (small features, enhancements within a bucket).
- **Spike** — Investigation, research, or time-boxed exploration.

## Process

### 1) Classify the work

Analyze the user's description against the bucket table above. Match on:

- Keywords and domain (security → Snyk, flaky test → Failing tests, refactor → Continuous Improvement).
- Nature of work (support ticket → Maintenance).
- Urgency and origin (incident → Maintenance, CVE → Snyk).

If the classification is ambiguous (work could reasonably fit two buckets), ask the user which bucket they prefer and explain the trade-off.

### 2) Check for Feature Epic scope

If the work is clearly bounded delivery for a named Feature (a planned, multi-story initiative with its own epic), stop and tell the user:

> "This looks like Feature-level work rather than bucket work. You should parent it under the appropriate Feature Epic instead. This skill only handles bucket issues."

Do not proceed with issue creation in this case.

### 3) Determine issue type

Apply the issue type rules above. If uncertain between types, ask clarifying questions.

### 4) Delegate to jira-writer

Activate the `jira-writer` skill with the following pre-filled context:

- **Project:** KIT
- **Parent:** The selected Bucket Epic key (e.g., KIT-4019)
- **Issue type:** The determined type (Bug, Story, or Spike)

Let jira-writer handle drafting, confirmation, creation, and verification per its own process.

### 5) Confirm result

After jira-writer completes, echo the created issue key and the bucket it was filed under.

## Constraints

- Never create Features or Epics through this skill — only child issue types (Bug, Story, Spike).
- Always set the parent field to the selected Bucket Epic key.
- Project is always KIT — do not ask the user for a project.
- Do not override jira-writer's confirmation gate — the user must still approve the draft before creation.
