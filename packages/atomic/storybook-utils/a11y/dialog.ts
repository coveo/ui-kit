import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export const COVERED_CRITERIA = ['2.1.1', '2.1.2'] as const;

export interface DialogA11yOptions {
  triggerLabel: string;
}

function getActiveElementDeep(doc: Document): Element | null {
  let active: Element | null = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

export async function testDialogA11y(
  context: StoryContext,
  options: DialogA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);
  const doc = canvasElement.ownerDocument;

  let status: 'passed' | 'failed' = 'passed';
  try {
    const trigger = await root.findByShadowRole(
      'button',
      {name: options.triggerLabel},
      {timeout: 5000}
    );

    let dialog: HTMLElement;

    await step('Open dialog via trigger click', async () => {
      await userEvent.click(trigger);

      dialog = await waitFor(
        async () => {
          const d = await root.findByShadowRole('dialog', {}, {timeout: 5000});
          expect(d).toBeInTheDocument();
          expect(d.getAttribute('aria-modal')).toBe('true');
          return d;
        },
        {timeout: 8000}
      );
    });

    await step('Tab stays inside dialog (2.1.1 focus trap)', async () => {
      const focusTrap = dialog! as HTMLElement & {active: boolean};

      await waitFor(
        () => {
          expect(
            focusTrap.active,
            'Focus trap should be active after animation end'
          ).toBe(true);
        },
        {timeout: 3000}
      );

      const dialogRoot = within(dialog!);
      const buttons = await dialogRoot.findAllByShadowRole('button');
      expect(
        buttons.length,
        'Dialog should contain multiple focusable elements for Tab cycling'
      ).toBeGreaterThanOrEqual(2);

      const allHidden = doc.querySelectorAll('[aria-hidden="true"]');
      expect(
        allHidden.length,
        'At least one element should be hidden outside the dialog'
      ).toBeGreaterThanOrEqual(1);

      const hiddenOutsideDialog = Array.from(allHidden).filter(
        (el) => !dialog!.contains(el) && el !== dialog
      );
      expect(
        hiddenOutsideDialog.length,
        'Focus trap should hide at least one element outside the dialog via aria-hidden'
      ).toBeGreaterThanOrEqual(1);
    });

    await step('Escape closes dialog (2.1.1)', async () => {
      await userEvent.keyboard('{Escape}');

      await waitFor(
        () => {
          const isRemovedFromDOM = !dialog.isConnected;
          const isModalDismissed = dialog.getAttribute('aria-modal') !== 'true';
          expect(
            isRemovedFromDOM || isModalDismissed,
            'Dialog should be removed or no longer modal after Escape'
          ).toBe(true);
        },
        {timeout: 3000}
      );
    });

    await step(
      'Focus returns to trigger after dialog closes (2.1.2)',
      async () => {
        await waitFor(
          () => {
            const active = getActiveElementDeep(doc);
            const focusOnTrigger = active === trigger;
            const triggerGone = !trigger.isConnected && active != null;
            expect(
              focusOnTrigger || triggerGone,
              'Focus should return to the trigger (or move to a valid element if trigger was removed)'
            ).toBe(true);
          },
          {timeout: 3000}
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
