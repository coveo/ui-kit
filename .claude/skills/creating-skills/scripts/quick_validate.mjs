#!/usr/bin/env node
/**
 * Quick validation script for skills
 *
 * Usage:
 *     node quick_validate.mjs <skill_directory>
 *
 * Example:
 *     node quick_validate.mjs .claude/skills/my-skill
 */

import {existsSync, readFileSync, statSync} from 'node:fs';
import {basename, join} from 'node:path';

function parseFrontmatterManual(content) {
  if (!content.startsWith('---')) {
    return {frontmatter: null, error: 'No YAML frontmatter found'};
  }

  // Find closing ---
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

  // Parse simple key: value pairs
  const frontmatter = {};
  let currentKey = null;
  let currentValue = [];

  for (let i = 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }

    // Check for key: value
    const match = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (match) {
      // Save previous key if exists
      if (currentKey) {
        frontmatter[currentKey] = currentValue.join('\n').trim();
      }

      currentKey = match[1];
      currentValue = match[2] ? [match[2]] : [];
    } else if (currentKey && line.startsWith('  ')) {
      // Continuation of previous value
      currentValue.push(line.trim());
    }
  }

  // Save last key
  if (currentKey) {
    frontmatter[currentKey] = currentValue.join('\n').trim();
  }

  return {frontmatter, error: null};
}

export function validateSkill(skillPath) {
  // Check skill directory exists
  if (!existsSync(skillPath)) {
    return {valid: false, message: `Skill directory not found: ${skillPath}`};
  }

  if (!statSync(skillPath).isDirectory()) {
    return {valid: false, message: `Path is not a directory: ${skillPath}`};
  }

  // Check SKILL.md exists
  const skillMd = join(skillPath, 'SKILL.md');
  if (!existsSync(skillMd)) {
    return {valid: false, message: 'SKILL.md not found'};
  }

  // Read content
  const content = readFileSync(skillMd, 'utf-8');

  if (!content.startsWith('---')) {
    return {valid: false, message: 'No YAML frontmatter found'};
  }

  // Extract frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {valid: false, message: 'Invalid frontmatter format'};
  }

  // Parse YAML frontmatter
  const {frontmatter, error} = parseFrontmatterManual(`---\n${match[1]}\n---`);
  if (error) {
    return {valid: false, message: error};
  }

  // Define allowed properties
  const ALLOWED_PROPERTIES = new Set([
    'name',
    'description',
    'license',
    'allowed-tools',
    'metadata',
    'compatibility',
  ]);

  // Check for unexpected properties
  const unexpectedKeys = Object.keys(frontmatter).filter(
    (k) => !ALLOWED_PROPERTIES.has(k)
  );
  if (unexpectedKeys.length > 0) {
    return {
      valid: false,
      message:
        `Unexpected key(s) in frontmatter: ${unexpectedKeys.sort().join(', ')}. ` +
        `Allowed: ${[...ALLOWED_PROPERTIES].sort().join(', ')}`,
    };
  }

  // Check required fields
  if (!('name' in frontmatter)) {
    return {
      valid: false,
      message: "Missing required 'name' field in frontmatter",
    };
  }
  if (!('description' in frontmatter)) {
    return {
      valid: false,
      message: "Missing required 'description' field in frontmatter",
    };
  }

  // Validate name
  let name = frontmatter.name;
  if (typeof name !== 'string') {
    return {valid: false, message: `Name must be a string, got ${typeof name}`};
  }
  name = name.trim();

  if (!name) {
    return {valid: false, message: 'Name cannot be empty'};
  }

  // Check naming convention per spec
  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      valid: false,
      message: `Name '${name}' must use only lowercase letters, numbers, and hyphens (no uppercase, underscores, or special characters)`,
    };
  }

  if (name.startsWith('-') || name.endsWith('-')) {
    return {
      valid: false,
      message: `Name '${name}' cannot start or end with a hyphen`,
    };
  }

  if (name.includes('--')) {
    return {
      valid: false,
      message: `Name '${name}' cannot contain consecutive hyphens (--)`,
    };
  }

  if (name.length > 64) {
    return {
      valid: false,
      message: `Name is too long (${name.length} characters). Maximum is 64 characters per spec.`,
    };
  }

  // Check name matches directory
  if (name !== basename(skillPath)) {
    return {
      valid: false,
      message: `Name '${name}' must match directory name '${basename(skillPath)}'`,
    };
  }

  // Validate description
  let description = frontmatter.description;
  if (typeof description !== 'string') {
    return {
      valid: false,
      message: `Description must be a string, got ${typeof description}`,
    };
  }
  description = description.trim();

  if (!description) {
    return {valid: false, message: 'Description cannot be empty'};
  }

  if (description.includes('<') || description.includes('>')) {
    return {
      valid: false,
      message: 'Description cannot contain XML tags (< or >) per spec',
    };
  }

  if (description.length > 1024) {
    return {
      valid: false,
      message: `Description is too long (${description.length} characters). Maximum is 1024 characters per spec.`,
    };
  }

  // Check for TODO markers (warning, not error)
  if (description.includes('[TODO')) {
    return {
      valid: false,
      message: 'Description contains [TODO] placeholder - please complete it',
    };
  }

  // Validate compatibility field if present
  if ('compatibility' in frontmatter) {
    let compatibility = frontmatter.compatibility;
    if (typeof compatibility !== 'string') {
      return {
        valid: false,
        message: `Compatibility must be a string, got ${typeof compatibility}`,
      };
    }
    compatibility = compatibility.trim();

    if (compatibility.length > 500) {
      return {
        valid: false,
        message: `Compatibility is too long (${compatibility.length} characters). Maximum is 500 characters per spec.`,
      };
    }
  }

  // Count lines in body
  const bodyStart = content.indexOf('---', 3) + 3;
  const body = content.slice(bodyStart).trim();
  const lineCount = body.split('\n').length;

  if (lineCount > 500) {
    console.log(
      `⚠️  Warning: SKILL.md body is ${lineCount} lines (recommended max: 500)`
    );
  }

  return {valid: true, message: 'Skill is valid!'};
}

function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.log('Usage: node quick_validate.mjs <skill_directory>');
    console.log('');
    console.log('Example:');
    console.log('  node quick_validate.mjs .claude/skills/my-skill');
    console.log('  node quick_validate.mjs .skills/my-skill');
    process.exit(1);
  }

  const skillPath = args[0];
  console.log(`🔍 Validating skill: ${skillPath}`);
  console.log('');

  const {valid, message} = validateSkill(skillPath);

  if (valid) {
    console.log(`✅ ${message}`);
  } else {
    console.log(`❌ ${message}`);
  }

  process.exit(valid ? 0 : 1);
}

main();
