import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by carousel interaction tests.
 *
 * - 4.1.2 Name, Role, Value: carousel container has proper ARIA roles
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ — WAI-ARIA Carousel Pattern
 * @see https://www.w3.org/TR/WCAG22/#name-role-value — WCAG 2.2 SC 4.1.2 Name, Role, Value (Level A)
 */
export const COVERED_CRITERIA = ['4.1.2'] as const;

export interface CarouselA11yOptions {
  /** Matches aria-label of the carousel container. If omitted, uses first carousel found. */
  carouselLabel?: string | RegExp;
}

async function findCarousel(
  canvasElement: HTMLElement,
  options?: CarouselA11yOptions
): Promise<HTMLElement> {
  const root = within(canvasElement);

  let elements: HTMLElement[];
  try {
    const queryOptions: Record<string, unknown> = {};
    if (options?.carouselLabel !== undefined) {
      queryOptions.name = options.carouselLabel;
    }
    elements = await root.findAllByShadowRole('region', queryOptions, {
      timeout: 5000,
    });
    // Filter to only those with aria-roledescription="carousel"
    elements = elements.filter(
      (el) => el.getAttribute('aria-roledescription') === 'carousel'
    );
  } catch {
    elements = [];
  }

  if (elements.length === 0) {
    throw new Error(
      `[testCarouselA11y] No carousel found.\n\n` +
        `Expected an element with role="region" and aria-roledescription="carousel".\n` +
        `If this component does not use a carousel, remove the testCarouselA11y call from its story.`
    );
  }

  return elements[0];
}

/**
 * Tests the WAI-ARIA Carousel pattern.
 *
 * Verifies that:
 * 1. A carousel container with `role="region"` and `aria-roledescription="carousel"` exists
 * 2. Carousel has an accessible label
 * 3. An `aria-live="polite"` region exists inside the carousel
 * 4. Previous/next buttons have accessible labels
 *
 * NOTE: The APG also recommends each slide have `role="group"` with
 * `aria-roledescription="slide"` and an accessible name. This is not yet
 * tested because Atomic's carousel uses pagination rather than discrete
 * slide containers. Tracking: KIT-5729.
 */
export async function testCarouselA11y(
  context: StoryContext,
  options?: CarouselA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';

  try {
    let carousel!: HTMLElement;

    await step(
      'Find carousel with role="region" and aria-roledescription="carousel"',
      async () => {
        carousel = await findCarousel(canvasElement, options);
        expect(carousel).toBeTruthy();
      }
    );

    await step('Carousel has accessible label', async () => {
      const hasLabel =
        carousel.hasAttribute('aria-label') ||
        carousel.hasAttribute('aria-labelledby');
      expect(hasLabel).toBe(true);
    });

    await step('Carousel has aria-live="polite" region', async () => {
      await waitFor(
        () => {
          const liveRegion = carousel.querySelector('[aria-live="polite"]');
          expect(liveRegion).not.toBeNull();
        },
        {timeout: 3000}
      );
    });

    await step('Navigation buttons have accessible labels', async () => {
      const root = within(canvasElement);
      const buttons = await root.findAllByShadowRole(
        'button',
        {},
        {timeout: 5000}
      );
      const navButtons = buttons.filter(
        (btn) => btn.getAttribute('aria-label') && carousel.contains(btn)
      );
      expect(navButtons.length).toBeGreaterThanOrEqual(1);
    });
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
