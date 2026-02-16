# VS Code Copilot Agent Frontmatter Reference

Complete reference for all supported frontmatter fields.

## Required Fields

### `name`

Agent identifier displayed in UI.

```yaml
name: my-agent-name
```

### `description`

Brief description of what the agent does. Used for discovery and help text.

```yaml
description: Generates unit tests for Atomic Lit components.
```

## Optional Fields

### `tools`

Array of VS Code tools the agent can use.

```yaml
tools:
  - changes      # Modify files
  - codebase     # Search and read code
  - terminalLastCommand  # Run terminal commands
  - githubRepo   # GitHub operations
  - fetch        # HTTP requests
```

### `argument-hint`

Placeholder text shown in the chat input.

```yaml
argument-hint: Describe the component you want to create
```

### `model`

Specify which AI model to use. **Omit this field to let users choose their preferred model.**

```yaml
model: claude-sonnet-4-20250514
```

Only specify when the agent requires specific model capabilities. Available models vary by VS Code configuration.

### `infer`

Enable automatic agent selection based on user input.

```yaml
infer: true
```

When enabled, VS Code may auto-select this agent based on the user's query.

### `target`

Specify the execution target.

```yaml
target: editor  # or 'terminal'
```

### `mcp-servers`

Connect to Model Context Protocol servers.

```yaml
mcp-servers:
  - server-name
```

### `handoffs`

Define transitions to other agents. Creates buttons in the chat UI for guided workflows.

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
| `agent` | Yes | Target agent name to switch to |
| `prompt` | Yes | Pre-filled message for target agent |
| `send` | No | Auto-send prompt (default: false) |

**Behavior:**
- When button clicked, user switches to target agent
- Chat input is pre-filled with `prompt` text
- If `send: true`, prompt is automatically submitted
- If `send: false` (default), user can edit before sending

**Use cases:**
- Planning → Implementation → Review (multi-step workflow)
- Security review → Fix issues → Re-review (iterative improvement)
- Research → Documentation → Code generation (sequential stages)

## Complete Example

```yaml
---
name: atomic-component-creator
description: Creates new Atomic Lit components with tests, stories, and documentation.
tools:
  - changes
  - codebase
  - terminalLastCommand
argument-hint: Describe the component you want to create (e.g., "a search filter dropdown")
handoffs:
  - label: Generate Tests
    agent: test-generator
    prompt: Generate comprehensive unit tests for the component created above.
    send: false
---
```

> **Note:** The `model` field is omitted to let users choose their preferred model. Only add it if your agent requires specific model capabilities.

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Versioned agents | `{name}-v{N}` | `migration-v1` |
| Specialized agents | `{domain}-{function}` | `atomic-creator` |
| Utility agents | `{action}-{target}` | `generate-tests` |

## Field Constraints

| Field | Max Length | Required |
|-------|------------|----------|
| `name` | ~64 chars | Yes |
| `description` | ~256 chars | Yes |
| `argument-hint` | ~128 chars | No |
| `tools` | No limit | No |
| `handoffs` | No limit | No |
