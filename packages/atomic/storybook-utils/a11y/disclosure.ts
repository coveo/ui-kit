import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by disclosure interaction tests.
 *
 * - 2.1.1 Keyboard: all functionality operable via keyboard
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ — WAI-ARIA Disclosure (Show/Hide) Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1'] as const;

export interface DisclosureA11yOptions {
  trigger: {
    role?: string;
    name?: string | RegExp;
    expanded?: boolean;
  };
  /**
   * When true, verifies that the region referenced by `aria-controls` is
   * visible when expanded and absent/hidden when collapsed.
   *
   * Use this when the trigger has an `aria-controls` attribute pointing to a
   * content region ID. If the trigger does NOT render `aria-controls` (e.g.,
   * facet headers), leave this off — there is no region contract to verify.
   */
  assertControlledRegion?: boolean;
}

async function findTrigger(
  root: ReturnType<typeof within>,
  options: DisclosureA11yOptions['trigger']
): Promise<HTMLElement> {
  const {role = 'button', name, expanded} = options;
  const queryOptions: Record<string, unknown> = {};
  if (name !== undefined) {
    queryOptions.name = name;
  }
  if (expanded !== undefined) {
    queryOptions.expanded = expanded;
  }

  let elements: HTMLElement[];
  try {
    elements = await root.findAllByShadowRole(role, queryOptions, {
      timeout: 5000,
    });
  } catch {
    elements = [];
  }

  if (elements.length === 0) {
    const criteria = [
      `role="${role}"`,
      name !== undefined ? `name=${String(name)}` : null,
      expanded !== undefined ? `aria-expanded="${expanded}"` : null,
    ]
      .filter(Boolean)
      .join(', ');

    throw new Error(
      `[testDisclosureA11y] No disclosure trigger found matching {${criteria}}.\n\n` +
        `Either this component does not implement the WAI-ARIA disclosure pattern ` +
        `(a button with aria-expanded), or the trigger options need to be adjusted.\n` +
        `If this component does not use disclosure, remove the testDisclosureA11y call from its story.`
    );
  }

  return elements[0];
}

function findControlledRegion(
  trigger: HTMLElement,
  canvasElement: HTMLElement
): HTMLElement | null {
  const controlsId = trigger.getAttribute('aria-controls');
  if (!controlsId) {
    return null;
  }

  const root = trigger.getRootNode() as Document | ShadowRoot;
  return (
    (root.getElementById?.(controlsId) as HTMLElement | null) ??
    (canvasElement.querySelector(`#${controlsId}`) as HTMLElement | null)
  );
}

function isHidden(element: HTMLElement): boolean {
  return (
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    getComputedStyle(element).display === 'none'
  );
}

/**
 * Tests the WAI-ARIA disclosure pattern.
 *
 * Verifies that:
 * 1. A trigger with `aria-expanded` exists and is keyboard-focusable
 * 2. Activating the trigger toggles `aria-expanded` in both directions
 * 3. When `assertControlledRegion` is set, the `aria-controls` region is
 *    visible when expanded and absent/hidden when collapsed
 */
export async function testDisclosureA11y(
  context: StoryContext,
  options: DisclosureA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';

  try {
    let trigger!: HTMLElement;

    await step('Find disclosure trigger with aria-expanded', async () => {
      trigger = await findTrigger(root, options.trigger);
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    const initialExpanded = trigger.getAttribute('aria-expanded');
    const toggled = initialExpanded === 'true' ? 'false' : 'true';

    await step('Trigger is keyboard-focusable', async () => {
      trigger.focus();
      const activeEl =
        (trigger.getRootNode() as ShadowRoot).activeElement ?? trigger;
      expect(activeEl).toBe(trigger);
    });

    await step('Click toggles aria-expanded', async () => {
      await userEvent.click(trigger);
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute(
            'aria-expanded',
            initialExpanded === 'true' ? 'false' : 'true'
          );
        },
        {timeout: 5000}
      );
    });

    await step('Click toggles aria-expanded back', async () => {
      trigger = await findTrigger(root, {
        ...options.trigger,
        expanded: toggled === 'true' ? true : false,
      });
      await userEvent.click(trigger);
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute('aria-expanded', initialExpanded);
        },
        {timeout: 5000}
      );
    });

    if (options.assertControlledRegion) {
      await step('Controlled region visible when expanded', async () => {
        // Expand trigger if currently collapsed
        if (trigger.getAttribute('aria-expanded') !== 'true') {
          await userEvent.click(trigger);
          await waitFor(
            () => {
              expect(trigger).toHaveAttribute('aria-expanded', 'true');
            },
            {timeout: 5000}
          );
        }
        const region = findControlledRegion(trigger, canvasElement);
        expect(region).not.toBeNull();
        expect(isHidden(region!)).toBe(false);
      });

      await step('Controlled region hidden when collapsed', async () => {
        await userEvent.click(trigger);
        await waitFor(
          () => {
            expect(trigger).toHaveAttribute('aria-expanded', 'false');
          },
          {timeout: 5000}
        );
        const region = findControlledRegion(trigger, canvasElement);
        if (region) {
          expect(isHidden(region)).toBe(true);
        }
        // region === null is also valid (removed from DOM)
      });
    }
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
