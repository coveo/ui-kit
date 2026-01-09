// scripts/reports/pr-review-times/codeowners.mjs
import fs from 'node:fs';
import path from 'node:path';

/**
 * Loads and parses CODEOWNERS file
 */
export function loadCodeOwners() {
  // We assume the script is run from project root, or we try to find it relative to this file
  let codeOwnersPath = path.resolve(process.cwd(), 'CODEOWNERS');

  if (!fs.existsSync(codeOwnersPath)) {
    // Try searching up from this script location
    // This script is at scripts/reports/pr-review-times/
    // So root is ../../../
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    codeOwnersPath = path.resolve(__dirname, '../../../CODEOWNERS');
  }

  if (!fs.existsSync(codeOwnersPath)) {
    console.warn('CODEOWNERS file not found at', codeOwnersPath);
    return [];
  }
  const content = fs.readFileSync(codeOwnersPath, 'utf-8');
  return parseCodeOwners(content);
}

/**
 * Parses CODEOWNERS content into rules
 * @param {string} content
 */
function parseCodeOwners(content) {
  const rules = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Split by whitespace, respecting escaped spaces if any (simplified here)
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue; // Need at least pattern and one owner

    const pattern = parts[0];
    const owners = parts.slice(1);

    rules.push({
      pattern,
      regex: globToRegex(pattern),
      owners,
    });
  }

  // Return reversed to make "first match wins" logic easier if iterating
  // But usually we iterate all and pick the last one.
  // Git logic: Last match wins.
  return rules;
}

/**
 * Simple Glob to Regex converter for CODEOWNERS
 * @param {string} pattern
 */
function globToRegex(pattern) {
  let regexStr = pattern;

  // Escape regex special characters except * and ?
  regexStr = regexStr.replace(/[.+^${}()|[\]\\]/g, '\\$&');

  // Handle double star **
  regexStr = regexStr.replace(/\*\*/g, '.*');

  // Handle single star * (matches non-slash char)
  regexStr = regexStr.replace(/(?<!\.)\*/g, '[^/]+');

  // Handle trailing slash (directory match)
  if (regexStr.endsWith('/')) {
    regexStr += '.*';
  }

  // Handle leading slash (anchor to root)
  if (regexStr.startsWith('/')) {
    regexStr = `^${regexStr.substring(1)}`;
  } else {
    // If no leading slash, it matches anywhere (like **/pattern)
    // But CODEOWNERS says: "If the pattern ends with /, it is recursively..."
    // "If the pattern does not contain a slash /, it matches in any directory"
    // "If the pattern contains a slash / (not at the end), it is relative to root"
    if (pattern.includes('/') && !pattern.endsWith('/')) {
      // Has slash in middle, relative to root (if no leading slash, still usually relative to root in CODEOWNERS?)
      // GitHub docs: "Patterns are relative to the root of the repository"
      // So `packages/foo.md` matches `/packages/foo.md`
      regexStr = `^${regexStr}`;
    } else {
      // No slash, matches anywhere
      regexStr = `.*${regexStr}`;
    }
  }

  // Exact match end unless we added .*
  if (!regexStr.endsWith('.*')) {
    regexStr += '$';
  }

  return new RegExp(regexStr);
}

/**
 * Identify owners for a given file path
 * @param {string} filePath Relative path from root
 * @param {Array} codeOwnersRules
 */
export function getOwnersForFile(filePath, codeOwnersRules) {
  // Last match wins
  let owners = [];
  // Ensure filePath starts with nothing (relative) or slash?
  // My regex logic expects ^... or .*...
  // Let's normalize filePath to NOT start with /
  const normalizedPath = filePath.startsWith('/')
    ? filePath.substring(1)
    : filePath;

  for (const rule of codeOwnersRules) {
    if (rule.regex.test(normalizedPath)) {
      owners = rule.owners;
    }
  }
  return owners;
}
