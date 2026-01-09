#!/usr/bin/env node
/**
 * Initialize a new VS Code Copilot instruction file.
 *
 * Usage:
 *     node init_instruction.mjs <name>
 *     node init_instruction.mjs <name> --apply-to "glob-pattern"
 *     node init_instruction.mjs <name> --path .github/instructions
 *
 * Example:
 *     node init_instruction.mjs my-feature
 *     # Creates: .github/instructions/my-feature.instructions.md
 */

import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseArgs} from 'node:util';

function toTitleCase(name) {
  return name
    .replace(/\./g, ' ')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createInstruction(name, applyTo, outputPath) {
  const fileName = `${name}.instructions.md`;
  const filePath = join(outputPath, fileName);

  if (existsSync(filePath)) {
    console.log(`❌ Error: ${filePath} already exists`);
    process.exit(1);
  }

  const title = toTitleCase(name);

  const template = `---
applyTo: '${applyTo}'
---

# ${title}

<!-- TODO: Add primary rule or context -->

## Overview

<!-- TODO: Describe what this instruction covers -->

## Guidelines

<!-- TODO: Add specific guidance -->

### [Topic 1]

<!-- TODO: Add topic-specific rules -->

### [Topic 2]

<!-- TODO: Add topic-specific rules -->

## Examples

<!-- TODO: Add concrete examples -->

\`\`\`typescript
// TODO: Add code example
\`\`\`

## References

<!-- TODO: Link to related instructions or documentation -->
`;

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, {recursive: true});
  }

  writeFileSync(filePath, template);
  console.log(`✅ Created: ${filePath}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Edit ${filePath} to add content`);
  console.log('  2. Update the applyTo pattern if needed');
  console.log(
    `  3. Validate: node .github/skills/creating-instructions/scripts/validate_instruction.mjs ${filePath}`
  );
}

function main() {
  const {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      'apply-to': {
        type: 'string',
        default: '**',
      },
      path: {
        type: 'string',
        default: '.github/instructions',
      },
    },
  });

  if (positionals.length === 0) {
    console.log(
      'Usage: node init_instruction.mjs <name> [--apply-to <pattern>] [--path <dir>]'
    );
    console.log('');
    console.log('Example:');
    console.log('  node init_instruction.mjs my-feature');
    console.log('  # Creates: .github/instructions/my-feature.instructions.md');
    process.exit(1);
  }

  const name = positionals[0];

  // Validate name
  if (!/^[a-z0-9.-]+$/.test(name.replace(/-/g, ''))) {
    console.log(
      `❌ Error: Name must be alphanumeric with hyphens/dots only: ${name}`
    );
    process.exit(1);
  }

  createInstruction(name, values['apply-to'], values.path);
}

main();
