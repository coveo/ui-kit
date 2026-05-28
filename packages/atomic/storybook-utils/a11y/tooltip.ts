import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by tooltip interaction tests.
 *
 * - 1.3.1 Info and Relationships: trigger has semantic relationship to tooltip
 * - 2.1.1 Keyboard: tooltip opens on focus and closes on Escape
 * - 2.1.2 No Keyboard Trap: focus stays on trigger while tooltip is displayed
 */
export const COVERED_CRITERIA = ['1.3.1', '2.1.1', '2.1.2'] as const;

export interface TooltipA11yOptions {
  trigger: {
    role?: string;
    name?: string | RegExp;
  };
}

const isTooltipVisible = (tooltip: HTMLElement) => !tooltip.hidden;

function getActiveElementDeep(doc: Document): Element | null {
  let active: Element | null = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

export async function testTooltipA11y(
  context: StoryContext,
  options: TooltipA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);
  const doc = canvasElement.ownerDocument;

  let status: 'passed' | 'failed' = 'passed';
  try {
    const trigger = await root.findByShadowRole(
      options.trigger.role ?? 'button',
      options.trigger.name ? {name: options.trigger.name} : {},
      {timeout: 5000}
    );

    let tooltip!: HTMLElement;
    let tooltipId = '';

    await step(
      'Tooltip appears on focus and is linked with aria-describedby',
      async () => {
        trigger.focus();
        await waitFor(
          () => {
            const describedBy = trigger.getAttribute('aria-describedby');
            expect(describedBy).toBeTruthy();
            tooltipId = describedBy!.trim().split(/\s+/)[0];
            tooltip = (canvasElement.ownerDocument.getElementById(tooltipId) ??
              canvasElement.querySelector(`#${tooltipId}`)) as HTMLElement;
            expect(tooltip).toBeTruthy();
            expect(tooltip).toHaveAttribute('role', 'tooltip');
            expect(isTooltipVisible(tooltip)).toBe(true);
          },
          {timeout: 5000}
        );
      }
    );

    await step(
      'Tooltip dismisses on Escape and focus remains on trigger',
      async () => {
        await userEvent.keyboard('{Escape}');

        await waitFor(
          () => {
            const tooltipElement = (canvasElement.ownerDocument.getElementById(
              tooltipId
            ) ?? canvasElement.querySelector(`#${tooltipId}`)) as HTMLElement;
            expect(tooltipElement).toBeTruthy();
            expect(isTooltipVisible(tooltipElement)).toBe(false);
            expect(getActiveElementDeep(doc)).toBe(trigger);
          },
          {timeout: 5000}
        );
      }
    );
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
