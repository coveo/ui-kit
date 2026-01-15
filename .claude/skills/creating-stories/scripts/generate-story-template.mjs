#!/usr/bin/env node

/**
 * Generate Storybook story template for Atomic components or sample pages.
 *
 * Note: This script uses handlebars which is available in packages/atomic.
 * Run from repository root or ensure handlebars is available.
 *
 * Usage:
 *   node .claude/skills/creating-stories/scripts/generate-story-template.mjs <name> [options]
 *
 * Options:
 *   --type       Type of story: component (default) or page
 *   --category   Category: search (default), commerce, insight, ipx, recommendations
 *   --result     For result template components (adds result wrappers)
 *
 * Examples:
 *   node .claude/skills/creating-stories/scripts/generate-story-template.mjs atomic-my-component
 *   node .claude/skills/creating-stories/scripts/generate-story-template.mjs my-page --type page --category commerce
 *   node .claude/skills/creating-stories/scripts/generate-story-template.mjs atomic-result-field --result
 */

import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handlebars = await loadHandlebars();

async function loadHandlebars() {
  try {
    const handlebarsPath = new URL(
      '../../../../packages/atomic/node_modules/handlebars/lib/index.js',
      import.meta.url
    );
    const imported = await import(handlebarsPath);
    return imported.default;
  } catch {
    console.error(
      "Error: Cannot resolve 'handlebars'. Install dependencies (e.g., run 'pnpm install') or run this script from an environment where 'handlebars' is available."
    );
    process.exit(1);
  }
}

const ALLOWED_TYPES = ['component', 'page'];
const ALLOWED_CATEGORIES = [
  'search',
  'commerce',
  'insight',
  'ipx',
  'recommendations',
];

function printHelp() {
  console.log(`
Generate Storybook story template for Atomic components or sample pages.

Usage:
  node .claude/skills/creating-stories/scripts/generate-story-template.mjs <name> [options]

Options:
  --type       Type of story: component (default) or page
  --category   Category: search (default), commerce, insight, ipx, recommendations
  --result     For result template components (adds result wrappers)

Examples:
  node .claude/skills/creating-stories/scripts/generate-story-template.mjs atomic-my-component
  node .claude/skills/creating-stories/scripts/generate-story-template.mjs my-page --type page --category commerce
  node .claude/skills/creating-stories/scripts/generate-story-template.mjs atomic-result-field --result
  `);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function getFlagValue(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1) {
    return undefined;
  }

  const value = args[idx + 1];
  if (!value || value.startsWith('-')) {
    fail(`Missing value for ${flag}`);
  }

  return value;
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const name = args[0];
if (!name || name.startsWith('-')) {
  fail('Missing required <name> positional argument');
}

const type = getFlagValue(args, '--type') ?? 'component';
if (!ALLOWED_TYPES.includes(type)) {
  fail(`Invalid --type '${type}'. Allowed: ${ALLOWED_TYPES.join(', ')}`);
}

const category = getFlagValue(args, '--category') ?? 'search';
if (!ALLOWED_CATEGORIES.includes(category)) {
  fail(
    `Invalid --category '${category}'. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`
  );
}

const isResult = args.includes('--result');
if (type === 'page' && isResult) {
  fail(`--result cannot be used with --type page`);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toTitleCase(str) {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

function getTemplateData(componentName, cat) {
  const apiConfig = {
    search: {
      apiClass: 'SearchApi',
      apiPath: 'search',
      wrapperImport: 'wrapInSearchInterface',
      wrapperPath: '@/storybook-utils/search/search-interface-wrapper',
      wrapperFunction: 'wrapInSearchInterface',
      interfaceTag: 'atomic-search-interface',
      interfaceType: 'Search',
      interfaceVar: 'search',
      engineConfig: 'getSampleSearchEngineConfiguration',
      headlessPath: '@coveo/headless',
      executeMethod: 'executeFirstSearch',
      interfaceTypeAttr: '',
    },
    commerce: {
      apiClass: 'CommerceApi',
      apiPath: 'commerce',
      wrapperImport: 'wrapInCommerceInterface',
      wrapperPath: '@/storybook-utils/commerce/commerce-interface-wrapper',
      wrapperFunction: 'wrapInCommerceInterface',
      interfaceTag: 'atomic-commerce-interface',
      interfaceType: 'Commerce',
      interfaceVar: 'commerce',
      engineConfig: 'getSampleCommerceEngineConfiguration',
      headlessPath: '@coveo/headless/commerce',
      executeMethod: 'executeFirstRequest',
      interfaceTypeAttr: ' type="search"',
    },
    insight: {
      apiClass: 'InsightApi',
      apiPath: 'insight',
      wrapperImport: 'wrapInInsightInterface',
      wrapperPath: '@/storybook-utils/insight/insight-interface-wrapper',
      wrapperFunction: 'wrapInInsightInterface',
      interfaceTag: 'atomic-insight-interface',
      interfaceType: 'Insight',
      interfaceVar: 'insight',
      engineConfig: 'getSampleInsightEngineConfiguration',
      headlessPath: '@coveo/headless/insight',
      executeMethod: 'executeFirstSearch',
      interfaceTypeAttr: '',
    },
    ipx: {
      apiClass: 'SearchApi',
      apiPath: 'search',
      wrapperImport: 'wrapInSearchInterface',
      wrapperPath: '@/storybook-utils/search/search-interface-wrapper',
      wrapperFunction: 'wrapInSearchInterface',
      interfaceTag: 'atomic-search-interface',
      interfaceType: 'Search',
      interfaceVar: 'search',
      engineConfig: 'getSampleSearchEngineConfiguration',
      headlessPath: '@coveo/headless',
      executeMethod: 'executeFirstSearch',
      interfaceTypeAttr: '',
    },
    recommendations: {
      apiClass: 'RecommendationApi',
      apiPath: 'recommendation',
      wrapperImport: 'wrapInSearchInterface',
      wrapperPath: '@/storybook-utils/search/search-interface-wrapper',
      wrapperFunction: 'wrapInSearchInterface',
      interfaceTag: 'atomic-recs-interface',
      interfaceType: 'Recs',
      interfaceVar: 'recs',
      engineConfig: 'getSampleRecommendationEngineConfiguration',
      headlessPath: '@coveo/headless/recommendation',
      executeMethod: 'getRecommendations',
      interfaceTypeAttr: '',
    },
  };

  const config = apiConfig[cat];
  const titleName = toTitleCase(
    componentName.replace('atomic-', '').replace(/-/g, ' ')
  );

  return {
    componentName,
    pageName: componentName,
    category: capitalize(cat),
    titleName,
    ...config,
  };
}

function renderTemplate(template, data) {
  // Handlebars treats `}}}` as the end of a triple-stache. Some of our templates
  // intentionally include braces around interpolations (e.g., `import {Mock{{x}}}`
  // and `import {{{y}}} ...`). Normalize to equivalent source that Handlebars can
  // parse by inserting whitespace.
  const normalizedTemplate = template.replaceAll('}}}', '}} }');
  const compiled = handlebars.compile(normalizedTemplate, {noEscape: true});
  return compiled(data);
}

// Load template
const assetsDir = resolve(__dirname, '../assets');
let templateFile;

if (type === 'page') {
  templateFile = 'page.new.stories.tsx.hbs';
} else if (isResult) {
  templateFile = 'result-component.new.stories.tsx.hbs';
} else {
  templateFile = 'component.new.stories.tsx.hbs';
}

const templatePath = resolve(assetsDir, templateFile);
const templateContent = readFileSync(templatePath, 'utf8');

const data = getTemplateData(name, category);
const output = renderTemplate(templateContent, data);

console.log(output);
