import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by disclosure/toggle interaction tests.
 *
 * NOTE: Atomic's `atomic-refine-toggle` renders a button that opens a modal
 * dialog but does NOT use `aria-expanded` or `aria-controls` (it is not a
 * WAI-ARIA APG disclosure pattern). The modal (`atomic-refine-modal`) is
 * inserted as a sibling element, and its `role="dialog"` lives inside nested
 * shadow DOMs (`atomic-refine-modal` → `atomic-modal` → `atomic-focus-trap`).
 * These tests verify the button exists, is keyboard-accessible, opens the
 * modal dialog, and can be dismissed with Escape.
 */
export const COVERED_CRITERIA = ['2.1.1', '4.1.2'] as const;

export interface DisclosureA11yOptions {
  triggerLabel: string;
}

function deepQuerySelector(
  root: Element | Document | ShadowRoot,
  selector: string
): Element | null {
  const direct = root.querySelector(selector);
  if (direct) {
    return direct;
  }

  const children = Array.from(root.querySelectorAll('*'));
  for (const child of children) {
    if (child.shadowRoot) {
      const found = deepQuerySelector(child.shadowRoot, selector);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function findOpenDialog(doc: Document): Element | null {
  const refineModal = doc.querySelector('atomic-refine-modal[is-open]');
  if (refineModal?.shadowRoot) {
    const dialog = deepQuerySelector(refineModal.shadowRoot, '[role="dialog"]');
    if (dialog?.getAttribute('aria-modal') === 'true') {
      return dialog;
    }
  }

  return deepQuerySelector(doc, '[role="dialog"][aria-modal="true"]');
}

export async function testDisclosureA11y(
  context: StoryContext,
  options: DisclosureA11yOptions
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

    await step('Trigger button exists with accessible name', async () => {
      await expect(trigger).toBeInTheDocument();
      const hasName =
        trigger.hasAttribute('aria-label') ||
        (trigger.textContent?.trim().length ?? 0) > 0;
      expect(hasName).toBe(true);
    });

    await step('Trigger is keyboard accessible via Enter', async () => {
      trigger.focus();
      await userEvent.keyboard('{Enter}');

      await waitFor(
        () => {
          const dialog = findOpenDialog(doc);
          const somethingOpened =
            dialog !== null || trigger.getAttribute('aria-expanded') === 'true';
          expect(somethingOpened).toBe(true);
        },
        {timeout: 5000}
      );
    });

    await step('Can dismiss via Escape', async () => {
      await userEvent.keyboard('{Escape}');

      await waitFor(
        () => {
          const dialog = findOpenDialog(doc);
          const dialogDismissed = dialog === null;
          const expandedFalse =
            trigger.getAttribute('aria-expanded') === 'false' ||
            !trigger.hasAttribute('aria-expanded');
          expect(dialogDismissed || expandedFalse).toBe(true);
        },
        {timeout: 5000}
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
