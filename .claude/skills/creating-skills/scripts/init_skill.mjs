#!/usr/bin/env node
/**
 * Skill Initializer - Creates a new skill directory with template files
 *
 * Usage:
 *     node init_skill.mjs <skill-name> --path <output-directory>
 *
 * Example:
 *     node init_skill.mjs generate-vitest-tests --path .claude/skills
 *     node init_skill.mjs accessibility-audit --path .claude/skills
 */

import {chmodSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {parseArgs} from 'node:util';

function titleCaseSkillName(skillName) {
  return skillName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSkillTemplate(skillName, skillTitle) {
  return `---
name: ${skillName}
description: [TODO: What this skill does AND when to use it. Third person. Include trigger keywords. Example - "Generates Vitest unit tests for Atomic components. Use when creating tests, adding test coverage, or when user mentions testing Lit components."]
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# ${skillTitle}

## Process

### Step 1: [TODO: First Action]

[TODO: Clear, actionable instructions for step 1]

### Step 2: [TODO: Second Action]

[TODO: Clear, actionable instructions for step 2]

## Scripts Available

| Script | Purpose | Usage |
|--------|---------|-------|
| \`example.mjs\` | [TODO: Description or delete row] | \`node scripts/example.mjs [args]\` |

Scripts solve deterministic problems - prefer running scripts over asking the agent to generate code.

## Reference Files

- [Reference Guide](references/reference.md) - [TODO: When to load this, or delete if not needed]

Keep file references one level deep from SKILL.md.

## ui-kit Specific Notes

[TODO: Add any ui-kit specific considerations, or delete this section]

- Package: \`packages/[TODO: package-name]\`
- Related components: [TODO: list or delete]
- Relevant instructions: \`.github/instructions/[TODO: relevant instruction files]\`

## Validation Checklist

Before completing, verify:
- [ ] [TODO: Quality criterion 1]
- [ ] [TODO: Quality criterion 2]
- [ ] [TODO: Quality criterion 3]
`;
}

function getExampleScript(skillName) {
  return `#!/usr/bin/env node
/**
 * Example helper script for ${skillName}
 *
 * Scripts should solve deterministic problems. Prefer running scripts over
 * asking the agent to generate code. Include helpful error messages.
 *
 * Usage:
 *     node scripts/example.mjs [args]
 *     node scripts/example.mjs --help
 */

import {parseArgs} from 'node:util';

function main() {
  const {values} = parseArgs({
    options: {
      verbose: {
        type: 'boolean',
        short: 'v',
        default: false,
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
      },
    },
  });

  if (values.help) {
    console.log('Usage: node scripts/example.mjs [options]');
    console.log('');
    console.log('Options:');
    console.log('  -v, --verbose  Enable verbose output');
    console.log('  -h, --help     Show this help message');
    process.exit(0);
  }

  // TODO: Replace with actual script logic
  // Scripts should:
  // - Be self-contained or clearly document dependencies
  // - Include helpful, specific error messages
  // - Handle edge cases gracefully
  console.log(\`This is an example script for ${skillName}\`);
  console.log('Replace this with actual implementation or delete if not needed.');
}

main();
`;
}

function getExampleReference(skillTitle) {
  return `# Reference Documentation for ${skillTitle}

> This is a placeholder for detailed reference documentation.
> Replace with actual reference content or delete if not needed.

## Contents

- [Overview](#overview)
- [Patterns](#patterns)
- [Troubleshooting](#troubleshooting)

Keep this file focused - agents load references on demand, so smaller files mean less context usage.

## Overview

[TODO: Detailed overview of the domain or topic this reference covers]

## Patterns

### Pattern 1: [Name]

[TODO: Description and concrete examples - be specific, not abstract]

### Pattern 2: [Name]

[TODO: Description and concrete examples]

## Troubleshooting

### Common Issue 1

**Symptom**: [TODO: What the user sees]

**Cause**: [TODO: Why it happens]

**Fix**: [TODO: How to resolve - include specific commands or code]

### Common Issue 2

**Symptom**: [TODO: What the user sees]

**Cause**: [TODO: Why it happens]

**Fix**: [TODO: How to resolve]
`;
}

function initSkill(skillName, path) {
  const skillDir = resolve(path, skillName);

  // Check if directory already exists
  if (existsSync(skillDir)) {
    console.log(`❌ Error: Skill directory already exists: ${skillDir}`);
    return null;
  }

  // Create skill directory
  try {
    mkdirSync(skillDir, {recursive: true});
    console.log(`✅ Created skill directory: ${skillDir}`);
  } catch (error) {
    console.log(`❌ Error creating directory: ${error.message}`);
    return null;
  }

  // Create SKILL.md from template
  const skillTitle = titleCaseSkillName(skillName);
  const skillContent = getSkillTemplate(skillName, skillTitle);

  const skillMdPath = join(skillDir, 'SKILL.md');
  try {
    writeFileSync(skillMdPath, skillContent);
    console.log('✅ Created SKILL.md');
  } catch (error) {
    console.log(`❌ Error creating SKILL.md: ${error.message}`);
    return null;
  }

  // Create resource directories with example files
  try {
    // Create scripts/ directory with example script
    const scriptsDir = join(skillDir, 'scripts');
    mkdirSync(scriptsDir, {recursive: true});
    const exampleScriptPath = join(scriptsDir, 'example.mjs');
    writeFileSync(exampleScriptPath, getExampleScript(skillName));
    chmodSync(exampleScriptPath, 0o755);
    console.log('✅ Created scripts/example.mjs');

    // Create references/ directory with example reference doc
    const referencesDir = join(skillDir, 'references');
    mkdirSync(referencesDir, {recursive: true});
    const exampleRefPath = join(referencesDir, 'reference.md');
    writeFileSync(exampleRefPath, getExampleReference(skillTitle));
    console.log('✅ Created references/reference.md');

    // Create assets/ directory (empty, with .gitkeep)
    const assetsDir = join(skillDir, 'assets');
    mkdirSync(assetsDir, {recursive: true});
    writeFileSync(join(assetsDir, '.gitkeep'), '');
    console.log('✅ Created assets/ directory');
  } catch (error) {
    console.log(`❌ Error creating resource directories: ${error.message}`);
    return null;
  }

  // Print next steps
  console.log('');
  console.log(
    `✅ Skill '${skillName}' initialized successfully at ${skillDir}`
  );
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit SKILL.md to complete the TODO items');
  console.log(
    '2. Customize or delete example files in scripts/, references/, assets/'
  );
  console.log(
    `3. Run validation: node ${path}/creating-skills/scripts/quick_validate.mjs ${skillDir}`
  );

  return skillDir;
}

function main() {
  const {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      path: {
        type: 'string',
      },
    },
  });

  if (positionals.length === 0 || !values.path) {
    console.log('Usage: node init_skill.mjs <skill-name> --path <path>');
    console.log('');
    console.log('Skill name requirements:');
    console.log("  - Hyphen-case identifier (e.g., 'generate-vitest-tests')");
    console.log('  - Lowercase letters, digits, and hyphens only');
    console.log('  - Max 64 characters');
    console.log('  - Must match directory name exactly');
    console.log('');
    console.log('Path options:');
    console.log(
      '  - .claude/skills (workspace-level, recommended for local dev)'
    );
    console.log('  - .skills or skills/ (alternative workspace conventions)');
    console.log('  - ~/.claude/skills (user-level)');
    console.log('');
    console.log('Examples:');
    console.log(
      '  node init_skill.mjs generate-vitest-tests --path .claude/skills'
    );
    console.log(
      '  node init_skill.mjs accessibility-audit --path .claude/skills'
    );
    console.log(
      '  node init_skill.mjs stencil-to-lit-migration --path .skills'
    );
    process.exit(1);
  }

  const skillName = positionals[0];

  console.log(`🚀 Initializing skill: ${skillName}`);
  console.log(`   Location: ${values.path}`);
  console.log('');

  const result = initSkill(skillName, values.path);

  if (result) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
