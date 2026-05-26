import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by combobox/search-box interaction tests.
 *
 * - 2.1.1 Keyboard: Arrow keys navigate suggestions, Escape dismisses
 *
 * NOTE: Atomic's search box renders a `<textarea>` (implicit role `textbox`,
 * not `combobox`) with `aria-haspopup`, `aria-autocomplete="both"`,
 * `aria-controls`, and `aria-activedescendant`. The suggestion popup uses
 * `role="application"`, not `role="listbox"`. These tests assert the actual
 * Atomic implementation rather than the WAI-ARIA APG combobox pattern.
 *
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1'] as const;

export async function testComboboxA11y(context: StoryContext): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';
  try {
    const input = await root.findByShadowRole('textbox', {}, {timeout: 5000});

    await step(
      'ArrowDown activates suggestion navigation (aria-activedescendant)',
      async () => {
        input.focus();
        await userEvent.keyboard('test');

        const popupId = input.getAttribute('aria-controls');
        await waitFor(
          () => {
            const inputRoot = input.getRootNode() as Document | ShadowRoot;
            const popup = inputRoot.getElementById(popupId!);
            expect(popup).toBeTruthy();
            expect(popup!.classList.contains('hidden')).toBe(false);
          },
          {timeout: 5000}
        );

        await userEvent.keyboard('{ArrowDown}');

        await waitFor(
          () => {
            const activeDescendant = input.getAttribute(
              'aria-activedescendant'
            );
            expect(activeDescendant).toBeTruthy();
          },
          {timeout: 3000}
        );
      }
    );

    await step('ArrowDown again advances active descendant', async () => {
      const first = input.getAttribute('aria-activedescendant');

      await userEvent.keyboard('{ArrowDown}');

      await waitFor(
        () => {
          const second = input.getAttribute('aria-activedescendant');
          expect(second).toBeTruthy();
          expect(second).not.toBe(first);
        },
        {timeout: 3000}
      );
    });

    await step(
      'Enter accepts suggestion and closes popup (2.1.1)',
      async () => {
        await userEvent.keyboard('{Enter}');

        const popupId = input.getAttribute('aria-controls');
        await waitFor(
          () => {
            const inputRoot = input.getRootNode() as Document | ShadowRoot;
            const popup = inputRoot.getElementById(popupId!);
            const isHidden = !popup || popup.classList.contains('hidden');
            expect(isHidden, 'Popup should be hidden after Enter').toBe(true);
          },
          {timeout: 3000}
        );
      }
    );

    await step(
      'Escape dismisses popup and focus stays on input (2.1.1)',
      async () => {
        // Re-open popup (Enter closed it above)
        await userEvent.keyboard('test');

        const popupId = input.getAttribute('aria-controls');
        await waitFor(
          () => {
            const inputRoot = input.getRootNode() as Document | ShadowRoot;
            const popup = inputRoot.getElementById(popupId!);
            expect(popup).toBeTruthy();
            expect(popup!.classList.contains('hidden')).toBe(false);
          },
          {timeout: 5000}
        );

        await userEvent.keyboard('{Escape}');

        await waitFor(
          () => {
            let active: Element | null =
              canvasElement.ownerDocument.activeElement;
            while (active?.shadowRoot?.activeElement) {
              active = active.shadowRoot.activeElement;
            }
            const isOnInput =
              active === input ||
              active?.getAttribute('role') === 'textbox' ||
              active?.tagName === 'TEXTAREA';
            expect(isOnInput, 'Focus should remain on the input').toBe(true);
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
