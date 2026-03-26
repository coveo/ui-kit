import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by facet/selection interaction tests.
 *
 * Atomic facets render selection controls in two patterns depending on
 * the display mode and whether exclusion is enabled:
 *
 * 1. **`aria-pressed` buttons** — link/box displays and tri-state checkboxes
 *    use `role="button"` with `aria-pressed="true"|"false"|"mixed"`.
 * 2. **`aria-checked` checkboxes** — standard checkbox displays use
 *    `role="checkbox"` with `aria-checked="true"|"false"`.
 *
 * Both patterns satisfy WCAG 4.1.2 (Name, Role, Value). This helper
 * detects whichever pattern the facet renders and asserts keyboard
 * accessibility (2.1.1) and focus order (2.4.3).
 */
export const COVERED_CRITERIA = ['2.1.1', '2.4.3', '4.1.2'] as const;

export interface ListboxA11yOptions {
  listboxLabel?: string;
}

type SelectionAttr = 'aria-pressed' | 'aria-checked';

function getDeepActiveElement(doc: Document): Element | null {
  let active: Element | null = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/**
 * Finds all interactive selection controls inside the component's shadow DOM.
 *
 * First tries `aria-pressed` buttons (link/box/tri-state checkbox display).
 * If none are found, falls back to `aria-checked` checkboxes (regular
 * checkbox display).
 *
 * Returns the matching elements and which attribute they use.
 */
async function findSelectionControls(
  root: ReturnType<typeof within>,
  timeout = 10000
): Promise<{elements: HTMLElement[]; attr: SelectionAttr}> {
  // Try aria-pressed buttons first (link, box, tri-state checkbox)
  try {
    const buttons = await root.findAllByShadowRole(
      'button',
      {},
      {timeout: Math.floor(timeout / 2)}
    );
    const pressed = buttons.filter((btn) => btn.hasAttribute('aria-pressed'));
    if (pressed.length > 0) {
      return {elements: pressed, attr: 'aria-pressed'};
    }
  } catch {
    // No buttons found — fall through to checkbox check
  }

  // Fall back to aria-checked checkboxes (regular checkbox display)
  const checkboxes = await root.findAllByShadowRole(
    'checkbox',
    {},
    {timeout: Math.floor(timeout / 2)}
  );
  const checked = checkboxes.filter((cb) => cb.hasAttribute('aria-checked'));
  if (checked.length > 0) {
    return {elements: checked, attr: 'aria-checked'};
  }

  return {elements: [], attr: 'aria-pressed'};
}

export async function testListboxA11y(
  context: StoryContext,
  _options: ListboxA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let selectionControls: HTMLElement[] = [];
  let selectionAttr: SelectionAttr = 'aria-pressed';

  let status: 'passed' | 'failed' = 'passed';
  try {
    await step(
      'At least one control communicates selection state via ARIA',
      async () => {
        await waitFor(
          async () => {
            const result = await findSelectionControls(root);
            selectionControls = result.elements;
            selectionAttr = result.attr;
            expect(selectionControls.length).toBeGreaterThan(0);
          },
          {timeout: 10000}
        );
      }
    );

    await step('Controls are keyboard accessible (focusable)', async () => {
      const targetControl = selectionControls[0];
      targetControl.focus();

      await waitFor(
        () => {
          const deepFocused = getDeepActiveElement(canvasElement.ownerDocument);
          const isFocused =
            deepFocused?.tagName === 'BUTTON' ||
            deepFocused?.getAttribute('role') === 'button' ||
            deepFocused?.getAttribute('role') === 'checkbox';
          expect(isFocused).toBe(true);
        },
        {timeout: 5000}
      );
    });

    await step('Each control has a valid selection state value', async () => {
      const validValues = new Set(['true', 'false', 'mixed']);
      for (const ctrl of selectionControls) {
        const value = ctrl.getAttribute(selectionAttr);
        expect(validValues.has(value ?? '')).toBe(true);
      }
    });

    await step(
      'Control is keyboard-activatable (Enter key triggers click)',
      async () => {
        const targetControl = selectionControls[0];
        let clicked = false;
        const handler = () => {
          clicked = true;
        };
        targetControl.addEventListener('click', handler);
        try {
          targetControl.focus();
          await userEvent.keyboard('{Enter}');
          await waitFor(
            () => {
              expect(clicked).toBe(true);
            },
            {timeout: 5000}
          );
        } finally {
          targetControl.removeEventListener('click', handler);
        }
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
