#!/usr/bin/env node
/**
 * Validate a VS Code Copilot instruction file.
 *
 * Usage:
 *     node validate_instruction.mjs <instruction-file>
 *
 * Example:
 *     node validate_instruction.mjs .github/instructions/my-feature.instructions.md
 */

import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {basename, dirname, join} from 'node:path';

function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) {
    return null;
  }

  const frontmatter = {};
  for (const line of match[1].trim().split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove surrounding quotes
      value = value.replace(/^['"]|['"]$/g, '');
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

function validateInstruction(filePath) {
  const errors = [];
  const warnings = [];

  // Check file exists
  if (!existsSync(filePath)) {
    return {errors: [`File not found: ${filePath}`], warnings: []};
  }

  // Check naming convention
  const filename = basename(filePath);
  if (!filename.endsWith('.instructions.md')) {
    errors.push(`File must end with .instructions.md: ${filename}`);
  }

  const content = readFileSync(filePath, 'utf-8');

  // Check frontmatter exists
  const frontmatter = extractFrontmatter(content);
  if (frontmatter === null) {
    errors.push('Missing YAML frontmatter (must start with ---)');
    return {errors, warnings};
  }

  // Check required fields
  if (!('applyTo' in frontmatter)) {
    errors.push('Missing required field: applyTo');
  } else {
    const applyTo = frontmatter.applyTo;

    // Warn about overly broad patterns
    if (applyTo === '**') {
      warnings.push(
        "applyTo: '**' applies to ALL files - consider a more specific pattern"
      );
    }

    // Check for common pattern issues
    if (applyTo.startsWith('/')) {
      errors.push(`applyTo should not start with /: ${applyTo}`);
    }
  }

  // Check for TODO placeholders
  if (content.includes('TODO')) {
    warnings.push(
      'File contains TODO placeholders - remember to complete them'
    );
  }

  // Check for existing instructions with same scope
  const instructionsDir = dirname(filePath);
  if (existsSync(instructionsDir) && 'applyTo' in frontmatter) {
    const files = readdirSync(instructionsDir).filter((f) =>
      f.endsWith('.instructions.md')
    );
    for (const otherFile of files) {
      if (otherFile === filename) {
        continue;
      }

      const otherPath = join(instructionsDir, otherFile);
      const otherContent = readFileSync(otherPath, 'utf-8');
      const otherFm = extractFrontmatter(otherContent);
      if (otherFm && otherFm.applyTo === frontmatter.applyTo) {
        warnings.push(
          `Same applyTo pattern as ${otherFile} - consider merging or differentiating`
        );
      }
    }
  }

  return {errors, warnings};
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate_instruction.mjs <instruction-file>');
    console.log('');
    console.log('Example:');
    console.log(
      '  node validate_instruction.mjs .github/instructions/my-feature.instructions.md'
    );
    process.exit(1);
  }

  const filePath = args[0];

  const {errors, warnings} = validateInstruction(filePath);

  // Print results
  if (errors.length > 0) {
    console.log(`❌ Validation failed for: ${filePath}`);
    console.log('');
    for (const error of errors) {
      console.log(`  ERROR: ${error}`);
    }
  }

  if (warnings.length > 0) {
    if (errors.length === 0) {
      console.log(`⚠️  Warnings for: ${filePath}`);
      console.log('');
    }
    for (const warning of warnings) {
      console.log(`  WARNING: ${warning}`);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`✅ Instruction is valid: ${filePath}`);
  } else if (errors.length === 0) {
    console.log('');
    console.log('✅ Instruction is valid (with warnings)');
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
