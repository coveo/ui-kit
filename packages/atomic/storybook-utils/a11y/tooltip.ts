import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by tooltip interaction tests.
 *
 * - 1.4.13 Content on Hover or Focus: tooltip visible on hover and focus, dismissible via Escape
 * - 4.1.2 Name, Role, Value: tooltip has role="tooltip" and trigger has aria-describedby
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/ — WAI-ARIA Tooltip Pattern
 * @see https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus — WCAG 2.2 SC 1.4.13
 * @see https://www.w3.org/TR/WCAG22/#name-role-value — WCAG 2.2 SC 4.1.2
 */
export const COVERED_CRITERIA = ['1.4.13', '4.1.2'] as const;

export interface TooltipA11yOptions {
  /** ARIA role to find the trigger element. Defaults to 'button'. */
  triggerRole?: string;
}

/**
 * Tests the WAI-ARIA Tooltip pattern.
 *
 * Verifies that:
 * 1. A trigger element with `aria-describedby` exists
 * 2. The referenced element has `role="tooltip"`
 * 3. Tooltip becomes visible on focus (CSS visibility/opacity)
 * 4. Escape key dismisses the tooltip
 */
export async function testTooltipA11y(
  context: StoryContext,
  options?: TooltipA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const root = within(canvasElement);
    let trigger!: HTMLElement;
    let tooltipId!: string;

    await step('Find trigger element with aria-describedby', async () => {
      const role = options?.triggerRole ?? 'button';
      await waitFor(
        async () => {
          const elements = await root.findAllByShadowRole(
            role,
            {},
            {timeout: 5000}
          );
          const withDescribedBy = elements.filter((el) =>
            el.hasAttribute('aria-describedby')
          );
          expect(withDescribedBy.length).toBeGreaterThanOrEqual(1);
          trigger = withDescribedBy[0];
          tooltipId = trigger.getAttribute('aria-describedby')!;
        },
        {timeout: 10000}
      );
    });

    await step('Referenced element has role="tooltip"', async () => {
      const shadowRoot = trigger.getRootNode() as ShadowRoot | Document;
      const tooltip = shadowRoot.getElementById(tooltipId);
      expect(tooltip).not.toBeNull();
      expect(tooltip!.getAttribute('role')).toBe('tooltip');
    });

    await step('Tooltip becomes visible on focus', async () => {
      await userEvent.tab();
      trigger.focus();

      await waitFor(
        () => {
          const shadowRoot = trigger.getRootNode() as ShadowRoot | Document;
          const tooltip = shadowRoot.getElementById(tooltipId);
          expect(tooltip).not.toBeNull();

          const style = window.getComputedStyle(tooltip!);
          const isVisible =
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            parseFloat(style.opacity) > 0;
          expect(isVisible).toBe(true);
        },
        {timeout: 3000}
      );
    });

    await step('Escape key dismisses tooltip', async () => {
      trigger.focus();
      await userEvent.keyboard('{Escape}');

      await waitFor(
        () => {
          const shadowRoot = trigger.getRootNode() as ShadowRoot | Document;
          const tooltip = shadowRoot.getElementById(tooltipId);
          expect(tooltip).not.toBeNull();

          const style = window.getComputedStyle(tooltip!);
          const isHidden =
            style.visibility === 'hidden' ||
            style.display === 'none' ||
            parseFloat(style.opacity) === 0;
          expect(isHidden).toBe(true);
        },
        {timeout: 3000}
      );
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
