#!/usr/bin/env node
/**
 * Prompt Validator - Validates prompt file structure and frontmatter
 *
 * Usage:
 *     node validate_prompt.mjs <prompt-file>
 *
 * Example:
 *     node validate_prompt.mjs .github/prompts/generate-tests.prompt.md
 */

import {existsSync, readFileSync} from 'node:fs';
import {basename} from 'node:path';

function parseFrontmatter(content) {
  if (!content.startsWith('---')) {
    return {
      frontmatter: null,
      error: 'File must start with YAML frontmatter (---)',
    };
  }

  const parts = content.split('---', 3);
  if (parts.length < 3) {
    return {frontmatter: null, error: 'Invalid frontmatter format'};
  }

  const frontmatter = {};
  for (const line of parts[1].trim().split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove surrounding quotes
      value = value.replace(/^['"]|['"]$/g, '');
      frontmatter[key] = value;
    }
  }

  return {frontmatter, body: parts[2]};
}

function validatePrompt(filepath) {
  const issues = [];
  const warnings = [];

  // Check file exists
  if (!existsSync(filepath)) {
    return {issues: [`File not found: ${filepath}`], warnings: []};
  }

  // Check file naming
  const filename = basename(filepath);
  if (!filename.endsWith('.prompt.md')) {
    issues.push(`File must end with .prompt.md, got: ${filename}`);
  }

  if (!/^[a-z0-9-]+\.prompt\.md$/.test(filename)) {
    warnings.push('File should be named {task}.prompt.md in kebab-case');
  }

  const content = readFileSync(filepath, 'utf-8');

  // Parse frontmatter
  const {frontmatter, body, error} = parseFrontmatter(content);
  if (frontmatter === null) {
    issues.push(error);
    return {issues, warnings};
  }

  // Check required fields
  if (!('mode' in frontmatter)) {
    warnings.push("Missing 'mode' field - will use default");
  }

  if (!('tools' in frontmatter)) {
    warnings.push("Missing 'tools' field - no tools will be available");
  }

  // Check for TODO markers
  const todoCount = (content.match(/TODO/g) || []).length;
  if (todoCount > 0) {
    warnings.push(
      `Found ${todoCount} TODO marker(s) - consider completing them`
    );
  }

  // Check body has content
  if (typeof body === 'string') {
    const bodyStripped = body.trim();
    if (bodyStripped.length < 50) {
      warnings.push('Prompt body seems too short');
    }

    // Check for common sections
    if (!body.includes('## Requirements') && !body.includes('## Task')) {
      warnings.push('Consider adding ## Requirements or ## Task section');
    }

    if (!body.includes('## Validation') && !body.includes('- [ ]')) {
      warnings.push('Consider adding a validation checklist');
    }
  }

  return {issues, warnings};
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate_prompt.mjs <prompt-file>');
    console.log('');
    console.log('Example:');
    console.log(
      '  node validate_prompt.mjs .github/prompts/generate-tests.prompt.md'
    );
    process.exit(1);
  }

  const filepath = args[0];

  console.log(`🔍 Validating prompt: ${filepath}`);
  console.log('');

  const {issues, warnings} = validatePrompt(filepath);

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const warning of warnings) {
      console.log(`   - ${warning}`);
    }
    console.log('');
  }

  if (issues.length > 0) {
    console.log('❌ Issues found:');
    for (const issue of issues) {
      console.log(`   - ${issue}`);
    }
    console.log('');
    process.exit(1);
  } else {
    console.log('✅ Prompt is valid!');
    process.exit(0);
  }
}

main();
