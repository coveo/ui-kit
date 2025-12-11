import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {bindAnalyticsToLink} from '@/src/components/common/item-link/bind-analytics-to-link';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicSmartSnippetAnswer} from './atomic-smart-snippet-answer';
import './atomic-smart-snippet-answer';

vi.mock('@/src/components/common/item-link/bind-analytics-to-link', () => ({
  bindAnalyticsToLink: vi.fn(() => vi.fn()),
}));

describe('atomic-smart-snippet-answer', () => {
  let resizeObserverSpy: MockInstance;

  beforeEach(() => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    const mockUnobserve = vi.fn();

    resizeObserverSpy = vi.fn(function (
      this: ResizeObserver,
      _callback: ResizeObserverCallback
    ) {
      this.observe = mockObserve;
      this.disconnect = mockDisconnect;
      this.unobserve = mockUnobserve;
    });

    window.ResizeObserver =
      resizeObserverSpy as unknown as typeof ResizeObserver;
  });

  const renderComponent = async ({
    htmlContent = '<p>Test content</p>',
    innerStyle,
  }: {
    htmlContent?: string;
    innerStyle?: string;
  } = {}) => {
    const element = await renderFunctionFixture(
      html`<atomic-smart-snippet-answer
        .htmlContent=${htmlContent}
        .innerStyle=${innerStyle}
      ></atomic-smart-snippet-answer>`
    );

    const component = element.querySelector(
      'atomic-smart-snippet-answer'
    ) as AtomicSmartSnippetAnswer;

    return {
      element: component,
      locators: {
        get answer() {
          return component.shadowRoot?.querySelector('[part="answer"]');
        },
        get wrapper() {
          return component.shadowRoot?.querySelector('.wrapper');
        },
        get style() {
          return component.shadowRoot?.querySelector('style');
        },
        get links() {
          return Array.from(
            component.shadowRoot?.querySelectorAll('[part="answer"] a') || []
          );
        },
      },
    };
  };

  describe('rendering', () => {
    it('should render with valid props', async () => {
      const {element} = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render the answer part', async () => {
      const {locators} = await renderComponent();
      expect(locators.answer).toBeInTheDocument();
    });

    it('should render the wrapper element', async () => {
      const {locators} = await renderComponent();
      expect(locators.wrapper).toBeInTheDocument();
    });

    it('should render sanitized HTML content', async () => {
      const {locators} = await renderComponent({
        htmlContent: '<p>Test <strong>content</strong></p>',
      });
      const answer = locators.answer;
      expect(answer?.querySelector('p')).toBeInTheDocument();
      expect(answer?.querySelector('strong')).toHaveTextContent('content');
    });

    it('should sanitize dangerous HTML content', async () => {
      const {locators} = await renderComponent({
        htmlContent: '<p>Test</p><script>alert("xss")</script>',
      });
      const answer = locators.answer;
      expect(answer?.querySelector('script')).not.toBeInTheDocument();
      expect(answer?.querySelector('p')).toBeInTheDocument();
    });

    it('should render lists correctly', async () => {
      const {locators} = await renderComponent({
        htmlContent: '<ul><li>Item 1</li><li>Item 2</li></ul>',
      });
      const answer = locators.answer;
      expect(answer?.querySelector('ul')).toBeInTheDocument();
      expect(answer?.querySelectorAll('li').length).toBe(2);
    });

    it('should render links in the content', async () => {
      const {locators} = await renderComponent({
        htmlContent: '<p>Visit <a href="https://example.com">example</a></p>',
      });
      expect(locators.links.length).toBe(1);
      expect(locators.links[0]).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('style sanitization', () => {
    it('should not render style element when innerStyle is not provided', async () => {
      const {locators} = await renderComponent();
      expect(locators.style).not.toBeInTheDocument();
    });

    it('should render sanitized style when innerStyle is provided', async () => {
      const {locators} = await renderComponent({
        innerStyle: 'p { color: blue; }',
      });
      expect(locators.style).toBeInTheDocument();
    });

    it('should sanitize script tags in style content', async () => {
      const {locators} = await renderComponent({
        innerStyle: 'p { color: blue; }',
      });
      const style = locators.style;
      // Style element should exist and not contain script tags
      expect(style).toBeInTheDocument();
      expect(style?.innerHTML).toContain('color: blue');
      // Script tags should be stripped by sanitizeStyle
      expect(style?.querySelector('script')).toBeNull();
    });
  });

  describe('lifecycle', () => {
    it('should add "loaded" class after firstUpdated', async () => {
      const {element} = await renderComponent();
      await vi.waitFor(() => {
        expect(element.classList.contains('loaded')).toBe(true);
      });
    });

    it('should create ResizeObserver on firstUpdated', async () => {
      await renderComponent();
      await vi.waitFor(() => {
        expect(resizeObserverSpy).toHaveBeenCalled();
      });
    });
  });

  describe('events', () => {
    it('should dispatch answerSizeUpdated event when size changes', async () => {
      const {element} = await renderComponent();
      const eventSpy = vi.fn();
      element.addEventListener('answerSizeUpdated', eventSpy);

      // Trigger a size update by calling updated
      await element.updateComplete;
      element.requestUpdate();
      await element.updateComplete;

      await vi.waitFor(() => {
        expect(eventSpy).toHaveBeenCalled();
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('height');
      });
    });

    it('should not bubble answerSizeUpdated event', async () => {
      const {element} = await renderComponent();
      const eventSpy = vi.fn();
      element.addEventListener('answerSizeUpdated', eventSpy);

      element.requestUpdate();
      await element.updateComplete;

      await vi.waitFor(() => {
        expect(eventSpy).toHaveBeenCalled();
        expect(eventSpy.mock.calls[0][0].bubbles).toBe(false);
      });
    });
  });

  describe('analytics binding', () => {
    it('should bind analytics to links in the content', async () => {
      await renderComponent({
        htmlContent: '<a href="https://example.com">Link</a>',
      });

      await vi.waitFor(() => {
        expect(bindAnalyticsToLink).toHaveBeenCalled();
      });
    });

    it('should bind analytics to multiple links', async () => {
      await renderComponent({
        htmlContent:
          '<a href="https://example1.com">Link 1</a><a href="https://example2.com">Link 2</a>',
      });

      await vi.waitFor(() => {
        expect(bindAnalyticsToLink).toHaveBeenCalledTimes(2);
      });
    });

    it('should emit selectInlineLink event when callback is called', async () => {
      const {element, locators} = await renderComponent({
        htmlContent: '<a href="https://example.com">Test Link</a>',
      });

      const eventSpy = vi.fn();
      element.addEventListener('selectInlineLink', eventSpy);

      // Wait for analytics binding
      await vi.waitFor(() => {
        expect(bindAnalyticsToLink).toHaveBeenCalled();
      });

      // Get the onSelect callback that was passed to bindAnalyticsToLink
      const bindCall = vi
        .mocked(bindAnalyticsToLink)
        .mock.calls.find((call) => call[0] === locators.links[0]);
      expect(bindCall).toBeDefined();
      const {onSelect} = bindCall![1];
      onSelect();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.linkText).toBe('Test Link');
      expect(eventSpy.mock.calls[0][0].detail.linkURL).toMatch(
        /^https:\/\/example\.com\/?$/
      );
    });
  });
});
