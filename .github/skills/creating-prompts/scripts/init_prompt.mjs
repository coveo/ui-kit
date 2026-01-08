#!/usr/bin/env node
/**
 * Prompt Initializer - Creates a new prompt file with template content
 *
 * Usage:
 *     node init_prompt.mjs <prompt-name>
 *     node init_prompt.mjs <prompt-name> --path .github/prompts
 *
 * Example:
 *     node init_prompt.mjs generate-tests
 *     # Creates: .github/prompts/generate-tests.prompt.md
 */

import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {parseArgs} from 'node:util';

function createPromptFile(name, outputPath) {
  // Convert to title case for display
  const title = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const content = `---
agent: 'agent'
tools: ['codebase', 'search', 'editFiles']
---

# ${title}

TODO: Brief description of what this prompt does.

## Context

- Repository: coveo/ui-kit monorepo
- Package: TODO: specify package
- Standards: TODO: reference relevant .github/instructions/ files

## Task

TODO: Describe the task. Use \`{{placeholder}}\` for user-provided values.

## Requirements

1. TODO: Requirement 1
2. TODO: Requirement 2
3. TODO: Requirement 3

## Output Format

TODO: Describe expected output structure.

## Validation

Before completing, verify:
- [ ] TODO: Check 1
- [ ] TODO: Check 2
- [ ] TODO: Check 3
`;

  const filepath = join(outputPath, `${name}.prompt.md`);
  const dir = dirname(filepath);

  if (!existsSync(dir)) {
    mkdirSync(dir, {recursive: true});
  }

  writeFileSync(filepath, content);
  return filepath;
}

function main() {
  const {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      path: {
        type: 'string',
        default: '.github/prompts',
      },
    },
  });

  if (positionals.length === 0) {
    console.log('Usage: node init_prompt.mjs <prompt-name> [--path <path>]');
    console.log('');
    console.log('Example:');
    console.log('  node init_prompt.mjs generate-tests');
    console.log('  # Creates: .github/prompts/generate-tests.prompt.md');
    process.exit(1);
  }

  let name = positionals[0].toLowerCase().replace(/_/g, '-');

  // Remove .prompt.md if included
  name = name.replace('.prompt.md', '').replace('.prompt', '');

  // Validate name
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.log(
      '❌ Error: Name must be kebab-case (letters, numbers, hyphens)'
    );
    process.exit(1);
  }

  console.log(`🚀 Initializing prompt: ${name}`);
  console.log(`   Location: ${values.path}`);
  console.log('');

  // Create file
  const promptPath = createPromptFile(name, values.path);
  console.log(`✅ Created prompt file: ${promptPath}`);

  console.log('');
  console.log(`✅ Prompt '${name}' initialized successfully!`);
  console.log('');
  console.log('Next steps:');
  console.log(`1. Edit ${promptPath} to complete the TODO items`);
  console.log(
    `2. Validate: node .github/skills/creating-prompts/scripts/validate_prompt.mjs ${promptPath}`
  );
}

main();
