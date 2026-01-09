# VS Code Copilot Custom Agent Specification

Based on [VS Code Copilot Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents).

## Overview

Custom agents enable you to configure AI to adopt **specialized personas** tailored to specific development roles and tasks. Each persona can have its own behavior, available tools, and instructions.

**Key characteristics:**
- User-invoked (manual switch to persona)
- Tool control (restrict available capabilities per role)
- Handoffs (guided workflows between agents)
- Reusable across background agents and cloud agents

## File Structure

An agent is a single Markdown file with YAML frontmatter:

```
.github/agents/
└── agent-name-v1.agent.md    # kebab-case with version
```

## File Format

### Frontmatter (Required)

```yaml
---
description: 'Brief description of agent role and purpose'
tools: ['search', 'editFiles']
handoffs:
  - label: Next Step
    agent: target-agent
    prompt: Continue with implementation
    send: false
---
```

### Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `description` | Yes | Agent's role and purpose | `'Generate implementation plan'` |
| `tools` | Optional | Available tools for this agent | `['search', 'fetch']` |
| `handoffs` | Optional | Transitions to other agents | See Handoffs section |
| `argument-hint` | Optional | Placeholder in chat input | `'Describe what to plan'` |
| `model` | Optional | Specific model (omit for user choice) | `'claude-sonnet-4'` |

### Tool Control

Restrict which tools an agent can use to enforce role boundaries:

```yaml
# Read-only planner
tools: ['search', 'codebase']

# Implementation agent
tools: ['codebase', 'editFiles', 'search']

# Full access
tools: ['codebase', 'editFiles', 'search', 'runCommands', 'new']
```

**Available tools:**
- `search` - Search files and content
- `codebase` - Understand code structure
- `editFiles` / `changes` - Modify existing files
- `new` - Create new files
- `runCommands` / `terminalLastCommand` - Execute shell commands
- `fetch` - HTTP requests
- `githubRepo` - GitHub operations

**Why tool control?**
- Enforces role boundaries (planner shouldn't edit files)
- Prevents unintended side effects
- Makes agent purpose explicit

### Handoffs

Handoffs enable **guided sequential workflows** between agents:

```yaml
handoffs:
  - label: Start Implementation
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false
  - label: Review Code
    agent: reviewer
    prompt: Review the implementation for quality and security.
    send: true
```

**Handoff fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `label` | Yes | Button text shown to user |
| `agent` | Yes | Target agent to switch to |
| `prompt` | Yes | Pre-filled message for target agent |
| `send` | No | Auto-send prompt (default: false) |

**When handoff button clicked:**
- User switches to target agent
- Chat input is pre-filled with `prompt`
- If `send: true`, prompt is auto-submitted

**Use cases:**
- Planning → Implementation → Review (multi-step workflow)
- Security review → Fix issues → Re-review (iterative improvement)
- Research → Documentation → Code generation (sequential stages)

## Agent Body Structure

```markdown
---
description: 'Agent role and purpose'
tools: ['search', 'codebase']
---

# Agent Name

You are [specific persona] for the Coveo ui-kit monorepo.

## Workflow

1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

## Output Format

[Expected output structure]

## Quality Checklist

- [ ] [Verification check 1]
- [ ] [Verification check 2]
```

### Body Guidelines

**DO:**
- Define clear persona ("You are a planner", "You are a security reviewer")
- Use numbered workflow steps
- Include validation checklist
- Reference relevant instruction files
- Specify output format

**DON'T:**
- Duplicate content from instruction files (reference them instead)
- Create overly generic personas
- Mix multiple roles in one agent
- Omit tool restrictions when role-specific

## Naming Conventions

### File Names

Use kebab-case with version suffix:

**Good examples:**
- `planner-v1.agent.md`
- `security-reviewer-v1.agent.md`
- `test-generator-v1.agent.md`
- `migration-assistant-v2.agent.md`

**Avoid:**
- `agent.agent.md` (too generic)
- `helper-v1.agent.md` (unclear purpose)
- `PlannerV1.agent.md` (use kebab-case)

### Agent Names

Use descriptive names that indicate role:

```yaml
# Clear persona
description: 'Planning agent that analyzes requirements and creates implementation plans'

# Too vague
description: 'Helper for tasks'
```

## Personas and Roles

**Effective personas:**
- Planner (read-only, creates plans)
- Implementer (full access, writes code)
- Reviewer (read-only, provides feedback)
- Security Auditor (read-only, finds vulnerabilities)
- Test Generator (creates tests, limited file access)

**Why personas matter:**
- Sets clear expectations for user
- Guides agent behavior
- Enables role-specific tool restrictions
- Facilitates handoffs between specialists

## Versioning

Use version suffix for major changes:

```
planner-v1.agent.md  # Initial version
planner-v2.agent.md  # Breaking changes, new workflow
```

**When to version:**
- Significant workflow changes
- Different tool requirements
- Incompatible with previous behavior

**Migration:**
1. Create v2 file
2. Keep v1 functional during transition
3. Deprecate v1 after adoption

## Agent Discovery

Agents are discovered in:
- `.github/agents/` (workspace-level)
- User profile directory (user-level)

**Description field is critical:**
- Used for agent selection
- Shown in agent list
- Should clearly state what + when

## Integration with Instructions

Agents automatically receive relevant instructions based on file patterns:

```markdown
## Context

Follow conventions in:
- [Atomic components](../.github/instructions/atomic.instructions.md)
- [Testing patterns](../.github/instructions/tests-atomic.instructions.md)

## Workflow

1. Read component requirements
2. Generate component following Atomic conventions...
```

**Instructions are auto-applied** - agents don't need to load them explicitly.

## Validation

Validate agents using:

```bash
node .github/skills/creating-agents/scripts/validate_agent.mjs .github/agents/{name}-v1.agent.md
```

**Validation checks:**
- [ ] File ends with `-v{N}.agent.md`
- [ ] Valid YAML frontmatter
- [ ] Required `description` field present
- [ ] Kebab-case file naming
- [ ] Clear persona definition
- [ ] Workflow steps included
- [ ] Quality checklist present

## References

- **Official VS Code Docs:** https://code.visualstudio.com/docs/copilot/customization/custom-agents
- **Handoffs Guide:** Enables multi-agent workflows with context passing
- **Tool Control:** Enforces role boundaries and prevents unintended actions
