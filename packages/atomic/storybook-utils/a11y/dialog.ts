import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';

/**
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export const COVERED_CRITERIA = ['2.4.3', '4.1.2'] as const;

export interface DialogA11yOptions {
  expectedLabel?: string | RegExp;
}

function getActiveElementDeep(doc: Document): Element | null {
  let active: Element | null = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function getComposedParent(node: Node): Node | null {
  if (node instanceof Element && node.assignedSlot) {
    return node.assignedSlot;
  }

  const parentNode = node.parentNode;
  if (parentNode) {
    return parentNode;
  }

  const rootNode = node.getRootNode();
  return rootNode instanceof ShadowRoot ? rootNode.host : null;
}

function isInComposedTree(element: Element, container: Element): boolean {
  let current: Node | null = element;

  while (current) {
    if (current === container) {
      return true;
    }
    current = getComposedParent(current);
  }

  return false;
}

async function findDialog(
  canvasElement: HTMLElement,
  options?: DialogA11yOptions
): Promise<HTMLElement> {
  const root = within(canvasElement);
  const queryOptions: Record<string, unknown> = {};
  if (options?.expectedLabel) {
    queryOptions.name = options.expectedLabel;
  }

  const dialogs = await root.findAllByShadowRole('dialog', queryOptions, {
    timeout: 5000,
  });

  const activeDialogs = dialogs.filter(
    (dialog) => dialog.getAttribute('aria-modal') === 'true'
  );

  return (activeDialogs.at(-1) ?? dialogs.at(-1))!;
}

export async function testDialogA11y(
  context: StoryContext,
  options?: DialogA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const doc = canvasElement.ownerDocument;

  let status: 'passed' | 'failed' = 'passed';
  try {
    let dialog!: HTMLElement;

    await step('Find modal dialog element', async () => {
      dialog = await findDialog(canvasElement, options);
      expect(dialog).toBeInTheDocument();
    });

    await step('Dialog has an accessible label', async () => {
      const ariaLabel = dialog.getAttribute('aria-label')?.trim();
      const ariaLabelledBy = dialog.getAttribute('aria-labelledby')?.trim();
      expect(Boolean(ariaLabel || ariaLabelledBy)).toBe(true);
    });

    await step('Initial focus is managed inside the dialog', async () => {
      await waitFor(
        () => {
          const active = getActiveElementDeep(doc);

          expect(active).not.toBeNull();
          expect(dialog.matches(':focus-within')).toBe(true);
          expect(isInComposedTree(active!, dialog)).toBe(true);
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
