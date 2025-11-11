#!/usr/bin/env node

/**
 * Validation script for the mock cache bust plugin.
 * This script tests various scenarios to ensure the plugin works correctly.
 */

import {mockCacheBustPlugin} from './vite-plugin-mock-cache-bust.mjs';

// ANSI color codes
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`${green}✓${reset} ${description}`);
    passCount++;
  } catch (error) {
    console.log(`${red}✗${reset} ${description}`);
    console.log(`  ${red}Error: ${error.message}${reset}`);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(
      message ||
        `Expected string to contain "${substring}", but got "${str.substring(0, 100)}..."`
    );
  }
}

function assertNotContains(str, substring, message) {
  if (str.includes(substring)) {
    throw new Error(
      message ||
        `Expected string to NOT contain "${substring}", but it was found`
    );
  }
}

console.log(
  `${yellow}Running validation tests for mock cache bust plugin...${reset}\n`
);

// Test 1: Plugin structure
test('should return two plugin instances', () => {
  const plugins = mockCacheBustPlugin();
  assert(Array.isArray(plugins), 'Should return an array');
  assert(plugins.length === 2, 'Should return exactly 2 plugins');
});

test('should have correct plugin names', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  assert(prePhase.name === 'mock-cache-bust:pre', 'Pre-phase has correct name');
  assert(
    postPhase.name === 'mock-cache-bust:post',
    'Post-phase has correct name'
  );
});

test('should have correct enforce values', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  assert(prePhase.enforce === 'pre', 'Pre-phase has enforce: pre');
  assert(postPhase.enforce === 'post', 'Post-phase has enforce: post');
});

// Test 2: Basic vi.mock() detection
test('should transform imports for vi.mock() calls', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import {buildController} from '@coveo/headless';
import {vi} from 'vitest';
vi.mock('@coveo/headless', {spy: true});
  `;
  const id = '/test.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result !== null, 'Should return a result');
  assertContains(result.code, '@coveo/headless?mock=');
  assertNotContains(result.code, 'vitest?mock=');
});

// Test 3: vi.mocked() detection
test('should transform imports for vi.mocked() calls', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import * as domUtils from './dom-utils';
import {vi} from 'vitest';
vi.mock('./dom-utils', {spy: true});
it('test', () => {
  vi.mocked(domUtils.closest).mockReturnValue(null);
});
  `;
  const id = '/test.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result !== null, 'Should return a result');
  assertContains(result.code, './dom-utils?mock=');
});

// Test 4: Multiple mocked modules
test('should transform multiple mocked modules', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import {buildController} from '@coveo/headless';
import {someUtil} from './utils';
import {vi} from 'vitest';
vi.mock('@coveo/headless', {spy: true});
vi.mock('./utils', {spy: true});
  `;
  const id = '/test.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result !== null, 'Should return a result');
  assertContains(result.code, '@coveo/headless?mock=');
  assertContains(result.code, './utils?mock=');
});

// Test 5: Non-spec files should be skipped
test('should skip non-spec files', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import {buildController} from '@coveo/headless';
vi.mock('@coveo/headless');
  `;
  const id = '/regular-file.ts';

  const preResult = prePhase.transform(code, id);
  const postResult = postPhase.transform(code, id);

  assert(preResult === null, 'Pre-phase should return null for non-spec files');
  assert(
    postResult === null,
    'Post-phase should return null for non-spec files'
  );
});

// Test 6: Files without mocks should not be transformed
test('should not transform files without mocks', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import {describe, it} from 'vitest';
import {someFunction} from './utils';
describe('test', () => {
  it('should work', () => {
    someFunction();
  });
});
  `;
  const id = '/test.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result === null, 'Should return null when no mocks are present');
});

// Test 7: Type imports should be transformed
test('should transform type imports', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import type {Controller} from '@coveo/headless';
import {buildController} from '@coveo/headless';
import {vi} from 'vitest';
vi.mock('@coveo/headless', {spy: true});
  `;
  const id = '/test.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result !== null, 'Should return a result');
  // Both type and regular imports should be transformed
  const mockCount = (result.code.match(/@coveo\/headless\?mock=/g) || [])
    .length;
  assert(
    mockCount === 2,
    'Both type and regular imports should be transformed'
  );
});

// Test 8: Existing query parameters
test('should handle modules with existing query parameters', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import styles from './styles.css?inline';
import {vi} from 'vitest';
vi.mock('./styles.css?inline');
  `;
  const id = '/test.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result !== null, 'Should return a result');
  assertContains(result.code, './styles.css?inline&mock=');
});

// Test 9: Consistent IDs for same file
test('should use consistent unique ID for same file', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code1 = `
import {vi} from 'vitest';
import {foo} from './foo';
vi.mock('./foo');
  `;
  const code2 = `
import {vi} from 'vitest';
import {bar} from './bar';
vi.mock('./bar');
  `;
  const id = '/test.spec.ts';

  // First transform
  prePhase.transform(code1, id);
  const result1 = postPhase.transform(code1, id);
  const mockId1 = result1.code.match(/\?mock=([a-f0-9]+)/)?.[1];

  // Second transform of the same file
  prePhase.transform(code2, id);
  const result2 = postPhase.transform(code2, id);
  const mockId2 = result2.code.match(/\?mock=([a-f0-9]+)/)?.[1];

  assert(mockId1 === mockId2, 'Should have the same ID for the same file');
  assert(mockId1.length === 8, 'ID should be 8 characters long');
});

// Test 10: Different IDs for different files
test('should use different unique IDs for different files', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import {vi} from 'vitest';
import {foo} from './foo';
vi.mock('./foo');
  `;
  const id1 = '/test1.spec.ts';
  const id2 = '/test2.spec.ts';

  // Transform first file
  prePhase.transform(code, id1);
  const result1 = postPhase.transform(code, id1);
  const mockId1 = result1.code.match(/\?mock=([a-f0-9]+)/)?.[1];

  // Transform second file
  prePhase.transform(code, id2);
  const result2 = postPhase.transform(code, id2);
  const mockId2 = result2.code.match(/\?mock=([a-f0-9]+)/)?.[1];

  assert(mockId1 !== mockId2, 'Should have different IDs for different files');
});

// Test 11: Real-world example
test('should handle complex real-world test file', () => {
  const [prePhase, postPhase] = mockCacheBustPlugin();
  const code = `
import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-no-products', () => {
  it('should render', () => {
    vi.mocked(buildProductListing).mockReturnValue({});
  });
});
  `;
  const id = '/atomic-commerce-no-products.spec.ts';

  prePhase.transform(code, id);
  const result = postPhase.transform(code, id);

  assert(result !== null, 'Should return a result');
  assertContains(result.code, '@coveo/headless/commerce?mock=');
  // Other imports should not be modified
  assertContains(result.code, "from 'lit'");
  assertContains(result.code, "from 'vitest'");
  assertContains(result.code, "from '@/vitest-utils/testing-helpers'");
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(
  `${green}Passed: ${passCount}${reset} | ${failCount > 0 ? red : yellow}Failed: ${failCount}${reset}`
);
console.log('='.repeat(50));

if (failCount > 0) {
  process.exit(1);
}
