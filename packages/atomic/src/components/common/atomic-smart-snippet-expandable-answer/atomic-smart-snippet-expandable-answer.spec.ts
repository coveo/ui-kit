import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicSmartSnippetExpandableAnswer} from './atomic-smart-snippet-expandable-answer';
import './atomic-smart-snippet-expandable-answer';

// Mock atomic-smart-snippet-answer to prevent actual rendering
vi.mock(
  '../atomic-smart-snippet-answer/atomic-smart-snippet-answer',
  () => ({})
);

describe('atomic-smart-snippet-expandable-answer', () => {
  async function setElementHeight(
    element: AtomicSmartSnippetExpandableAnswer,
    height: number
  ) {
    // biome-ignore lint/suspicious/noExplicitAny: Testing internal state
    (element as any).fullHeight = height;
    await element.updateComplete;
  }
  let i18n: i18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async ({
    expanded = false,
    htmlContent = '<p>This is a test answer content</p>',
    maximumHeight = 250,
    collapsedHeight = 180,
    snippetStyle = undefined,
  }: {
    expanded?: boolean;
    htmlContent?: string;
    maximumHeight?: number;
    collapsedHeight?: number;
    snippetStyle?: string;
  } = {}) => {
    const element = await fixture<AtomicSmartSnippetExpandableAnswer>(html`
      <atomic-smart-snippet-expandable-answer
        expanded=${expanded}
        .htmlContent=${htmlContent}
        .maximumHeight=${maximumHeight}
        .collapsedHeight=${collapsedHeight}
        .snippetStyle=${snippetStyle}
      ></atomic-smart-snippet-expandable-answer>
    `);

    // Setup bindings
    element.bindings = {
      i18n,
      // biome-ignore lint/suspicious/noExplicitAny: Mock bindings
    } as any;

    await element.initialize();
    await element.updateComplete;

    return {
      element,
      parts: (el: AtomicSmartSnippetExpandableAnswer) => ({
        truncatedAnswer: el.shadowRoot?.querySelector(
          '[part="truncated-answer"]'
        ),
        showMoreButton: el.shadowRoot?.querySelector(
          '[part="show-more-button"]'
        ),
        showLessButton: el.shadowRoot?.querySelector(
          '[part="show-less-button"]'
        ),
      }),
      answer: () =>
        element.shadowRoot?.querySelector('atomic-smart-snippet-answer')!,
      get container() {
        return element.shadowRoot?.querySelector('div')!;
      },
      get button() {
        return element.shadowRoot?.querySelector('button')!;
      },
    };
  };

  describe('initialization', () => {
    it('is defined', async () => {
      const {element} = await renderComponent();
      expect(element).toBeInstanceOf(AtomicSmartSnippetExpandableAnswer);
    });

    it('should throw error when maximumHeight is less than collapsedHeight', async () => {
      const element = await fixture<AtomicSmartSnippetExpandableAnswer>(html`
        <atomic-smart-snippet-expandable-answer
          .expanded=${false}
          .htmlContent=${'<p>Test</p>'}
          .maximumHeight=${100}
          .collapsedHeight=${200}
        ></atomic-smart-snippet-expandable-answer>
      `);

      element.bindings = {
        i18n,
        // biome-ignore lint/suspicious/noExplicitAny: Mock bindings
      } as any;

      expect(() => element.initialize()).toThrow(
        'maximumHeight must be equal or greater than collapsedHeight'
      );
    });

    it('should not throw error when maximumHeight equals collapsedHeight', async () => {
      const element = await fixture<AtomicSmartSnippetExpandableAnswer>(html`
        <atomic-smart-snippet-expandable-answer
          .expanded=${false}
          .htmlContent=${'<p>Test</p>'}
          .maximumHeight=${200}
          .collapsedHeight=${200}
        ></atomic-smart-snippet-expandable-answer>
      `);

      element.bindings = {
        i18n,
        // biome-ignore lint/suspicious/noExplicitAny: Mock bindings
      } as any;

      expect(() => element.initialize()).not.toThrow();
    });
  });

  describe('rendering', () => {
    it('should render the truncated answer part', async () => {
      const {parts, element} = await renderComponent();
      expect(parts(element).truncatedAnswer).toBeInTheDocument();
    });

    it('should render atomic-smart-snippet-answer with correct props', async () => {
      const testContent = '<p>Test content</p>';
      const testStyle = 'p { color: red; }';
      const {answer} = await renderComponent({
        htmlContent: testContent,
        snippetStyle: testStyle,
      });

      const answerElement = answer();
      expect(answerElement).toBeInTheDocument();
      expect(answerElement?.getAttribute('exportparts')).toBe('answer');
    });

    it('should apply expanded class when expanded prop is true', async () => {
      const {container} = await renderComponent({expanded: true});
      expect(container).toHaveClass('expanded');
    });

    it('should not apply expanded class when expanded prop is false', async () => {
      const {element, container} = await renderComponent({expanded: false});
      await setElementHeight(element, 1000);
      expect(container).not.toHaveClass('expanded');
    });
  });

  describe('expand/collapse button', () => {
    it('should render show-more-button part when answer height exceeds maximumHeight', async () => {
      const {element, parts} = await renderComponent({
        maximumHeight: 250,
      });

      await setElementHeight(element, 300);
      await element.requestUpdate();
      await element.updateComplete;

      expect(parts(element).showMoreButton).toBeInTheDocument();
    });

    it('should not render button when answer height is below maximumHeight', async () => {
      const {element, parts} = await renderComponent({
        maximumHeight: 250,
      });

      await setElementHeight(element, 200);
      await element.requestUpdate();
      await element.updateComplete;

      expect(parts(element).showMoreButton).not.toBeInTheDocument();
      expect(parts(element).showLessButton).not.toBeInTheDocument();
    });

    it('should render show-less-button when expanded', async () => {
      const {element, parts} = await renderComponent({
        expanded: true,
      });

      await setElementHeight(element, 300);
      await element.requestUpdate();
      await element.updateComplete;

      expect(parts(element).showLessButton).toBeInTheDocument();
    });
  });

  describe('events', () => {
    it('should emit expand event when show-more button is clicked', async () => {
      const {element} = await renderComponent({expanded: false});

      await setElementHeight(element, 300);
      await element.requestUpdate();
      await element.updateComplete;

      let expandEventFired = false;
      element.addEventListener('expand', () => {
        expandEventFired = true;
      });

      const button = page.getByRole('button');
      await button.click();

      expect(expandEventFired).toBe(true);
    });

    it('should emit collapse event when show-less button is clicked', async () => {
      const {element} = await renderComponent({expanded: true});

      await setElementHeight(element, 300);
      await element.requestUpdate();
      await element.updateComplete;

      let collapseEventFired = false;
      element.addEventListener('collapse', () => {
        collapseEventFired = true;
      });

      const button = page.getByRole('button');
      await button.click();

      expect(collapseEventFired).toBe(true);
    });

    it('should forward selectInlineLink event from atomic-smart-snippet-answer', async () => {
      const {element, answer} = await renderComponent();

      let eventFired = false;
      let eventDetail: unknown;
      element.addEventListener('selectInlineLink', ((e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      }) as EventListener);

      const answerElement = answer();
      answerElement?.dispatchEvent(
        new CustomEvent('selectInlineLink', {
          detail: {linkText: 'test', linkURL: 'https://test.com'},
          bubbles: true,
        })
      );

      expect(eventFired).toBe(true);
      expect(eventDetail).toEqual({
        linkText: 'test',
        linkURL: 'https://test.com',
      });
    });

    it('should forward beginDelayedSelectInlineLink event from atomic-smart-snippet-answer', async () => {
      const {element, answer} = await renderComponent();

      let eventFired = false;
      element.addEventListener('beginDelayedSelectInlineLink', () => {
        eventFired = true;
      });

      const answerElement = answer();
      answerElement?.dispatchEvent(
        new CustomEvent('beginDelayedSelectInlineLink', {
          detail: {linkText: 'test', linkURL: 'https://test.com'},
          bubbles: true,
        })
      );

      expect(eventFired).toBe(true);
    });

    it('should forward cancelPendingSelectInlineLink event from atomic-smart-snippet-answer', async () => {
      const {element, answer} = await renderComponent();

      let eventFired = false;
      element.addEventListener('cancelPendingSelectInlineLink', () => {
        eventFired = true;
      });

      const answerElement = answer();
      answerElement?.dispatchEvent(
        new CustomEvent('cancelPendingSelectInlineLink', {
          detail: {linkText: 'test', linkURL: 'https://test.com'},
          bubbles: true,
        })
      );

      expect(eventFired).toBe(true);
    });
  });

  describe('CSS custom properties', () => {
    it('should set --full-height CSS property when fullHeight changes', async () => {
      const {element} = await renderComponent();

      await setElementHeight(element, 300);
      await element.requestUpdate();
      await element.updateComplete;

      expect(element.style.getPropertyValue('--full-height')).toBe('300px');
    });

    it('should set --collapsed-size CSS property when fullHeight changes', async () => {
      const {element} = await renderComponent({collapsedHeight: 180});

      await setElementHeight(element, 300);
      await element.requestUpdate();
      await element.updateComplete;

      expect(element.style.getPropertyValue('--collapsed-size')).toBe('180px');
    });

    it('should set --collapsed-size to fullHeight when button is not shown', async () => {
      const {element} = await renderComponent();

      await setElementHeight(element, 200);
      await element.requestUpdate();
      await element.updateComplete;

      expect(element.style.getPropertyValue('--collapsed-size')).toBe('200px');
    });
  });
});
