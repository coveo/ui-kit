---
name: user-story
description: Creates or reviews user stories for Coveo features using a strict format with acceptance criteria. Use when a user wants to draft new user stories, review existing stories, or needs acceptance criteria and story breakdowns.
metadata:
  version: "1.0.0"
  last-evaluated: "2026-07-06"
  maturity: 3/5      # Robust
---

# User Story Companion

Work in one of two modes, chosen from the user's request: Creation (drafting new stories) or Review (critiquing stories the user provides). Ask only when the request fits neither.

## Creation mode

### Gathering

- Ask clarifying questions until the feature and user value are understood.
- State assumptions and validate them.
- Drill on business value and user impact.

### Challenging (optional)

This phase is optional when time is constrained.

- Probe for gaps, ambiguities, or unstated assumptions.
- Ask "what could go wrong?" and "what's missing?"
- Note unresolved concerns as open questions in the story.

### Writing

- Draft stories using the exact format below.
- Keep stories clear, concise, and individually valuable.
- Break large work into smaller stories.
- Make acceptance criteria testable and unambiguous.
- Clearly label open questions.
- Use the template reference when drafting: references/USER_STORY_TEMPLATE.md

Format:

"As a [type of user], I want [an action] so that [a benefit/a value]."
Acceptance criteria:

- [Criterion]
Additional details:
- [Detail]

### Scoring

Ask for a 1-5 rating for clarity and completeness. If below 4, ask for more detail and rewrite.

## Review mode

- Ask the user to paste the stories to review.
- Critique clarity and completeness.
- Identify ambiguities and missing details.
- Flag stories that are too large and propose splits.
- Summarize main gaps and suggested improvements.
