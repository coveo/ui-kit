---
name: creating-agents
description: Creates GitHub Copilot custom agents as specialized personas with controlled tools and handoffs. Use when building role-based workflows (planner, reviewer, architect) or guided multi-agent sequences.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
  package: all
---

# Creating Agents

## Process

### Step 1: Plan the Agent

Before creating, answer:

1. What autonomous workflow does this agent perform?
2. What triggers should activate it? (GitHub events, user requests, etc.)
3. What tools does it need? (codebase, editFiles, runCommands, etc.)
4. What outputs does it produce? (files, PRs, comments, etc.)

### Step 2: Initialize

```bash
node .github/skills/creating-agents/scripts/init_agent.mjs <agent-name>
```

Creates: `{name}-v1.agent.md` and `examples/{name}-examples.md`

### Step 3: Complete the Agent

1. **Set frontmatter** - `description`, `tools`, `handoffs`
2. **Define persona** - Clear role (planner, reviewer, etc.)
3. **Write workflow** - Numbered steps the agent follows
4. **Add quality checklist** - Validation criteria before completing
5. **Create test scenarios** - At least 3 scenarios (happy path, ambiguous input, error case)

For format details, see [SPECIFICATION.md](references/SPECIFICATION.md).
For frontmatter fields, see [frontmatter-reference.md](references/frontmatter-reference.md).
For workflow patterns, see [agent-patterns.md](references/agent-patterns.md).
For coding patterns, see [agentic-coding.md](references/agentic-coding.md).

### Step 4: Validate

```bash
node .github/skills/creating-agents/scripts/validate_agent.mjs .github/agents/<name>-v1.agent.md
```

## Modifying Existing Agents

**Extending an agent:**
1. Read existing agent to understand current workflow
2. Add new steps/capabilities without breaking existing behavior
3. Update description if scope expanded
4. Add test scenarios for new functionality

**Versioning an agent:**
1. Create new file with incremented version: `{name}-v2.agent.md`
2. Keep old version functional during transition
3. Deprecate old version after migration

**Deprecating an agent:**
1. Add to description: "(Deprecated: use `replacement-agent` instead)"
2. Keep functional until dependents migrate
3. Delete only after confirming no references remain

## Reference Documentation

| Reference | When to Load |
|-----------|--------------|
| [SPECIFICATION.md](references/SPECIFICATION.md) | VS Code agent format, personas, tool control, handoffs |
| [frontmatter-reference.md](references/frontmatter-reference.md) | All frontmatter fields, tools list, handoff syntax |
| [agent-patterns.md](references/agent-patterns.md) | Orchestrator, worker, diagnostic, handoff patterns |
| [agentic-coding.md](references/agentic-coding.md) | Code exploration, solution quality, file management |

## Scripts

| Script | Purpose |
|--------|---------|
| `init_agent.mjs` | Initialize new agent with template |
| `validate_agent.mjs` | Validate agent structure and frontmatter |

## Validation Checklist

- [ ] Frontmatter has `name`, `description`, `tools`
- [ ] Name matches filename (PascalCase `AgentNameV1` for `agent-name-v1.agent.md`)
- [ ] Description includes trigger keywords
- [ ] Body has clear workflow sections
- [ ] Test scenarios file created with 3+ scenarios
