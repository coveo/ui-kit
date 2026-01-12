#!/usr/bin/env node

/**
 * Validates the creating-stories skill structure and content.
 *
 * Usage:
 *   node scripts/validate_skill.mjs
 */

import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const skillDir = resolve(__dirname, '..');

let hasErrors = false;
let hasWarnings = false;

function error(message) {
  console.error(`❌ Error: ${message}`);
  hasErrors = true;
}

function warn(message) {
  console.warn(`⚠️  Warning: ${message}`);
  hasWarnings = true;
}

function info(message) {
  console.log(`✓ ${message}`);
}

console.log('🔍 Validating creating-stories skill...\n');

// Check SKILL.md exists
const skillMdPath = join(skillDir, 'SKILL.md');
if (!existsSync(skillMdPath)) {
  error('SKILL.md not found');
  process.exit(1);
}

// Parse and validate SKILL.md
const skillContent = readFileSync(skillMdPath, 'utf8');
const frontmatterMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);

if (!frontmatterMatch) {
  error('SKILL.md missing frontmatter');
  process.exit(1);
}

const frontmatter = frontmatterMatch[1];
const body = skillContent.slice(frontmatterMatch[0].length).trim();

// Check required frontmatter fields
const requiredFields = ['name', 'description'];
for (const field of requiredFields) {
  if (!frontmatter.includes(`${field}:`)) {
    error(`Missing required frontmatter field: ${field}`);
  }
}

// Check name matches directory
if (frontmatter.includes('name:')) {
  const nameMatch = frontmatter.match(/name:\s*(\S+)/);
  if (nameMatch && nameMatch[1] !== 'creating-stories') {
    error(
      `Name in frontmatter (${nameMatch[1]}) doesn't match directory name (creating-stories)`
    );
  } else {
    info('Name matches directory');
  }
}

// Check description quality
if (frontmatter.includes('description:')) {
  const descMatch = frontmatter.match(/description:\s*(.+)/);
  if (descMatch) {
    const desc = descMatch[1];
    if (desc.length < 50) {
      warn('Description is quite short (< 50 chars)');
    }
    if (!desc.toLowerCase().includes('use when')) {
      warn('Description should include "Use when" trigger keywords');
    }
    info('Description present');
  }
}

// Check body length
const bodyLines = body.split('\n').length;
if (bodyLines > 500) {
  warn(`SKILL.md body is ${bodyLines} lines (recommended max: 500)`);
} else {
  info(`Body length acceptable (${bodyLines} lines)`);
}

// Check for required directories and files
const requiredPaths = [
  'scripts',
  'references',
  'assets',
  'scripts/generate-story-template.mjs',
  'assets/component.new.stories.tsx.hbs',
  'assets/result-component.new.stories.tsx.hbs',
  'assets/page.new.stories.tsx.hbs',
];

for (const path of requiredPaths) {
  const fullPath = join(skillDir, path);
  if (!existsSync(fullPath)) {
    error(`Required path missing: ${path}`);
  } else {
    info(`Found ${path}`);
  }
}

// Check for .gitkeep files (should be removed)
function findGitkeepFiles(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      findGitkeepFiles(fullPath);
    } else if (file === '.gitkeep') {
      warn(`Found .gitkeep file at ${fullPath.replace(skillDir, '')}`);
    }
  }
}

findGitkeepFiles(skillDir);

// Check scripts are executable
const scriptsDir = join(skillDir, 'scripts');
if (existsSync(scriptsDir)) {
  const scripts = readdirSync(scriptsDir).filter((f) => f.endsWith('.mjs'));
  for (const script of scripts) {
    const scriptPath = join(scriptsDir, script);
    const content = readFileSync(scriptPath, 'utf8');
    if (!content.startsWith('#!/usr/bin/env node')) {
      warn(`Script ${script} missing shebang`);
    }
  }
}

// Check reference files exist and are referenced in SKILL.md
const referencesDir = join(skillDir, 'references');
if (existsSync(referencesDir)) {
  const referenceFiles = readdirSync(referencesDir).filter((f) =>
    f.endsWith('.md')
  );
  for (const refFile of referenceFiles) {
    if (!skillContent.includes(refFile)) {
      warn(`Reference file ${refFile} not referenced in SKILL.md`);
    }
  }
}

// Summary
console.log(`\n${'='.repeat(50)}`);
if (hasErrors) {
  console.log('❌ Validation failed with errors');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Validation passed with warnings');
  process.exit(0);
} else {
  console.log('✅ Skill is valid!');
  process.exit(0);
}
