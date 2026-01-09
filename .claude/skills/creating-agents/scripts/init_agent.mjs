#!/usr/bin/env node
/**
 * Agent Initializer - Creates a new agent file with template content
 *
 * Usage:
 *     node init_agent.mjs <agent-name>
 *     node init_agent.mjs <agent-name> --path .github/agents
 *
 * Example:
 *     node init_agent.mjs code-review
 *     # Creates: .github/agents/code-review-v1.agent.md
 *     # Creates: .github/agents/examples/code-review-examples.md
 */

import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {parseArgs} from 'node:util';

function toPascalCase(name) {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function createAgentFile(name, outputPath) {
  const pascalName = toPascalCase(name);

  const content = `---
name: ${pascalName}V1
description: '[TODO: What this agent does AND when to use it. Example: "Generates unit tests for Atomic components. Use when creating tests or adding test coverage."]'
tools: ['codebase', 'search', 'usages', 'edit/editFiles', 'new', 'runCommands', 'problems', 'changes']
argument-hint: '[TODO: Hint text for users, e.g., "Describe the component to test"]'
---

# ${pascalName} Agent

[TODO: Brief description of what this agent does autonomously.]

## Workflow

### Step 1: Analysis

[TODO: What the agent analyzes first - inputs, context, constraints.]

### Step 2: Execution

[TODO: What actions the agent takes - file creation, modifications, commands.]

### Step 3: Validation

[TODO: How the agent verifies its work - tests, linting, manual checks.]

### Step 4: Output

[TODO: What the agent produces - files, PRs, comments, reports.]

## Quality Checklist

Before completing, verify:
- [ ] [TODO: Validation criterion 1]
- [ ] [TODO: Validation criterion 2]
- [ ] [TODO: Validation criterion 3]
`;

  const filepath = join(outputPath, `${name}-v1.agent.md`);
  const dir = dirname(filepath);

  if (!existsSync(dir)) {
    mkdirSync(dir, {recursive: true});
  }

  writeFileSync(filepath, content);
  return filepath;
}

function createExamplesFile(name, outputPath) {
  const pascalName = toPascalCase(name);

  const content = `# ${pascalName} Agent Test Scenarios

Validation scenarios for the ${pascalName}V1 agent.

---

## Scenario 1: Happy Path

### Input

TODO: Clear, complete user request.

### Expected Behavior

TODO: What the agent should do step by step.

### Expected Output

TODO: What the agent should produce.

### Validation Checklist

- [ ] TODO: Specific behavior verified
- [ ] TODO: Output format correct
- [ ] TODO: Quality criteria met

---

## Scenario 2: Ambiguous Input

### Input

TODO: Vague or incomplete user request.

### Expected Behavior

TODO: How agent should handle ambiguity (ask for clarification, make assumptions, etc.)

### Expected Output

TODO: Clarification request or best-effort output.

### Validation Checklist

- [ ] TODO: Ambiguity handled appropriately
- [ ] TODO: User guided toward clarity

---

## Scenario 3: Error Case

### Input

TODO: Invalid input or edge case.

### Expected Behavior

TODO: How agent should handle the error.

### Expected Output

TODO: Error message or graceful degradation.

### Validation Checklist

- [ ] TODO: Error handled gracefully
- [ ] TODO: User informed of issue
- [ ] TODO: No partial/broken output
`;

  const examplesDir = join(outputPath, 'examples');
  if (!existsSync(examplesDir)) {
    mkdirSync(examplesDir, {recursive: true});
  }

  const filepath = join(examplesDir, `${name}-examples.md`);
  writeFileSync(filepath, content);
  return filepath;
}

function main() {
  const {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      path: {
        type: 'string',
        default: '.github/agents',
      },
    },
  });

  if (positionals.length === 0) {
    console.log('Usage: node init_agent.mjs <agent-name> [--path <path>]');
    console.log('');
    console.log('Example:');
    console.log('  node init_agent.mjs code-review');
    console.log('  # Creates: .github/agents/code-review-v1.agent.md');
    console.log('  # Creates: .github/agents/examples/code-review-examples.md');
    process.exit(1);
  }

  const name = positionals[0].toLowerCase().replace(/_/g, '-');

  // Validate name
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.log(
      '❌ Error: Name must be kebab-case (letters, numbers, hyphens)'
    );
    process.exit(1);
  }

  console.log(`🚀 Initializing agent: ${name}`);
  console.log(`   Location: ${values.path}`);
  console.log('');

  // Create files
  const agentPath = createAgentFile(name, values.path);
  console.log(`✅ Created agent file: ${agentPath}`);

  const examplesPath = createExamplesFile(name, values.path);
  console.log(`✅ Created examples file: ${examplesPath}`);

  console.log('');
  console.log(`✅ Agent '${name}' initialized successfully!`);
  console.log('');
  console.log('Next steps:');
  console.log(`1. Edit ${agentPath} to complete the TODO items`);
  console.log(`2. Edit ${examplesPath} to add test scenarios`);
  console.log(
    `3. Validate: node .github/skills/creating-agents/scripts/validate_agent.mjs ${agentPath}`
  );
}

main();
