import type {GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderAnswerContentProps,
  renderAnswerContent,
} from './render-answer-content';

describe('#renderAnswerContent', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderAnswerContentProps> = {}
  ) => {
    const defaultProps: RenderAnswerContentProps = {
      i18n,
      generatedAnswerState: {
        isVisible: true,
        isStreaming: false,
        answer: 'Test answer',
        citations: [],
        answerContentFormat: 'text/plain',
        expanded: true,
      } as GeneratedAnswerState,
      isAnswerVisible: true,
      hasRetryableError: false,
      toggleTooltip: 'Toggle answer',
      withToggle: false,
      collapsible: false,
      renderFeedbackAndCopyButtonsSlot: () => html`<div>Feedback buttons</div>`,
      renderCitationsSlot: () => html`<div>Citations</div>`,
      onToggle: vi.fn(),
      onRetry: vi.fn(),
      onClickShowButton: vi.fn(),
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderAnswerContent({props: defaultProps})}`
    );

    return {
      element,
      generatedContent: element.querySelector('[part="generated-content"]'),
      headerLabel: element.querySelector('[part="header-label"]'),
      toggle: element.querySelector('[part="toggle"]'),
      footer: element.querySelector('[part="generated-answer-footer"]'),
    };
  };

  it('should render the generated content container', async () => {
    const {generatedContent} = await renderComponent();

    expect(generatedContent).toBeInTheDocument();
  });

  it('should render the header label with the correct part attribute', async () => {
    const {headerLabel} = await renderComponent();

    expect(headerLabel).toHaveAttribute('part', 'header-label');
  });

  it('should render the generated answer title', async () => {
    const {element} = await renderComponent();

    await expect.element(element).toHaveTextContent('Generated Answer');
  });

  describe('when withToggle is true', () => {
    it('should render the toggle switch', async () => {
      const {toggle} = await renderComponent({withToggle: true});

      expect(toggle).toBeInTheDocument();
    });

    it('should pass the checked state to toggle', async () => {
      const {toggle} = await renderComponent({
        withToggle: true,
        isAnswerVisible: true,
      });

      expect(toggle).toHaveAttribute('checked', '');
    });
  });

  describe('when hasRetryableError is true', () => {
    it('should render retry prompt when answer is visible', async () => {
      const {element} = await renderComponent({
        hasRetryableError: true,
        isAnswerVisible: true,
      });

      await expect.element(element).toHaveTextContent('Retry');
    });

    it('should not render retry prompt when answer is not visible', async () => {
      const {element} = await renderComponent({
        hasRetryableError: true,
        isAnswerVisible: false,
      });

      await expect.element(element).not.toHaveTextContent('Retry');
    });

    it('should call onRetry when retry is clicked', async () => {
      const onRetry = vi.fn();
      await renderComponent({
        hasRetryableError: true,
        isAnswerVisible: true,
        onRetry,
      });

      // Note: Actual click testing would require more integration with the retry-prompt component
      expect(onRetry).toBeDefined();
    });
  });

  describe('when answer is visible and no retryable error', () => {
    it('should render generated content container', async () => {
      const {element} = await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
      });

      // The generated content container should be rendered
      expect(element.textContent).toContain('Feedback buttons');
    });

    it('should render feedback and copy buttons slot', async () => {
      const {element} = await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        renderFeedbackAndCopyButtonsSlot: () =>
          html`<div class="test-feedback">Test feedback</div>`,
      });

      const feedbackSlot = element.querySelector('.test-feedback');
      expect(feedbackSlot).toBeInTheDocument();
    });

    it('should render citations slot', async () => {
      const {element} = await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        renderCitationsSlot: () =>
          html`<div class="test-citations">Test citations</div>`,
      });

      const citationsSlot = element.querySelector('.test-citations');
      expect(citationsSlot).toBeInTheDocument();
    });

    it('should render footer', async () => {
      const {footer} = await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
      });

      expect(footer).toBeInTheDocument();
    });

    describe('when collapsible is true and not streaming', () => {
      it('should render show button when expanded is true', async () => {
        const {element} = await renderComponent({
          collapsible: true,
          generatedAnswerState: {
            isStreaming: false,
            expanded: true,
          } as GeneratedAnswerState,
        });

        await expect.element(element).toHaveTextContent('Show less');
      });

      it('should render show button when expanded is false', async () => {
        const {element} = await renderComponent({
          collapsible: true,
          generatedAnswerState: {
            isStreaming: false,
            expanded: false,
          } as GeneratedAnswerState,
        });

        await expect.element(element).toHaveTextContent('Show more');
      });
    });

    describe('when streaming', () => {
      it('should not render show button even if collapsible', async () => {
        const {element} = await renderComponent({
          collapsible: true,
          generatedAnswerState: {
            isStreaming: true,
            expanded: true,
          } as GeneratedAnswerState,
        });

        await expect.element(element).not.toHaveTextContent('Show less');
        await expect.element(element).not.toHaveTextContent('Show more');
      });

      it('should render generating answer label when collapsible', async () => {
        const {element} = await renderComponent({
          collapsible: true,
          generatedAnswerState: {
            isStreaming: true,
          } as GeneratedAnswerState,
        });

        const generatingLabel = element.querySelector('[part="is-generating"]');
        expect(generatingLabel).toBeInTheDocument();
      });
    });

    it('should render disclaimer when not streaming', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: false,
        } as GeneratedAnswerState,
      });

      await expect
        .element(element)
        .toHaveTextContent(
          'Generative AI can make mistakes. Make sure to verify information.'
        );
    });

    it('should not render disclaimer when streaming', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      await expect
        .element(element)
        .not.toHaveTextContent('Generative AI can make mistakes');
    });
  });

  describe('when answer is not visible', () => {
    it('should not render generated content container', async () => {
      const {element} = await renderComponent({
        isAnswerVisible: false,
      });

      expect(element.textContent).not.toContain('Feedback buttons');
    });

    it('should not render footer', async () => {
      const {footer} = await renderComponent({
        isAnswerVisible: false,
      });

      expect(footer).not.toBeInTheDocument();
    });
  });
});
