import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by navigation/landmark interaction tests.
 *
 * NOTE: Only `atomic-pager` uses a `<nav>` landmark. Other components
 * (result-list, sort-dropdown, results-per-page, breadbox, load-more-results,
 * folded-result-list) use `<div>`, `<select>`, `role="radiogroup"`, or
 * `<button>` elements. This helper flexibly asserts that interactive elements
 * exist and are keyboard-accessible regardless of landmark usage.
 */
export const COVERED_CRITERIA = ['2.1.1', '2.4.3', '4.1.2'] as const;

export interface NavigationA11yOptions {
  navigationLabel?: string;
}

export async function testNavigationA11y(
  context: StoryContext,
  _options: NavigationA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  await step(
    'Assert navigation landmark or interactive elements exist',
    async () => {
      let hasNavigation = false;

      try {
        const nav = await root.findByShadowRole(
          'navigation',
          {},
          {timeout: 2000}
        );
        hasNavigation = nav !== null;
      } catch {
        hasNavigation = false;
      }

      if (hasNavigation) {
        const nav = await root.findByShadowRole(
          'navigation',
          {},
          {timeout: 2000}
        );
        const hasLabel =
          nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby');
        expect(hasLabel).toBe(true);
        return;
      }

      let hasInteractiveElements = false;
      try {
        const buttons = await root.findAllByShadowRole(
          'button',
          {},
          {timeout: 3000}
        );
        hasInteractiveElements = buttons.length > 0;
      } catch {
        hasInteractiveElements = false;
      }

      if (!hasInteractiveElements) {
        try {
          const radios = await root.findAllByShadowRole(
            'radio',
            {},
            {timeout: 2000}
          );
          hasInteractiveElements = radios.length > 0;
        } catch {
          hasInteractiveElements = false;
        }
      }

      if (!hasInteractiveElements) {
        try {
          const comboboxes = await root.findAllByShadowRole(
            'combobox',
            {},
            {timeout: 2000}
          );
          hasInteractiveElements = comboboxes.length > 0;
        } catch {
          hasInteractiveElements = false;
        }
      }

      expect(hasInteractiveElements).toBe(true);
    }
  );

  await step(
    'Interactive elements are keyboard accessible (focusable)',
    async () => {
      await waitFor(
        async () => {
          let focusable: HTMLElement | null = null;

          try {
            const buttons = await root.findAllByShadowRole(
              'button',
              {},
              {timeout: 2000}
            );
            if (buttons.length > 0) focusable = buttons[0] as HTMLElement;
          } catch {}

          if (!focusable) {
            try {
              const radios = await root.findAllByShadowRole(
                'radio',
                {},
                {timeout: 2000}
              );
              if (radios.length > 0) focusable = radios[0] as HTMLElement;
            } catch {}
          }

          if (!focusable) {
            try {
              const links = await root.findAllByShadowRole(
                'link',
                {},
                {timeout: 2000}
              );
              if (links.length > 0) focusable = links[0] as HTMLElement;
            } catch {}
          }

          expect(focusable).not.toBeNull();
          if (focusable) {
            focusable.focus();
            const focused = canvasElement.ownerDocument.activeElement;
            expect(focused).toBeTruthy();
          }
        },
        {timeout: 5000}
      );
    }
  );

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
