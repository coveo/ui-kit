#!/usr/bin/env node
/**
 * Agent Validator - Validates agent file structure and frontmatter
 *
 * Usage:
 *     node validate_agent.mjs <agent-file>
 *
 * Example:
 *     node validate_agent.mjs .github/agents/code-review-v1.agent.md
 */

import {existsSync, readFileSync} from 'node:fs';
import {basename, dirname, join} from 'node:path';

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

function validateAgent(filepath) {
  const issues = [];
  const warnings = [];

  // Check file exists
  if (!existsSync(filepath)) {
    return {issues: [`File not found: ${filepath}`], warnings: []};
  }

  // Check file naming
  const filename = basename(filepath);
  if (!filename.endsWith('.agent.md')) {
    issues.push(`File must end with .agent.md, got: ${filename}`);
  }

  if (!/^[a-z0-9-]+-v\d+\.agent\.md$/.test(filename)) {
    issues.push(`File should be named {name}-v{N}.agent.md, got: ${filename}`);
  }

  const content = readFileSync(filepath, 'utf-8');

  // Parse frontmatter
  const {frontmatter, error} = parseFrontmatter(content);
  if (frontmatter === null) {
    issues.push(error);
    return {issues, warnings};
  }

  // Check required fields
  if (!('name' in frontmatter)) {
    issues.push('Missing required field: name');
  }

  if (!('description' in frontmatter)) {
    issues.push('Missing required field: description');
  }

  if (!('tools' in frontmatter)) {
    issues.push('Missing required field: tools');
  }

  // Validate name matches filename
  if ('name' in frontmatter) {
    const baseName = filename.replace('.agent.md', '').replace(/-/g, ' ');
    const words = baseName.split(' ');
    const expectedName = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    // Remove version suffix for comparison
    const expectedNameClean = `${expectedName.replace(/V\d+$/, '')}V1`;

    if (frontmatter.name !== expectedNameClean) {
      warnings.push(
        `Name '${frontmatter.name}' may not match filename. ` +
          `Expected something like '${expectedNameClean}'`
      );
    }
  }

  // Check for TODO markers in description
  if (
    'description' in frontmatter &&
    frontmatter.description.includes('TODO')
  ) {
    issues.push('Description contains TODO - please complete it');
  }

  // Check description length
  const desc = frontmatter.description || '';
  if (desc.length < 20) {
    warnings.push('Description seems too short - add more detail');
  }

  // Check body content for TODOs
  const parts = content.split('---', 3);
  if (parts.length >= 3 && parts[2].includes('TODO')) {
    warnings.push('Body contains TODO markers - consider completing them');
  }

  // Check for examples file
  const agentName = filename
    .replace('-v1.agent.md', '')
    .replace('-v2.agent.md', '');
  const examplesPath = join(
    dirname(filepath),
    'examples',
    `${agentName}-examples.md`
  );
  if (!existsSync(examplesPath)) {
    warnings.push(`No examples file found at ${examplesPath}`);
  }

  return {issues, warnings};
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate_agent.mjs <agent-file>');
    console.log('');
    console.log('Example:');
    console.log(
      '  node validate_agent.mjs .github/agents/code-review-v1.agent.md'
    );
    process.exit(1);
  }

  const filepath = args[0];

  console.log(`🔍 Validating agent: ${filepath}`);
  console.log('');

  const {issues, warnings} = validateAgent(filepath);

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
    console.log('✅ Agent is valid!');
    process.exit(0);
  }
}

main();
