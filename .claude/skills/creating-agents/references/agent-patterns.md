# Agent Patterns

Patterns for creating VS Code Copilot agents in ui-kit.

## Pattern 1: Orchestrator (Skill-Oriented)

For agents that act as a **single conversational orchestrator** (one agent persona) while delegating repeatable procedures and domain playbooks to **skills**.

Use this when a single persona can own the experience end-to-end, but the domain has many specialized capabilities that should remain reusable and centrally maintained.

<example name="orchestrator">
---
name: my-orchestrator
description: Orchestrates [domain] tasks by analyzing requests and delegating to specialized skills.
tools: [changes, codebase]
---

# [Name] Orchestrator

You orchestrate [domain] tasks by:
1. Analyzing what the user wants
2. Determining the right approach
3. Delegating to specialized skills

## Decision Tree

1. **Is it X?** → Use skill-a
2. **Is it Y?** → Use skill-b
3. **Unclear?** → Ask clarifying question
</example>

**When to use:** Complex domains with multiple specialized skills where one persona can own execution.

**Prefer handing off to other agents instead of skills when:**
- Different personas are required (e.g., planner vs implementer vs reviewer)
- Different tool permissions are required (e.g., read-only review vs file edits)
- You want explicit, user-visible stage transitions

## Pattern 2: Autonomous Worker

For agents that execute complete workflows without user interaction.

<example name="autonomous-worker">
---
name: task-executor-v1
description: Autonomously executes [task] from start to finish.
tools: [changes, codebase, terminalLastCommand, githubRepo]
---

# [Task] Executor

You are an autonomous agent that executes [task] without requiring user input.

## Workflow

1. **Parse** - Extract requirements from issue/request
2. **Analyze** - Understand context and constraints
3. **Execute** - Take actions (create files, run commands)
4. **Validate** - Verify success (tests pass, linting clean)
5. **Deliver** - Present results (PR, comment)

## Quality Checklist

- [ ] [Requirement 1]
- [ ] [Requirement 2]
</example>

**When to use:** End-to-end automation triggered by GitHub events.

## Pattern 3: Diagnostic

For agents that troubleshoot problems through investigation.

<example name="diagnostic">
---
name: debugger-v1
description: Diagnoses [type] issues through systematic investigation.
tools: [codebase, terminalLastCommand]
---

# [Type] Debugger

## Diagnostic Stages

1. **Symptom Collection** - Error messages, when it occurs, recent changes
2. **Hypothesis Generation** - 2-3 likely causes based on symptoms
3. **Investigation** - Gather evidence to confirm/deny each hypothesis
4. **Root Cause** - Determine actual cause from evidence
5. **Solution** - Propose fix with implementation steps
</example>

**When to use:** Troubleshooting, debugging, issue triage.

## Pattern 4: Handoff Coordinator (Agent-Oriented)

For agents that coordinate **multi-agent workflows** by transitioning to other specialized agents.

Use this when the work benefits from clear separation of personas, responsibilities, and tool permissions (e.g., plan → implement → review).

<example name="handoff">
---
name: coordinator-v1
description: Coordinates complex tasks, handing off to specialists as needed.
tools: [changes, codebase]
handoffs:
  - label: Specialist A
    agent: specialist-a
    prompt: Handle the A portion of this task.
    send: false
  - label: Specialist B
    agent: specialist-b
    prompt: Handle the B portion of this task.
    send: false
---

# [Domain] Coordinator

## When to Hand Off

**To specialist-a:** [Trigger conditions]
**To specialist-b:** [Trigger conditions]

## When to Handle Yourself

- Simple cases
- Cases not matching any specialist
</example>

**When to use:** Complex workflows requiring different expertise areas, stages, or tool boundaries.

**Note:** Non-orchestrator agents may also include handoffs for stage transitions (e.g., planner → implementer) even if they are not acting as a general coordinator.

## Tool Selection Guide

To avoid duplicating tool documentation, this file intentionally keeps tool guidance lightweight.

For the canonical tool list and usage guidance, refer to:
- `.claude/skills/creating-agents/references/SPECIFICATION.md`
- Official VS Code tool list: https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features#_chat-tools

## Behavioral Directives

Use these XML-wrapped directives in agent bodies to control behavior:

**Proactive (default to action):**
```xml
<default_to_action>
Implement changes rather than only suggesting them. If intent is unclear, 
infer the most useful action and proceed.
</default_to_action>
```

**Conservative (default to research):**
```xml
<conservative_action>
Do not change files unless clearly instructed. Default to providing 
information and recommendations rather than taking action.
</conservative_action>
```

**Parallel tool usage:**
```xml
<tool_usage>
When operations are independent, call tools in parallel. When tool calls 
depend on previous results, call them sequentially.
</tool_usage>
```

## Long-Running Task Patterns

For tasks spanning multiple context windows:

**Progress tracking:**
```
// progress.txt
Session N:
- Completed: [what was done]
- Next: [what to do next]
- Blockers: [issues discovered]
```

**Session handoff:**
1. Run `pwd` to confirm working directory
2. Review progress.txt and state files
3. Check git log for recent changes
4. Resume from documented next step

**Self-verification:**
1. Run test suite
2. Run linting/formatting
3. Review changes with `git diff`
