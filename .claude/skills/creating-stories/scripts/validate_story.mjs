#!/usr/bin/env node
/**
 * Validates a Storybook story file for ui-kit components.
 */
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node validate_story.mjs <path-to-story-file>');
  process.exit(1);
}

const storyPath = resolve(args[0]);
if (!existsSync(storyPath)) {
  console.error(`Story file not found: ${storyPath}`);
  process.exit(1);
}

if (!storyPath.endsWith('.stories.tsx') && !storyPath.endsWith('.stories.ts')) {
  console.error('File must be a .stories.tsx or .stories.ts file');
  process.exit(1);
}

const content = readFileSync(storyPath, 'utf8');
let hasErrors = false;
let hasWarnings = false;

function error(msg) {
  console.error(`❌ Error: ${msg}`);
  hasErrors = true;
}
function warn(msg) {
  console.warn(`⚠️  Warning: ${msg}`);
  hasWarnings = true;
}
function info(msg) {
  console.log(`✓ ${msg}`);
}

// Remove all whitespace/newlines for better pattern matching
const compactContent = content.replace(/\s+/g, ' ');

console.log(`🔍 Validating story: ${storyPath}\n`);

// Required imports (check in compact version for multi-line imports)
if (/Meta/.test(compactContent) && /@storybook/.test(content))
  info('Meta type');
else error('Missing Meta type import');
if (/Story/.test(compactContent) && /@storybook/.test(content))
  info('Story type');
else error('Missing Story type import');

// getStorybookHelpers is optional (result templates and pages don't always use it)
if (/getStorybookHelpers/.test(content)) {
  info('getStorybookHelpers (standard component)');
} else {
  info('No getStorybookHelpers (likely result template or page)');
}

// Interface wrappers (optional for pages)
const hasWrapper =
  /wrap(In(Search|Commerce|Insight)Interface|InResultTemplate)/.test(content);
if (hasWrapper) {
  info('Interface/template wrapper');
}

// MSW setup (optional - not all components need it)
if (/Mock(Search|Commerce|Insight|Answer|Recommendation)Api/.test(content)) {
  info('MSW API harness');
  if (!/msw:\s*\{\s*handlers:/.test(content)) {
    error('MSW harness created but not added to parameters');
  }
}

// Meta export
if (/const meta:\s*Meta\s*=/.test(content)) info('Meta configuration');
else error('Missing Meta configuration');
if (/export default meta/.test(content)) info('Default meta export');
else error('Missing default meta export');

// Meta properties
if (/component:/.test(content)) info('Meta.component');
if (/title:/.test(content)) info('Meta.title');
if (/render:/.test(content)) info('Meta.render');

// Stories
const storyCount = (content.match(/export const \w+:\s*Story/g) || []).length;
if (storyCount > 0) info(`${storyCount} story export(s)`);
else error('No story exports found');

// Common issues
if (/TODO|FIXME/.test(content)) warn('Contains TODO/FIXME');

// Decorators and parameters are optional for pages
if (/decorators:\s*\[/.test(content)) {
  info('Decorators configured');
}
if (/parameters:\s*\{/.test(content)) {
  info('Parameters configured');
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Validation failed');
  process.exit(1);
}
if (hasWarnings) console.log('⚠️  Story has warnings but may be valid');
console.log('✅ Story is valid!');
