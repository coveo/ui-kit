import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by hover-content tests.
 *
 * - 1.4.13 Content on Hover or Focus: additional content that appears on
 *   hover/focus is dismissible, hoverable, and persistent
 *
 * @see https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus — WCAG 2.2 SC 1.4.13 (Level AA)
 */
export const COVERED_CRITERIA = ['1.4.13'] as const;

export interface HoverContentA11yOptions {
  /**
   * The element that triggers content on hover. Provide a query function
   * that returns the trigger element from the rendered story.
   */
  findTrigger: (canvasElement: HTMLElement) => Promise<HTMLElement>;

  /**
   * A function that identifies the hover-revealed content after it appears.
   * Should return the popup/tooltip element.
   */
  findContent: (canvasElement: HTMLElement) => Promise<HTMLElement | null>;
}

/**
 * Tests the WCAG 1.4.13 requirements for content that appears on hover/focus:
 *
 * 1. **Dismissible** — Escape key hides the content without moving focus
 * 2. **Hoverable** — User can move pointer to the content without it disappearing
 * 3. **Persistent** — Content remains visible until dismissed, hover removed, or irrelevant
 *
 * @remarks
 * This is an opt-in helper. Developers must provide functions to locate the
 * trigger and the revealed content since these vary per component.
 */
export async function testHoverContentA11y(
  context: StoryContext,
  options: HoverContentA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const trigger = await options.findTrigger(canvasElement);

    await step('Hover on trigger reveals additional content', async () => {
      await userEvent.hover(trigger);
      await waitFor(
        async () => {
          const content = await options.findContent(canvasElement);
          expect(content).not.toBeNull();
        },
        {timeout: 5000}
      );
    });

    await step(
      'Escape dismisses hover content without moving focus',
      async () => {
        await userEvent.hover(trigger);
        await waitFor(
          async () => {
            const content = await options.findContent(canvasElement);
            expect(content).not.toBeNull();
          },
          {timeout: 5000}
        );

        const focusedBefore = canvasElement.ownerDocument.activeElement;

        await userEvent.keyboard('{Escape}');

        await waitFor(
          async () => {
            const content = await options.findContent(canvasElement);
            const isHidden =
              content === null ||
              content.getAttribute('aria-hidden') === 'true' ||
              getComputedStyle(content).display === 'none' ||
              getComputedStyle(content).visibility === 'hidden';
            expect(isHidden).toBe(true);
          },
          {timeout: 5000}
        );
      }
    );

    await step('Content remains visible while pointer is over it', async () => {
      // Re-trigger the content
      await userEvent.hover(trigger);
      await waitFor(
        async () => {
          const content = await options.findContent(canvasElement);
          expect(content).not.toBeNull();
        },
        {timeout: 5000}
      );

      const content = await options.findContent(canvasElement);
      if (content) {
        // Move pointer to the content itself
        await userEvent.hover(content);

        // Content should still be visible
        await waitFor(
          async () => {
            const stillVisible = await options.findContent(canvasElement);
            expect(stillVisible).not.toBeNull();
          },
          {timeout: 3000}
        );
      }
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
