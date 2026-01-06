import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {bindAnalyticsToLink} from '@/src/components/common/item-link/bind-analytics-to-link';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-smart-snippet-answer';

vi.mock('@/src/components/common/item-link/bind-analytics-to-link', () => ({
  bindAnalyticsToLink: vi.fn(() => vi.fn()),
}));

describe('atomic-smart-snippet-answer', () => {
  let observeSpy: MockInstance;

  beforeEach(() => {
    observeSpy = vi.spyOn(ResizeObserver.prototype, 'observe');
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

    const component = element.querySelector('atomic-smart-snippet-answer')!;

    return {
      element: component,
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
    };
  };

  describe('rendering', () => {
    it('should render answer part with sanitized HTML content', async () => {
      const {answer} = await renderComponent({
        htmlContent: '<p>Test <strong>content</strong></p>',
      });
      expect(answer).toBeInTheDocument();
      expect(answer?.querySelector('strong')).toHaveTextContent('content');
    });

    it('should sanitize dangerous HTML content', async () => {
      const {answer} = await renderComponent({
        htmlContent: '<p>Test</p><script>alert("xss")</script>',
      });
      expect(answer?.querySelector('script')).not.toBeInTheDocument();
    });
  });

  describe('style sanitization', () => {
    it('should render sanitized style when innerStyle is provided', async () => {
      const {style} = await renderComponent({
        innerStyle: 'p { color: blue; }',
      });
      expect(style).toBeInTheDocument();
      expect(style?.innerHTML).toContain('color: blue');
    });
  });

  describe('lifecycle', () => {
    it('should create ResizeObserver', async () => {
      await renderComponent();
      await vi.waitFor(() => {
        expect(observeSpy).toHaveBeenCalled();
      });
    });
  });

  it('should dispatch answerSizeUpdated event with height', async () => {
    const {element} = await renderComponent();
    const eventSpy = vi.fn();
    element.addEventListener('answerSizeUpdated', eventSpy);

    await vi.waitFor(() => {
      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('height');
      expect(eventSpy.mock.calls[0][0].bubbles).toBe(false);
    });
  });

  it('should bind analytics to links and emit selectInlineLink event', async () => {
    const {element, links} = await renderComponent({
      htmlContent: '<a href="https://example.com">Test Link</a>',
    });

    const eventSpy = vi.fn();
    element.addEventListener('selectInlineLink', eventSpy);

    await vi.waitFor(() => {
      expect(bindAnalyticsToLink).toHaveBeenCalled();
    });

    const bindCall = vi
      .mocked(bindAnalyticsToLink)
      .mock.calls.find((call) => call[0] === links[0]);
    const {onSelect} = bindCall![1];
    onSelect();

    expect(eventSpy).toHaveBeenCalled();
    expect(eventSpy.mock.calls[0][0].detail).toMatchObject({
      linkText: 'Test Link',
      linkURL: 'https://example.com/',
    });
  });
});
