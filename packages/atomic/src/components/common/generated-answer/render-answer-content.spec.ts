import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderAnswerContentProps,
  renderAnswerContent,
} from './render-answer-content';
import {renderGeneratingAnswerLabel} from './render-generating-answer-label';

vi.mock('@/src/components/common/generated-answer/retry-prompt', {spy: true});
vi.mock('@/src/components/common/generated-answer/show-button', {spy: true});
vi.mock('./render-generating-answer-label', {spy: true});
vi.mock(
  '@/src/components/common/generated-answer/generated-content-container',
  {spy: true}
);
vi.mock('@/src/components/common/generated-answer/source-citations', {
  spy: true,
});

describe('#renderAnswerContent', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultGeneratedAnswer = {
    isStreaming: false,
    answer: 'Test answer',
    citations: [],
    answerContentFormat: 'text/markdown' as const,
    expanded: true,
    question: 'Test question',
    liked: false,
    disliked: false,
    answerId: 'test-answer-id',
    isLoading: false,
    cannotAnswer: false,
    feedbackSubmitted: false,
  };

  const renderComponent = async (
    overrides: Partial<RenderAnswerContentProps> = {}
  ) => {
    const defaultProps: RenderAnswerContentProps = {
      i18n,
      generatedAnswer: {
        ...defaultGeneratedAnswer,
        ...overrides.generatedAnswer,
      },
      collapsible: false,
      renderFeedbackAndCopyButtonsSlot: () => html``,
      renderCitationsSlot: () => html``,
      onRetry: vi.fn(),
      onClickShowButton: vi.fn(),
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderAnswerContent({props: defaultProps})}`
    );

    return {
      element,
      props: defaultProps,
      questionText: element.querySelector('.question-text'),
      feedbackAndCopyButtons: element.querySelector(
        '[part="feedback-and-copy-buttons"]'
      ),
      footer: element.querySelector('[part="generated-answer-footer"]'),
    };
  };

  it('should display the question text', async () => {
    const {questionText} = await renderComponent({
      generatedAnswer: {
        ...defaultGeneratedAnswer,
        question: '  user query  ',
      },
    });

    expect(questionText?.textContent?.trim()).toBe('user query');
  });

  describe('when there is a retryable error', () => {
    it('should call renderRetryPrompt with correct arguments', async () => {
      const onRetry = vi.fn();

      await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          error: {isRetryable: true},
        },
        onRetry,
      });

      expect(renderRetryPrompt).toHaveBeenCalledWith({
        props: expect.objectContaining({
          onClick: onRetry,
          buttonLabel: i18n.t('retry'),
          message: i18n.t('retry-stream-message'),
        }),
      });
    });

    it('should not call renderGeneratedContentContainer', async () => {
      await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          error: {isRetryable: true},
        },
      });

      expect(renderGeneratedContentContainer).not.toHaveBeenCalled();
    });

    it('should not render feedback and copy buttons', async () => {
      const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

      await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          error: {isRetryable: true},
        },
        renderFeedbackAndCopyButtonsSlot,
      });

      expect(renderFeedbackAndCopyButtonsSlot).not.toHaveBeenCalled();
    });

    it('should not render the footer', async () => {
      const {footer} = await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          error: {isRetryable: true},
        },
      });

      expect(footer).not.toBeInTheDocument();
    });
  });

  describe('when there is no retryable error', () => {
    it('should not call renderRetryPrompt', async () => {
      await renderComponent();

      expect(renderRetryPrompt).not.toHaveBeenCalled();
    });

    it('should call renderGeneratedContentContainer with correct arguments', async () => {
      await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          answerContentFormat: 'text/markdown',
        },
      });

      expect(renderGeneratedContentContainer).toHaveBeenCalledWith({
        props: expect.objectContaining({
          answer: 'Test answer',
          answerContentFormat: 'text/markdown',
          isStreaming: false,
        }),
      });
    });

    it('should call renderSourceCitations with correct arguments when citations exist', async () => {
      await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          citations: [
            {
              title: 'citation 1',
              id: '1',
              uri: 'uri 1',
              permanentid: '1',
              source: 'source 1',
            },
            {
              title: 'citation 2',
              id: '2',
              uri: 'uri 2',
              permanentid: '2',
              source: 'source 2',
            },
          ],
        },
      });

      expect(renderSourceCitations).toHaveBeenCalledWith({
        props: expect.objectContaining({
          label: i18n.t('citations'),
          isVisible: true,
        }),
      });
    });

    it('should call renderSourceCitations with isVisible false when citations are empty', async () => {
      await renderComponent({
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          citations: [],
        },
      });

      expect(renderSourceCitations).toHaveBeenCalledWith({
        props: expect.objectContaining({
          label: i18n.t('citations'),
          isVisible: false,
        }),
      });
    });

    it('should call renderCitationsSlot', async () => {
      const renderCitationsSlot = vi.fn(() => html``);

      await renderComponent({
        renderCitationsSlot,
      });

      expect(renderCitationsSlot).toHaveBeenCalled();
    });

    describe('when expanded', () => {
      it('should render feedback and copy buttons', async () => {
        const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

        await renderComponent({
          renderFeedbackAndCopyButtonsSlot,
          generatedAnswer: {
            ...defaultGeneratedAnswer,
            expanded: true,
          },
        });

        expect(renderFeedbackAndCopyButtonsSlot).toHaveBeenCalled();
      });

      it('should render feedback and copy buttons when not collapsible', async () => {
        const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

        await renderComponent({
          collapsible: false,
          renderFeedbackAndCopyButtonsSlot,
        });

        expect(renderFeedbackAndCopyButtonsSlot).toHaveBeenCalled();
      });
    });

    describe('when collapsed', () => {
      it('should not render feedback and copy buttons', async () => {
        const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

        await renderComponent({
          collapsible: true,
          renderFeedbackAndCopyButtonsSlot,
          generatedAnswer: {
            ...defaultGeneratedAnswer,
            expanded: false,
          },
        });

        expect(renderFeedbackAndCopyButtonsSlot).not.toHaveBeenCalled();
      });
    });

    it('should render the footer', async () => {
      const {footer} = await renderComponent();

      expect(footer).toBeInTheDocument();
    });

    it('should call renderGeneratingAnswerLabel with correct arguments when streaming', async () => {
      await renderComponent({
        collapsible: true,
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          isStreaming: true,
        },
      });

      expect(renderGeneratingAnswerLabel).toHaveBeenCalledWith({
        props: expect.objectContaining({
          i18n,
          isStreaming: true,
          collapsible: true,
        }),
      });
    });

    it('should call renderGeneratingAnswerLabel with correct arguments when not streaming', async () => {
      await renderComponent({
        collapsible: false,
        generatedAnswer: {
          ...defaultGeneratedAnswer,
          isStreaming: false,
        },
      });

      expect(renderGeneratingAnswerLabel).toHaveBeenCalledWith({
        props: expect.objectContaining({
          i18n,
          isStreaming: false,
          collapsible: false,
        }),
      });
    });

    describe('show button', () => {
      it('should not call renderShowButton when streaming', async () => {
        await renderComponent({
          collapsible: true,
          generatedAnswer: {
            ...defaultGeneratedAnswer,
            isStreaming: true,
          },
        });

        expect(renderShowButton).not.toHaveBeenCalled();
      });

      it('should not call renderShowButton when not collapsible', async () => {
        await renderComponent({
          collapsible: false,
          generatedAnswer: {
            ...defaultGeneratedAnswer,
            isStreaming: false,
          },
        });

        expect(renderShowButton).not.toHaveBeenCalled();
      });

      describe('when collapsible and not streaming', () => {
        it('should call renderShowButton when expanded', async () => {
          const onClickShowButton = vi.fn();

          await renderComponent({
            collapsible: true,
            onClickShowButton,
            generatedAnswer: {
              ...defaultGeneratedAnswer,
              isStreaming: false,
              expanded: true,
            },
          });

          expect(renderShowButton).toHaveBeenCalledWith({
            props: expect.objectContaining({
              i18n,
              onClick: onClickShowButton,
              isCollapsed: false,
            }),
          });
        });

        it('should call renderShowButton when collapsed', async () => {
          const onClickShowButton = vi.fn();

          await renderComponent({
            collapsible: true,
            onClickShowButton,
            generatedAnswer: {
              ...defaultGeneratedAnswer,
              isStreaming: false,
              expanded: false,
            },
          });

          expect(renderShowButton).toHaveBeenCalledWith({
            props: expect.objectContaining({
              i18n,
              onClick: onClickShowButton,
              isCollapsed: true,
            }),
          });
        });
      });
    });
  });
});
