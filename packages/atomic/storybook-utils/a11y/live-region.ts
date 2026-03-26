import type {StoryContext} from '@storybook/web-components-vite';
import {expect, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['4.1.3'] as const;

export interface LiveRegionA11yOptions {
  triggerUpdate?: () => Promise<void>;
}

function findLiveRegion(root: HTMLElement): Element | null {
  const direct =
    root.querySelector('[aria-live]') ??
    root.querySelector('[role="status"]') ??
    root.querySelector('[role="alert"]');
  if (direct) return direct;

  const ariaLiveEl = root.querySelector('atomic-aria-live');
  if (ariaLiveEl?.shadowRoot) {
    const inAriaLive =
      ariaLiveEl.shadowRoot.querySelector('[aria-live]') ??
      ariaLiveEl.shadowRoot.querySelector('[role="status"]') ??
      ariaLiveEl.shadowRoot.querySelector('[role="alert"]');
    if (inAriaLive) return inAriaLive;
  }

  const allElements = root.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i] as HTMLElement;
    if (el.shadowRoot) {
      const inShadow =
        el.shadowRoot.querySelector('[aria-live]') ??
        el.shadowRoot.querySelector('[role="status"]') ??
        el.shadowRoot.querySelector('[role="alert"]');
      if (inShadow) return inShadow;

      const nestedAriaLive = el.shadowRoot.querySelector('atomic-aria-live');
      if (nestedAriaLive?.shadowRoot) {
        const inNested =
          nestedAriaLive.shadowRoot.querySelector('[aria-live]') ??
          nestedAriaLive.shadowRoot.querySelector('[role="status"]') ??
          nestedAriaLive.shadowRoot.querySelector('[role="alert"]');
        if (inNested) return inNested;
      }

      const deepElements = el.shadowRoot.querySelectorAll('*');
      for (let j = 0; j < deepElements.length; j++) {
        const deepEl = deepElements[j] as HTMLElement;
        if (deepEl.shadowRoot) {
          const inDeep =
            deepEl.shadowRoot.querySelector('[aria-live]') ??
            deepEl.shadowRoot.querySelector('[role="status"]') ??
            deepEl.shadowRoot.querySelector('[role="alert"]');
          if (inDeep) return inDeep;
        }
      }
    }
  }
  return null;
}

export async function testLiveRegionA11y(
  context: StoryContext,
  options: LiveRegionA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';
  try {
    await step(
      'Assert live region element exists with aria-live or status/alert role',
      async () => {
        await waitFor(
          () => {
            const liveRegion = findLiveRegion(canvasElement);
            expect(liveRegion).not.toBeNull();

            if (liveRegion) {
              const liveValue = liveRegion.getAttribute('aria-live');
              const role = liveRegion.getAttribute('role');
              const validLive =
                liveValue === 'polite' || liveValue === 'assertive';
              const validRole = role === 'status' || role === 'alert';
              expect(validLive || validRole).toBe(true);
            }
          },
          {timeout: 5000}
        );
      }
    );

    if (options.triggerUpdate) {
      await step('Live region content updates after state change', async () => {
        const liveRegionBefore = findLiveRegion(canvasElement);
        const contentBefore = liveRegionBefore?.textContent ?? '';

        await options.triggerUpdate!();

        await waitFor(
          () => {
            const liveRegionAfter = findLiveRegion(canvasElement);
            expect(liveRegionAfter).not.toBeNull();
            const contentAfter = liveRegionAfter?.textContent ?? '';
            if (contentBefore.length > 0) {
              expect(contentAfter.length).toBeGreaterThan(0);
            }
          },
          {timeout: 5000}
        );
      });
    }
  } catch (error) {
    status = 'failed';
    throw error;
  } finally {
    context.reporting?.addReport?.({
      type: 'a11y-interactive',
      version: 1,
      status,
      result: {criteriaCovered: [...COVERED_CRITERIA]},
    });
  }
}
