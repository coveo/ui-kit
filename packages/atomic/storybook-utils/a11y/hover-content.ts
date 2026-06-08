import type {StoryContext} from '@storybook/web-components-vite';
import {expect, userEvent, waitFor} from 'storybook/test';

const HOVER_STABILITY_DELAY_MS = 200;

/**
 * WCAG 2.2 AA criteria covered by hover-content tests.
 *
 * - 1.4.13 Content on Hover or Focus: additional content that appears on
 *   hover/focus is dismissible, hoverable, and persistent
 *
 * @see https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus — WCAG 2.2 SC 1.4.13 (Level AA)
 */
export const COVERED_CRITERIA = ['1.4.13'] as const;

export interface HoverContentA11yOptions {
  /**
   * The element that triggers content on hover. Provide a query function
   * that returns the trigger element from the rendered story.
   */
  findTrigger: (canvasElement: HTMLElement) => Promise<HTMLElement>;

  /**
   * A function that identifies the hover-revealed content after it appears.
   * Should return the popup/tooltip element.
   */
  findContent: (canvasElement: HTMLElement) => Promise<HTMLElement | null>;
}

function getActiveElementDeep(doc: Document): Element | null {
  let active: Element | null = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function isElementOrShadowDescendant(
  container: HTMLElement,
  element: Element | null
): boolean {
  let current = element;
  while (current) {
    if (current === container || container.contains(current)) {
      return true;
    }

    if (current.parentElement) {
      current = current.parentElement;
      continue;
    }

    const root = current.getRootNode();
    current = root instanceof ShadowRoot ? root.host : null;
  }

  return false;
}

async function expectContentVisible(
  canvasElement: HTMLElement,
  options: HoverContentA11yOptions
): Promise<HTMLElement> {
  const content = await options.findContent(canvasElement);
  expect(
    content,
    'Hover content should be visible, not just mounted'
  ).toBeVisible();
  expect(content).not.toHaveAttribute('aria-hidden', 'true');
  return content!;
}

async function expectContentHidden(
  canvasElement: HTMLElement,
  options: HoverContentA11yOptions
): Promise<void> {
  const content = await options.findContent(canvasElement);
  if (content === null || content.getAttribute('aria-hidden') === 'true') {
    return;
  }

  expect(
    content,
    'Hover content should be hidden after Escape'
  ).not.toBeVisible();
}

async function waitForVisibleContent(
  canvasElement: HTMLElement,
  options: HoverContentA11yOptions
): Promise<HTMLElement> {
  return waitFor(async () => expectContentVisible(canvasElement, options), {
    timeout: 5000,
  });
}

async function revealContent(
  trigger: HTMLElement,
  canvasElement: HTMLElement,
  options: HoverContentA11yOptions
): Promise<HTMLElement> {
  await userEvent.hover(trigger);
  return waitForVisibleContent(canvasElement, options);
}

/**
 * Tests the WCAG 1.4.13 requirements for content that appears on hover/focus:
 *
 * 1. **Dismissible** — Escape key hides the content without moving focus
 * 2. **Hoverable** — User can move pointer to the content without it disappearing
 * 3. **Persistent** — Content remains visible until dismissed, hover removed, or irrelevant
 *
 * @remarks
 * This is an opt-in helper. Developers must provide functions to locate the
 * trigger and the revealed content since these vary per component.
 */
export async function testHoverContentA11y(
  context: StoryContext,
  options: HoverContentA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const doc = canvasElement.ownerDocument;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const trigger = await options.findTrigger(canvasElement);

    await step('Hover on trigger reveals persistent content', async () => {
      await revealContent(trigger, canvasElement, options);
      await new Promise((resolve) =>
        setTimeout(resolve, HOVER_STABILITY_DELAY_MS)
      );
      await expectContentVisible(canvasElement, options);
    });

    await step('Content remains visible while pointer is over it', async () => {
      const content = await expectContentVisible(canvasElement, options);

      await userEvent.hover(content);
      await new Promise((resolve) =>
        setTimeout(resolve, HOVER_STABILITY_DELAY_MS)
      );
      await expectContentVisible(canvasElement, options);
    });

    await step(
      'Escape dismisses hover content without moving focus',
      async () => {
        trigger.focus();
        await waitFor(
          () => {
            expect(
              isElementOrShadowDescendant(trigger, getActiveElementDeep(doc)),
              'Trigger should receive focus before Escape'
            ).toBe(true);
          },
          {timeout: 3000}
        );
        await waitForVisibleContent(canvasElement, options);

        const focusedBefore = getActiveElementDeep(doc);

        await userEvent.keyboard('{Escape}');

        await waitFor(
          async () => {
            await expectContentHidden(canvasElement, options);
          },
          {timeout: 3000}
        );

        expect(getActiveElementDeep(doc)).toBe(focusedBefore);
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
