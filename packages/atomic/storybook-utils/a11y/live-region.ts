import type {StoryContext} from '@storybook/web-components-vite';
import {expect, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['4.1.3'] as const;

export interface LiveRegionA11yOptions {
  /** Trigger a state change that causes the live region to update. */
  triggerUpdate: () => Promise<void>;
}

export async function testLiveRegionA11y(
  context: StoryContext,
  options: LiveRegionA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  await step('Assert live region element exists with aria-live', async () => {
    const liveRegion =
      canvasElement.querySelector('[aria-live]') ??
      canvasElement.querySelector('[role="status"]') ??
      canvasElement.querySelector('[role="alert"]');

    expect(liveRegion).not.toBeNull();

    if (liveRegion) {
      const liveValue = liveRegion.getAttribute('aria-live');
      const role = liveRegion.getAttribute('role');
      const validLive = liveValue === 'polite' || liveValue === 'assertive';
      const validRole = role === 'status' || role === 'alert';
      expect(validLive || validRole).toBe(true);
    }
  });

  await step('Live region content updates after state change', async () => {
    const liveRegionBefore =
      canvasElement.querySelector('[aria-live]') ??
      canvasElement.querySelector('[role="status"]') ??
      canvasElement.querySelector('[role="alert"]');

    const contentBefore = liveRegionBefore?.textContent ?? '';

    await options.triggerUpdate();

    await waitFor(
      () => {
        const liveRegionAfter =
          canvasElement.querySelector('[aria-live]') ??
          canvasElement.querySelector('[role="status"]') ??
          canvasElement.querySelector('[role="alert"]');

        const contentAfter = liveRegionAfter?.textContent ?? '';
        expect(contentAfter).not.toBe(contentBefore);
      },
      {timeout: 5000}
    );
  });

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
