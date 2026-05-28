import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by carousel interaction tests.
 *
 * - 1.3.1 Info and Relationships: carousel and slide semantics are exposed
 * - 2.1.1 Keyboard: carousel controls are operable with the keyboard
 * - 4.1.2 Name, Role, Value: carousel, slide, and controls expose accessible names
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ — WAI-ARIA Carousel Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['1.3.1', '2.1.1', '4.1.2'] as const;

export interface CarouselA11yOptions {
  carouselName?: string | RegExp;
  carouselIndex?: number;
  previousButtonName?: string | RegExp;
  nextButtonName?: string | RegExp;
}

async function findCarousel(
  canvasElement: HTMLElement,
  options: CarouselA11yOptions
) {
  const root = within(canvasElement);
  const queryOptions =
    options.carouselName === undefined ? {} : {name: options.carouselName};

  const regions = await root
    .findAllByShadowRole('region', queryOptions, {timeout: 5000})
    .catch(() => []);
  const groups = await root
    .findAllByShadowRole('group', queryOptions, {timeout: 5000})
    .catch(() => []);

  const carousels = [...regions, ...groups].filter(
    (element) => element.getAttribute('aria-roledescription') === 'carousel'
  );

  if (carousels.length === 0) {
    throw new Error(
      '[testCarouselA11y] No carousel found. Ensure the story renders a carousel with aria-roledescription="carousel".'
    );
  }

  return carousels[options.carouselIndex ?? 0];
}

export async function testCarouselA11y(
  context: StoryContext,
  options: CarouselA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const carousel = await findCarousel(canvasElement, options);

    await step('Carousel exposes the expected ARIA semantics', async () => {
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
      expect(
        carousel.hasAttribute('aria-label') ||
          carousel.hasAttribute('aria-labelledby')
      ).toBe(true);
    });

    const slides = carousel.querySelector('[aria-live="polite"]');
    const slide = carousel.querySelector('[aria-roledescription="slide"]');

    await step('Slides expose live region and slide semantics', async () => {
      expect(slides).not.toBeNull();
      expect(slides).toHaveAttribute('aria-live', 'polite');
      expect(slides).toHaveAttribute('aria-atomic', 'false');
      expect(slide).not.toBeNull();
      expect(slide).toHaveAttribute('role', 'group');
      expect(slide).toHaveAttribute('aria-roledescription', 'slide');
      expect(slide?.getAttribute('aria-label')).toBeTruthy();
    });

    const previousButton = await within(carousel).findByRole('button', {
      name: options.previousButtonName ?? /previous/i,
    });
    const nextButton = await within(carousel).findByRole('button', {
      name: options.nextButtonName ?? /next/i,
    });

    await step(
      'Carousel navigation buttons have accessible names',
      async () => {
        expect(previousButton.getAttribute('aria-label')).toBeTruthy();
        expect(nextButton.getAttribute('aria-label')).toBeTruthy();
      }
    );

    const initialSlideLabel = slide?.getAttribute('aria-label') ?? '';

    await step('Next button is operable with Enter (2.1.1)', async () => {
      nextButton.focus();
      expect(
        (nextButton.getRootNode() as Document | ShadowRoot).activeElement
      ).toBe(nextButton);
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(slide?.getAttribute('aria-label')).not.toBe(initialSlideLabel);
      });
    });

    await step('Previous button is operable with Space (2.1.1)', async () => {
      previousButton.focus();
      expect(
        (previousButton.getRootNode() as Document | ShadowRoot).activeElement
      ).toBe(previousButton);
      await userEvent.keyboard(' ');

      await waitFor(() => {
        expect(slide).toHaveAttribute('aria-label', initialSlideLabel);
      });
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
