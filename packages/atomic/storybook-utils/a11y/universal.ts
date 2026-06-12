import type {StoryContext} from '@storybook/web-components-vite';
import {testOnFocusA11y} from './on-focus.js';

/**
 * Universal a11y tests that run automatically on every story.
 *
 * These tests cover WCAG criteria that can be verified without
 * component-specific setup:
 *
 * This function is designed to be called from a global Storybook play function
 * or afterEach hook in the test setup. It runs all universal checks and reports
 * results via context.reporting.
 */
export async function runUniversalA11yTests(
  context: StoryContext
): Promise<void> {
  const errors: Error[] = [];

  try {
    await testOnFocusA11y(context);
  } catch (e) {
    errors.push(e instanceof Error ? e : new Error(String(e)));
  }

  if (errors.length > 0) {
    throw new AggregateError(
      errors,
      `[Universal A11y] ${errors.length} check(s) failed: ${errors.map((e) => e.message).join(' | ')}`
    );
  }
}
