#!/usr/bin/env node
/**
 * Validates the creating-stories skill structure and content.
 *
 * Usage:
 *   node .claude/skills/creating-stories/scripts/validate_skill.mjs
 */

import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
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

function parseFrontmatterManual(content) {
  if (!content.startsWith('---')) {
    return {frontmatter: null, error: 'No YAML frontmatter found'};
  }

  const lines = content.split('\n');
  let endIdx = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }

  if (endIdx === null) {
    return {
      frontmatter: null,
      error: 'Invalid frontmatter format (no closing ---)',
    };
  }

  const frontmatter = {};
  let currentKey = null;
  let currentValue = [];

  for (let i = 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (match) {
      if (currentKey) {
        frontmatter[currentKey] = currentValue.join('\n').trim();
      }

      currentKey = match[1];
      currentValue = match[2] ? [match[2]] : [];
      continue;
    }

    if (currentKey && line.startsWith('  ')) {
      currentValue.push(line.trim());
    }
  }

  if (currentKey) {
    frontmatter[currentKey] = currentValue.join('\n').trim();
  }

  return {frontmatter, error: null, endLine: endIdx + 1};
}

console.log('🔍 Validating creating-stories skill...\n');

const skillMdPath = join(skillDir, 'SKILL.md');
if (!existsSync(skillMdPath)) {
  error('SKILL.md not found');
  process.exit(1);
}

const skillContent = readFileSync(skillMdPath, 'utf8');
const {
  frontmatter,
  error: frontmatterError,
  endLine,
} = parseFrontmatterManual(skillContent);

if (frontmatterError || !frontmatter) {
  error(frontmatterError ?? 'SKILL.md missing frontmatter');
  process.exit(1);
}

const body = skillContent
  .split('\n')
  .slice(endLine ?? 0)
  .join('\n')
  .trim();

const ALLOWED_PROPERTIES = new Set([
  'name',
  'description',
  'license',
  'allowed-tools',
  'metadata',
  'compatibility',
]);

const unexpectedKeys = Object.keys(frontmatter).filter(
  (k) => !ALLOWED_PROPERTIES.has(k)
);
if (unexpectedKeys.length > 0) {
  error(
    `Unexpected key(s) in frontmatter: ${unexpectedKeys.sort().join(', ')}. Allowed: ${[...ALLOWED_PROPERTIES].sort().join(', ')}`
  );
}

if (!('name' in frontmatter)) {
  error("Missing required 'name' field in frontmatter");
}

if (!('description' in frontmatter)) {
  error("Missing required 'description' field in frontmatter");
}

if (typeof frontmatter.name === 'string') {
  const name = frontmatter.name.trim();
  if (!name) {
    error('Name cannot be empty');
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    error(
      `Name '${name}' must use only lowercase letters, numbers, and hyphens (no uppercase, underscores, or special characters)`
    );
  }

  if (name.startsWith('-') || name.endsWith('-')) {
    error(`Name '${name}' cannot start or end with a hyphen`);
  }

  if (name.includes('--')) {
    error(`Name '${name}' cannot contain consecutive hyphens (--)`);
  }

  if (name.length > 64) {
    error(
      `Name is too long (${name.length} characters). Maximum is 64 characters.`
    );
  }

  if (name !== basename(skillDir)) {
    error(`Name '${name}' must match directory name '${basename(skillDir)}'`);
  } else {
    info('Name matches directory');
  }
} else if ('name' in frontmatter) {
  error(`Name must be a string, got ${typeof frontmatter.name}`);
}

if (typeof frontmatter.description === 'string') {
  const description = frontmatter.description.trim();
  if (!description) {
    error('Description cannot be empty');
  }

  if (description.includes('<') || description.includes('>')) {
    error('Description cannot contain XML tags (< or >)');
  }

  if (description.length > 1024) {
    error(
      `Description is too long (${description.length} characters). Maximum is 1024 characters.`
    );
  }

  if (description.includes('[TODO')) {
    error('Description contains [TODO] placeholder - please complete it');
  }

  if (!description.toLowerCase().includes('use when')) {
    warn('Description should include "Use when" trigger keywords');
  }
} else if ('description' in frontmatter) {
  error(`Description must be a string, got ${typeof frontmatter.description}`);
}

const bodyLines = body.split('\n').length;
if (bodyLines > 500) {
  warn(`SKILL.md body is ${bodyLines} lines (recommended max: 500)`);
} else {
  info(`Body length acceptable (${bodyLines} lines)`);
}

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

function findGitkeepFiles(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      findGitkeepFiles(fullPath);
      continue;
    }

    if (file === '.gitkeep') {
      warn(`Found .gitkeep file at ${fullPath.replace(skillDir, '')}`);
    }
  }
}

findGitkeepFiles(skillDir);

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

console.log(`\n${'='.repeat(50)}`);
if (hasErrors) {
  console.log('❌ Validation failed with errors');
  process.exit(1);
}

if (hasWarnings) {
  console.log('⚠️  Validation passed with warnings');
  process.exit(0);
}

console.log('✅ Skill is valid!');
process.exit(0);
