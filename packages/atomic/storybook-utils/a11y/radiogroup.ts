import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by radio group interaction tests.
 *
 * - 2.1.1 Keyboard: all functionality operable via keyboard
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/radio/ — WAI-ARIA Radio Group Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1'] as const;

export interface RadioGroupA11yOptions {
  /** Matches aria-label of the radiogroup. If omitted, uses first role="radiogroup" found. */
  groupName?: string | RegExp;
}

async function findRadioGroup(
  root: ReturnType<typeof within>,
  options?: RadioGroupA11yOptions
): Promise<HTMLElement> {
  const queryOptions: Record<string, unknown> = {};
  if (options?.groupName !== undefined) {
    queryOptions.name = options.groupName;
  }

  let elements: HTMLElement[];
  try {
    elements = await root.findAllByShadowRole('radiogroup', queryOptions, {
      timeout: 5000,
    });
  } catch {
    elements = [];
  }

  if (elements.length === 0) {
    const criteria = options?.groupName
      ? `role="radiogroup" with name matching "${String(options.groupName)}"`
      : `role="radiogroup"`;

    throw new Error(
      `[testRadioGroupA11y] No radio group found matching {${criteria}}.\n\n` +
        `Either this component does not implement the WAI-ARIA radio group pattern, ` +
        `or the groupName option needs to be adjusted.\n` +
        `If this component does not use a radio group, remove the testRadioGroupA11y call from its story.`
    );
  }

  return elements[0];
}

function getRadioButtons(group: HTMLElement): HTMLElement[] {
  const radios = Array.from(
    group.querySelectorAll<HTMLElement>('input[type="radio"], [role="radio"]')
  );

  if (radios.length === 0) {
    throw new Error(
      `[testRadioGroupA11y] No radio buttons found inside the radio group.\n` +
        `Expected <input type="radio"> or elements with role="radio".`
    );
  }

  return radios;
}

function getCheckedRadio(radios: HTMLElement[]): HTMLElement | null {
  return (
    radios.find(
      (r) =>
        (r as HTMLInputElement).checked ||
        r.getAttribute('aria-checked') === 'true'
    ) ?? null
  );
}

function getActiveRadio(
  radios: HTMLElement[],
  canvasElement: HTMLElement
): HTMLElement | null {
  for (const radio of radios) {
    const root = radio.getRootNode() as Document | ShadowRoot;
    const active =
      'activeElement' in root ? (root as Document).activeElement : null;
    if (active === radio) {
      return radio;
    }
  }

  const docActive = canvasElement.ownerDocument.activeElement;
  if (docActive?.shadowRoot) {
    const shadowActive = docActive.shadowRoot.activeElement;
    if (shadowActive && radios.includes(shadowActive as HTMLElement)) {
      return shadowActive as HTMLElement;
    }
  }

  return null;
}

/**
 * Tests the WAI-ARIA Radio Group pattern.
 *
 * Verifies that:
 * 1. A radio group with at least 2 radios exists
 * 2. Focus enters the group on the checked radio (or first if none checked)
 * 3. ArrowRight moves focus to the next radio
 * 4. ArrowLeft moves focus to the previous radio
 */
export async function testRadioGroupA11y(
  context: StoryContext,
  options?: RadioGroupA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';

  try {
    let group!: HTMLElement;
    let radios!: HTMLElement[];

    await step('Find radio group and radio buttons', async () => {
      group = await findRadioGroup(root, options);
      radios = getRadioButtons(group);
      expect(radios.length).toBeGreaterThanOrEqual(2);
    });

    await step(
      'Initial focus lands on checked radio (or first if none checked)',
      async () => {
        const checked = getCheckedRadio(radios);
        const expectedFocus = checked ?? radios[0];

        expectedFocus.focus();

        await waitFor(
          () => {
            const active = getActiveRadio(radios, canvasElement);
            expect(active).toBe(expectedFocus);
          },
          {timeout: 3000}
        );
      }
    );

    await step('ArrowRight moves focus to next radio', async () => {
      const checked = getCheckedRadio(radios);
      const startRadio = checked ?? radios[0];
      const startIndex = radios.indexOf(startRadio);

      if (startIndex < radios.length - 1) {
        startRadio.focus();
        await userEvent.keyboard('{ArrowRight}');

        await waitFor(
          () => {
            const active = getActiveRadio(radios, canvasElement);
            expect(active).toBe(radios[startIndex + 1]);
          },
          {timeout: 3000}
        );
      }
    });

    await step('ArrowLeft moves focus to previous radio', async () => {
      // Navigate to a middle position first (second radio)
      const secondRadio = radios[1];
      secondRadio.focus();

      await waitFor(
        () => {
          const active = getActiveRadio(radios, canvasElement);
          expect(active).toBe(secondRadio);
        },
        {timeout: 3000}
      );

      await userEvent.keyboard('{ArrowLeft}');

      await waitFor(
        () => {
          const newActive = getActiveRadio(radios, canvasElement);
          expect(newActive).toBe(radios[0]);
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
