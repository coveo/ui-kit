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

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
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
  process.exit(0);
}

const name = args[0];
const type = args.includes('--type')
  ? args[args.indexOf('--type') + 1]
  : 'component';
const category = args.includes('--category')
  ? args[args.indexOf('--category') + 1]
  : 'search';
const isResult = args.includes('--result');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toTitleCase(str) {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

function getTemplateData(_storyType, componentName, cat, _isResultComponent) {
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

  const config = apiConfig[cat] || apiConfig.search;
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

// Simple template function (replaces handlebars for portability)
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
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

const data = getTemplateData(type, name, category, isResult);
const output = renderTemplate(templateContent, data);

console.log(output);
