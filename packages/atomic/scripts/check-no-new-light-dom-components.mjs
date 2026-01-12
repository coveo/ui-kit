#!/usr/bin/env node

/**
 * Static analysis script to prevent new Lit components from using Light DOM.
 *
 * Problem: Light DOM components (using LightDomMixin) have limited style encapsulation
 * and can cause styles to leak. While existing Light DOM components are allowed for
 * backwards compatibility, new components should use Shadow DOM.
 *
 * This script:
 * 1. Finds all Lit components that use LightDomMixin or ItemSectionMixin
 * 2. Compares against an allowlist of existing Light DOM components
 * 3. Reports any new Light DOM components as violations
 *
 * Usage:
 *   node scripts/check-no-new-light-dom-components.mjs
 *
 * Exit codes:
 *   0 - No new Light DOM components found
 *   1 - New Light DOM components found or script error
 */

import {readdirSync, readFileSync, statSync} from 'node:fs';
import {extname, join, relative} from 'node:path';

const ATOMIC_SRC = new URL('../src', import.meta.url).pathname;

/**
 * Allowlist of existing Light DOM components.
 * These are grandfathered in for backwards compatibility.
 * DO NOT add new components to this list - use Shadow DOM instead.
 */
const ALLOWED_LIGHT_DOM_COMPONENTS = new Set([
  // Common components
  'src/components/common/atomic-aria-live/atomic-aria-live.ts',
  'src/components/common/atomic-facet-date-input/atomic-facet-date-input.ts',
  'src/components/common/atomic-facet-number-input/atomic-facet-number-input.ts',
  'src/components/common/atomic-focus-trap/atomic-focus-trap.ts',
  'src/components/common/atomic-icon/atomic-icon.ts',
  'src/components/common/atomic-layout-section/atomic-layout-section.ts',
  'src/components/common/atomic-numeric-range/atomic-numeric-range.ts',
  'src/components/common/atomic-tab-button/atomic-tab-button.ts',
  'src/components/common/atomic-timeframe/atomic-timeframe.ts',

  // Commerce components
  'src/components/commerce/atomic-commerce-facet-number-input/atomic-commerce-facet-number-input.ts',
  'src/components/commerce/atomic-commerce-facets/atomic-commerce-facets.ts',
  'src/components/commerce/atomic-commerce-layout/atomic-commerce-layout.ts',
  'src/components/commerce/atomic-product-children/atomic-product-children.ts',
  'src/components/commerce/atomic-product-description/atomic-product-description.ts',
  'src/components/commerce/atomic-product-excerpt/atomic-product-excerpt.ts',
  'src/components/commerce/atomic-product-field-condition/atomic-product-field-condition.ts',
  'src/components/commerce/atomic-product-link/atomic-product-link.ts',
  'src/components/commerce/atomic-product-numeric-field-value/atomic-product-numeric-field-value.ts',
  'src/components/commerce/atomic-product-price/atomic-product-price.ts',
  'src/components/commerce/atomic-product-rating/atomic-product-rating.ts',
  'src/components/commerce/atomic-product-text/atomic-product-text.ts',

  // Commerce product section components
  'src/components/commerce/atomic-product-section-actions/atomic-product-section-actions.ts',
  'src/components/commerce/atomic-product-section-badges/atomic-product-section-badges.ts',
  'src/components/commerce/atomic-product-section-bottom-metadata/atomic-product-section-bottom-metadata.ts',
  'src/components/commerce/atomic-product-section-children/atomic-product-section-children.ts',
  'src/components/commerce/atomic-product-section-description/atomic-product-section-description.ts',
  'src/components/commerce/atomic-product-section-emphasized/atomic-product-section-emphasized.ts',
  'src/components/commerce/atomic-product-section-metadata/atomic-product-section-metadata.ts',
  'src/components/commerce/atomic-product-section-name/atomic-product-section-name.ts',
  'src/components/commerce/atomic-product-section-visual/atomic-product-section-visual.ts',

  // Insight components
  'src/components/insight/atomic-insight-layout/atomic-insight-layout.ts',
  'src/components/insight/atomic-insight-tabs/atomic-insight-tabs.ts',

  // IPX components
  'src/components/ipx/atomic-ipx-tabs/atomic-ipx-tabs.ts',

  // Search result section components
  'src/components/search/atomic-result-section-actions/atomic-result-section-actions.ts',
  'src/components/search/atomic-result-section-badges/atomic-result-section-badges.ts',
  'src/components/search/atomic-result-section-bottom-metadata/atomic-result-section-bottom-metadata.ts',
  'src/components/search/atomic-result-section-children/atomic-result-section-children.ts',
  'src/components/search/atomic-result-section-emphasized/atomic-result-section-emphasized.ts',
  'src/components/search/atomic-result-section-excerpt/atomic-result-section-excerpt.ts',
  'src/components/search/atomic-result-section-title/atomic-result-section-title.ts',
  'src/components/search/atomic-result-section-title-metadata/atomic-result-section-title-metadata.ts',
  'src/components/search/atomic-result-section-visual/atomic-result-section-visual.ts',

  // Search result components
  'src/components/search/atomic-automatic-facet-generator/atomic-automatic-facet-generator.ts',
  'src/components/search/atomic-facet-manager/atomic-facet-manager.ts',
  'src/components/search/atomic-field-condition/atomic-field-condition.ts',
  'src/components/search/atomic-result-date/atomic-result-date.ts',
  'src/components/search/atomic-result-fields-list/atomic-result-fields-list.ts',
  'src/components/search/atomic-result-html/atomic-result-html.ts',
  'src/components/search/atomic-result-image/atomic-result-image.ts',
  'src/components/search/atomic-result-link/atomic-result-link.ts',
  'src/components/search/atomic-result-localized-text/atomic-result-localized-text.ts',
  'src/components/search/atomic-result-number/atomic-result-number.ts',
  'src/components/search/atomic-result-printable-uri/atomic-result-printable-uri.ts',
  'src/components/search/atomic-result-text/atomic-result-text.ts',
  'src/components/search/atomic-result-timespan/atomic-result-timespan.ts',
  'src/components/search/atomic-search-layout/atomic-search-layout.ts',
  'src/components/search/atomic-sort-expression/atomic-sort-expression.ts',
  'src/components/search/atomic-tab/atomic-tab.ts',
  'src/components/search/atomic-table-element/atomic-table-element.ts',
]);

const LIGHT_DOM_MIXIN_PATTERN = /extends\s+[^{]*LightDomMixin\s*\(/;
const ITEM_SECTION_MIXIN_PATTERN = /extends\s+[^{]*ItemSectionMixin\s*\(/;
// Detects direct createRenderRoot override returning `this` (bypassing LightDomMixin)
const CREATE_RENDER_ROOT_PATTERN =
  /createRenderRoot\s*\(\s*\)\s*(?::\s*\w+\s*)?\{[^}]*return\s+this\s*;?\s*\}/;

function extractClassName(content) {
  const match =
    content.match(/class\s+(\w+)\s+extends\s+[^{]*LightDomMixin\s*\(/) ||
    content.match(/class\s+(\w+)\s+extends\s+[^{]*ItemSectionMixin\s*\(/) ||
    content.match(/class\s+(\w+)\s+extends/);
  return match ? match[1] : 'Unknown';
}

function extractTagName(content) {
  const match = content.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  return match ? match[1] : null;
}

/**
 * Determines if content represents a Light DOM component.
 * Detects:
 * - LightDomMixin usage
 * - ItemSectionMixin usage
 * - Direct createRenderRoot() override returning `this`
 */
function isLightDomComponent(content) {
  if (
    LIGHT_DOM_MIXIN_PATTERN.test(content) ||
    ITEM_SECTION_MIXIN_PATTERN.test(content)
  ) {
    return {isLightDom: true, method: 'mixin'};
  }

  if (CREATE_RENDER_ROOT_PATTERN.test(content)) {
    return {isLightDom: true, method: 'createRenderRoot'};
  }

  return {isLightDom: false, method: null};
}

/**
 * Gets a descriptive label for how Light DOM was implemented.
 */
function getLightDomMethodLabel(content) {
  if (LIGHT_DOM_MIXIN_PATTERN.test(content)) {
    return 'LightDomMixin';
  }
  if (ITEM_SECTION_MIXIN_PATTERN.test(content)) {
    return 'ItemSectionMixin';
  }
  if (CREATE_RENDER_ROOT_PATTERN.test(content)) {
    return 'createRenderRoot() override';
  }
  return 'Unknown';
}

const EXCLUDED_FILES = [
  '.spec.ts',
  '.stories.ts',
  '.new.stories.tsx',
  '.e2e.ts',
  '.tw.css.ts',
  '.d.ts',
];
const EXCLUDED_EXACT = ['fixture.ts', 'page-object.ts'];

function findTsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && extname(entry) === '.ts') {
      const shouldSkip =
        EXCLUDED_FILES.some((suffix) => entry.endsWith(suffix)) ||
        EXCLUDED_EXACT.includes(entry);
      if (!shouldSkip) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function main() {
  console.log('🔍 Checking for new Light DOM components...\n');

  const componentsDir = join(ATOMIC_SRC, 'components');
  const files = findTsFiles(componentsDir);
  const violations = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');

    const {isLightDom} = isLightDomComponent(content);
    if (!isLightDom) {
      continue;
    }

    const relativePath = relative(join(ATOMIC_SRC, '..'), file);

    if (!ALLOWED_LIGHT_DOM_COMPONENTS.has(relativePath)) {
      const className = extractClassName(content);
      const tagName = extractTagName(content);
      const methodLabel = getLightDomMethodLabel(content);

      violations.push({
        file: relativePath,
        className,
        tagName,
        mixinType: methodLabel,
      });
    }
  }

  if (violations.length === 0) {
    console.log('✅ No new Light DOM components found.\n');
    process.exit(0);
  }

  console.log(`❌ Found ${violations.length} new Light DOM component(s):\n`);

  for (const violation of violations) {
    console.log(`📁 ${violation.file}`);
    console.log(
      `   Component: ${violation.className} (${violation.tagName || 'no tag name'})`
    );
    console.log(`   Uses: ${violation.mixinType}`);
    console.log('');
  }

  console.log('\n💡 Why this is not allowed:');
  console.log(
    '   New components should use Shadow DOM for proper style encapsulation.'
  );
  console.log(
    '   Light DOM components can cause styles to leak and are harder to maintain.'
  );
  console.log('');
  console.log('📝 How to fix:');
  console.log('   - Use Shadow DOM by extending LitElement directly');
  console.log(
    '   - Use @withTailwindStyles decorator for Tailwind CSS support'
  );
  console.log(
    '   - See the component generation script: node scripts/generate-component.mjs'
  );
  console.log('');
  console.log(
    '⚠️  If Light DOM is absolutely required for a valid reason, discuss with the team'
  );
  console.log(
    '   and update the allowlist in scripts/check-no-new-light-dom-components.mjs\n'
  );

  process.exit(1);
}

main();
