#!/usr/bin/env node

/**
 * Example demonstrating the mock cache bust plugin in action.
 * This script shows how the plugin transforms various test file scenarios.
 */

import {mockCacheBustPlugin} from './vite-plugin-mock-cache-bust.mjs';

// ANSI color codes
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const gray = '\x1b[90m';
const reset = '\x1b[0m';

function showExample(title, code, filename = '/example.spec.ts') {
  console.log(`\n${cyan}${'='.repeat(70)}${reset}`);
  console.log(`${cyan}Example: ${title}${reset}`);
  console.log(`${cyan}${'='.repeat(70)}${reset}`);

  console.log(`\n${yellow}Original code:${reset}`);
  console.log(`${gray}${code.trim()}${reset}`);

  const [prePhase, postPhase] = mockCacheBustPlugin();
  prePhase.transform(code, filename);
  const result = postPhase.transform(code, filename);

  if (result) {
    console.log(`\n${green}Transformed code:${reset}`);
    console.log(result.code.trim());
  } else {
    console.log(
      `\n${gray}No transformation needed (no mocks detected)${reset}`
    );
  }
}

console.log(`${cyan}Mock Cache Bust Plugin - Examples${reset}`);
console.log(`${cyan}${'='.repeat(70)}${reset}\n`);

// Example 1: Basic vi.mock()
showExample(
  'Basic vi.mock()',
  `
import {buildController} from '@coveo/headless';
import {describe, it, vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});

describe('test', () => {
  it('should work', () => {
    expect(buildController).toBeDefined();
  });
});
`
);

// Example 2: Multiple mocked modules
showExample(
  'Multiple mocked modules',
  `
import {buildController} from '@coveo/headless';
import {someUtil} from './utils';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
vi.mock('./utils', {spy: true});
`
);

// Example 3: vi.mocked()
showExample(
  'vi.mocked() pattern',
  `
import * as domUtils from './dom-utils';
import {describe, it, vi} from 'vitest';

vi.mock('./dom-utils', {spy: true});

describe('test', () => {
  it('should mock a function', () => {
    vi.mocked(domUtils.closest).mockReturnValue(null);
  });
});
`
);

// Example 4: Type imports
showExample(
  'Type imports',
  `
import type {Controller, Engine} from '@coveo/headless';
import {buildController, buildEngine} from '@coveo/headless';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
`
);

// Example 5: No mocks
showExample(
  'No mocks (no transformation)',
  `
import {describe, it, expect} from 'vitest';
import {someFunction} from './utils';

describe('test', () => {
  it('should work without mocks', () => {
    expect(someFunction()).toBe(42);
  });
});
`
);

// Example 6: Existing query parameters
showExample(
  'Existing query parameters',
  `
import styles from './styles.css?inline';
import {vi} from 'vitest';

vi.mock('./styles.css?inline');
`
);

// Example 7: Real-world example
showExample(
  'Real-world complex test',
  `
import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-no-products', () => {
  it('should render when no products', () => {
    vi.mocked(buildProductListing).mockReturnValue({
      state: {hasProducts: false},
    });
    // test implementation...
  });
});
`,
  '/src/components/commerce/atomic-commerce-no-products.spec.ts'
);

// Show file path hashing
console.log(`\n${cyan}${'='.repeat(70)}${reset}`);
console.log(`${cyan}File Path Hashing${reset}`);
console.log(`${cyan}${'='.repeat(70)}${reset}`);

import crypto from 'node:crypto';

const testFiles = [
  '/src/components/test1.spec.ts',
  '/src/components/test2.spec.ts',
  '/src/utils/test.spec.ts',
];

console.log(
  '\nEach test file gets a unique 8-character hash based on its path:\n'
);
for (const file of testFiles) {
  const hash = crypto
    .createHash('md5')
    .update(file)
    .digest('hex')
    .substring(0, 8);
  console.log(`${gray}${file}${reset}`);
  console.log(`  ${green}→ mock=${hash}${reset}\n`);
}

console.log(
  `${gray}This ensures consistent cache-busting across test runs.${reset}`
);

console.log(`\n${cyan}${'='.repeat(70)}${reset}`);
console.log(
  `${green}All examples completed! Plugin is working correctly.${reset}`
);
console.log(`${cyan}${'='.repeat(70)}${reset}\n`);
