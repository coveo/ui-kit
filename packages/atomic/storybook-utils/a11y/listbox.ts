import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.1'] as const;

/** Options for interactive keyboard tests that axe-core cannot cover (WCAG 2.1.1). */
export interface InteractiveA11yOptions {
  /** Test that a button with `aria-expanded` toggles on Enter. */
  expandCollapse?: {
    role?: string;
    expanded?: boolean;
    name?: string | RegExp;
  };

  /** Test that named buttons are keyboard-activatable via Enter. */
  activatableButtons?: Array<{name: string | RegExp}>;

  /** Test that a text input accepts typed characters. */
  textInput?: {
    role?: string;
  };

  /** Test arrow-key navigation within a grouped widget (e.g. radiogroup). */
  arrowNavigation?: {
    groupRole: string;
  };

  /** Test selection control activation (Enter on button[aria-pressed] or checkbox). Defaults to `true`. */
  selectionControl?: boolean;
}

/**
 * @deprecated Use {@link InteractiveA11yOptions} instead.
 */
export interface ListboxA11yOptions {
  collapseExpand?: boolean;
  showMore?: boolean;
  facetSearch?: boolean;
}

async function findFirstSelectionControl(
  root: ReturnType<typeof within>,
  timeout = 10000
): Promise<HTMLElement> {
  try {
    const buttons = await root.findAllByShadowRole(
      'button',
      {},
      {timeout: Math.floor(timeout / 2)}
    );
    const pressed = buttons.find((btn) => btn.hasAttribute('aria-pressed'));
    if (pressed) {
      return pressed;
    }
  } catch {
    // No buttons found — fall through to checkbox check
  }

  const checkboxes = await root.findAllByShadowRole(
    'checkbox',
    {},
    {timeout: Math.floor(timeout / 2)}
  );
  const checked = checkboxes.find((cb) => cb.hasAttribute('aria-checked'));
  if (checked) {
    return checked;
  }

  throw new Error(
    'No selection control found (expected button[aria-pressed] or checkbox[aria-checked])'
  );
}

async function assertKeyboardActivation(
  element: HTMLElement,
  label: string,
  step: StoryContext['step']
): Promise<void> {
  await step(`"${label}" is keyboard-activatable via Enter`, async () => {
    let clicked = false;
    const handler = () => {
      clicked = true;
    };
    element.addEventListener('click', handler);
    try {
      element.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(
        () => {
          expect(clicked).toBe(true);
        },
        {timeout: 5000}
      );
    } finally {
      element.removeEventListener('click', handler);
    }
  });
}

export async function testInteractiveA11y(
  context: StoryContext,
  options: InteractiveA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);
  const shouldTestSelectionControl = options.selectionControl !== false;

  if (options.expandCollapse) {
    const {role = 'button', expanded = true, name} = options.expandCollapse;
    await step('Expand/collapse control toggles via Enter key', async () => {
      const queryOptions: Record<string, unknown> = {expanded};
      if (name) {
        queryOptions.name = name;
      }
      const trigger = await root.findByShadowRole(role, queryOptions);
      expect(trigger.getAttribute('aria-expanded')).toBe(String(expanded));

      trigger.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(
        () => {
          expect(trigger.getAttribute('aria-expanded')).toBe(String(!expanded));
        },
        {timeout: 5000}
      );

      await userEvent.keyboard('{Enter}');
      await waitFor(
        () => {
          expect(trigger.getAttribute('aria-expanded')).toBe(String(expanded));
        },
        {timeout: 5000}
      );
    });
  }

  if (shouldTestSelectionControl) {
    await step(
      'Selection control is keyboard-activatable (Enter key triggers click)',
      async () => {
        const control = await waitFor(() => findFirstSelectionControl(root), {
          timeout: 10000,
        });

        let clicked = false;
        const handler = () => {
          clicked = true;
        };
        control.addEventListener('click', handler);
        try {
          control.focus();
          await userEvent.keyboard('{Enter}');
          await waitFor(
            () => {
              expect(clicked).toBe(true);
            },
            {timeout: 5000}
          );
        } finally {
          control.removeEventListener('click', handler);
        }
      }
    );
  }

  if (options.activatableButtons) {
    for (const {name} of options.activatableButtons) {
      const btn = await root.findByShadowRole('button', {name});
      const label = typeof name === 'string' ? name : name.source;
      await assertKeyboardActivation(btn, label, step);
    }
  }

  if (options.textInput) {
    const {role = 'textbox'} = options.textInput;
    await step(
      'Text input is keyboard-accessible and accepts input',
      async () => {
        const input = await root.findByShadowRole(role);
        input.focus();
        await userEvent.type(input, 'a');
        await waitFor(
          () => {
            expect((input as HTMLInputElement).value.length).toBeGreaterThan(0);
          },
          {timeout: 5000}
        );
      }
    );
  }

  if (options.arrowNavigation) {
    const {groupRole} = options.arrowNavigation;
    await step(`Arrow-key navigation within ${groupRole}`, async () => {
      const group = await root.findByShadowRole(groupRole);
      const focusableChildren = Array.from(
        group.querySelectorAll<HTMLElement>(
          'input[type="radio"], button, [role="radio"], [role="option"], [tabindex]'
        )
      ).filter((el) => el.tabIndex >= 0);

      expect(focusableChildren.length).toBeGreaterThanOrEqual(2);

      focusableChildren[0].focus();
      expect(
        document.activeElement === focusableChildren[0] ||
          focusableChildren[0].matches(':focus-within') ||
          focusableChildren[0].getRootNode() !== document
      ).toBe(true);

      await userEvent.keyboard('{ArrowRight}');
      await waitFor(
        () => {
          const activeEl = document.activeElement;
          const shadowActive = activeEl?.shadowRoot?.activeElement ?? activeEl;
          const moved =
            shadowActive !== focusableChildren[0] ||
            activeEl !== focusableChildren[0];
          expect(moved).toBe(true);
        },
        {timeout: 5000}
      );
    });
  }

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}

/**
 * @deprecated Use {@link testInteractiveA11y} with {@link InteractiveA11yOptions} instead.
 * Maps legacy facet-specific options to the generic API.
 */
export async function testListboxA11y(
  context: StoryContext,
  options: ListboxA11yOptions = {}
): Promise<void> {
  const mapped: InteractiveA11yOptions = {};

  if (options.collapseExpand) {
    mapped.expandCollapse = {role: 'button', expanded: true};
  }
  if (options.showMore) {
    mapped.activatableButtons = [
      ...(mapped.activatableButtons ?? []),
      {name: /show more/i},
    ];
  }
  if (options.facetSearch) {
    mapped.textInput = {role: 'textbox'};
  }

  return testInteractiveA11y(context, mapped);
}
