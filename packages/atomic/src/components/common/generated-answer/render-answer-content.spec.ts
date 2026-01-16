import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderAnswerContentProps,
  renderAnswerContent,
} from './render-answer-content';
import {renderDisclaimer} from './render-disclaimer';
import {renderGeneratingAnswerLabel} from './render-generating-answer-label';

vi.mock('@/src/components/common/heading', {spy: true});
vi.mock('@/src/components/common/switch', {spy: true});
vi.mock('@/src/components/common/generated-answer/retry-prompt', {spy: true});
vi.mock('@/src/components/common/generated-answer/show-button', {spy: true});
vi.mock('./render-disclaimer', {spy: true});
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

  const renderComponent = async (
    overrides: Partial<RenderAnswerContentProps> = {}
  ) => {
    const defaultProps: RenderAnswerContentProps = {
      i18n,
      // @ts-expect-error Test fixture with partial mock
      generatedAnswerState: {
        isStreaming: false,
        answer: 'Test answer',
        citations: [],
        answerContentFormat: 'text/plain',
        expanded: true,
      },
      isAnswerVisible: true,
      hasRetryableError: false,
      toggleTooltip: 'Toggle answer',
      withToggle: false,
      collapsible: false,
      renderFeedbackAndCopyButtonsSlot: () => html``,
      renderCitationsSlot: () => html``,
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
      props: defaultProps,
    };
  };

  it('should call renderHeading with correct arguments', async () => {
    const {element} = await renderComponent();

    expect(renderHeading).toHaveBeenCalledWith({
      props: expect.objectContaining({
        level: 0,
        part: 'header-label',
      }),
    });

    const headerLabel = element.querySelector('[part="header-label"]');
    expect(headerLabel?.textContent?.trim()).toBe(
      i18n.t('generated-answer-title')
    );
  });

  it('should render the sparkles header icon', async () => {
    const {element} = await renderComponent();

    const icon = element.querySelector(
      'atomic-icon[part="header-icon"]'
    ) as HTMLElement & {icon?: string};

    expect(icon).not.toBeNull();
    expect(icon?.icon).toBe('assets://sparkles.svg');
    expect(icon?.classList.contains('text-primary')).toBe(true);
  });

  it('should call renderSwitch with correct arguments', async () => {
    const onToggle = vi.fn();

    await renderComponent({
      isAnswerVisible: true,
      withToggle: true,
      toggleTooltip: 'Test tooltip',
      onToggle,
    });

    expect(renderSwitch).toHaveBeenCalledWith({
      props: expect.objectContaining({
        part: 'toggle',
        checked: true,
        onToggle,
        ariaLabel: 'Generated answer',
        title: 'Test tooltip',
        withToggle: true,
        tabIndex: 0,
      }),
    });
  });

  it('should pass switch props when answer is hidden and withToggle is false', async () => {
    const onToggle = vi.fn();

    await renderComponent({
      isAnswerVisible: false,
      withToggle: false,
      toggleTooltip: 'Another tooltip',
      onToggle,
    });

    expect(renderSwitch).toHaveBeenCalledWith({
      props: expect.objectContaining({
        part: 'toggle',
        checked: false,
        onToggle,
        ariaLabel: 'Generated answer',
        title: 'Another tooltip',
        withToggle: false,
        tabIndex: 0,
      }),
    });
  });

  it('should call renderRetryPrompt with correct arguments', async () => {
    const onRetry = vi.fn();

    await renderComponent({
      hasRetryableError: true,
      isAnswerVisible: true,
      onRetry,
    });

    expect(renderRetryPrompt).toHaveBeenCalledWith({
      props: expect.objectContaining({
        onClick: onRetry,
        buttonLabel: 'Retry',
        message: expect.any(String),
      }),
    });
  });

  it('should not call renderRetryPrompt when answer is not visible', async () => {
    await renderComponent({
      hasRetryableError: true,
      isAnswerVisible: false,
    });

    expect(renderRetryPrompt).not.toHaveBeenCalled();
  });

  describe('when answer is visible and no retryable error', () => {
    it('should display the latest query from state', async () => {
      const {element} = await renderComponent({
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          answer: 'Test answer',
          answerContentFormat: 'text/plain',
          isStreaming: false,
          expanded: true,
          answerApiQueryParams: {q: '  user query  '},
        },
      });

      const queryText = element.querySelector('.query-text');

      expect(queryText?.textContent?.trim()).toBe('user query');
    });

    it('should call renderGeneratedContentContainer with correct arguments', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          answer: 'Test answer',
          answerContentFormat: 'text/markdown',
          isStreaming: false,
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

    it('should call renderFeedbackAndCopyButtonsSlot', async () => {
      const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

      await renderComponent({
        renderFeedbackAndCopyButtonsSlot,
      });

      expect(renderFeedbackAndCopyButtonsSlot).toHaveBeenCalled();
    });

    it('should not render feedback and copy buttons when collapsed', async () => {
      const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

      await renderComponent({
        collapsible: true,
        renderFeedbackAndCopyButtonsSlot,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          answer: 'Test answer',
          answerContentFormat: 'text/plain',
          isStreaming: false,
          expanded: false,
        },
      });

      expect(renderFeedbackAndCopyButtonsSlot).not.toHaveBeenCalled();
    });

    it('should call renderCitationsSlot', async () => {
      const renderCitationsSlot = vi.fn(() => html``);

      await renderComponent({
        renderCitationsSlot,
      });

      expect(renderCitationsSlot).toHaveBeenCalled();
    });

    it('should pass streaming plain text answer to renderGeneratedContentContainer', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          answer: 'Another answer',
          answerContentFormat: 'text/plain',
          isStreaming: true,
        },
      });

      expect(renderGeneratedContentContainer).toHaveBeenCalledWith({
        props: expect.objectContaining({
          answer: 'Another answer',
          answerContentFormat: 'text/plain',
          isStreaming: true,
        }),
      });
    });

    it('should call renderSourceCitations with correct arguments', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        generatedAnswerState: {
          // @ts-expect-error Test fixture with partial mock
          citations: [{id: '1'}, {id: '2'}],
        },
      });

      expect(renderSourceCitations).toHaveBeenCalledWith({
        props: expect.objectContaining({
          label: 'Citations',
          isVisible: true,
        }),
      });
    });

    it('should call renderSourceCitations with isVisible false when citations are empty', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          citations: [],
        },
      });

      expect(renderSourceCitations).toHaveBeenCalledWith({
        props: expect.objectContaining({
          label: 'Citations',
          isVisible: false,
        }),
      });
    });

    it('should call renderDisclaimer with correct arguments when not streaming', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          isStreaming: false,
        },
      });

      expect(renderDisclaimer).toHaveBeenCalledWith({
        props: expect.objectContaining({
          i18n,
          isStreaming: false,
        }),
      });
    });

    it('should call renderDisclaimer with correct arguments when streaming', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          isStreaming: true,
        },
      });

      expect(renderDisclaimer).toHaveBeenCalledWith({
        props: expect.objectContaining({
          i18n,
          isStreaming: true,
        }),
      });
    });

    it('should call renderGeneratingAnswerLabel with correct arguments', async () => {
      await renderComponent({
        isAnswerVisible: true,
        hasRetryableError: false,
        collapsible: true,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
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
        isAnswerVisible: true,
        hasRetryableError: false,
        collapsible: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
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

    it('should not call renderShowButton when streaming', async () => {
      await renderComponent({
        collapsible: true,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          isStreaming: true,
        },
      });

      expect(renderShowButton).not.toHaveBeenCalled();
    });

    describe('when collapsible is true and not streaming', () => {
      it('should call renderShowButton when expanded is true', async () => {
        const onClickShowButton = vi.fn();

        await renderComponent({
          collapsible: true,
          onClickShowButton,
          // @ts-expect-error Test fixture with partial mock
          generatedAnswerState: {
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

      it('should call renderShowButton when expanded is false', async () => {
        await renderComponent({
          collapsible: true,
          // @ts-expect-error Test fixture with partial mock
          generatedAnswerState: {
            isStreaming: false,
            expanded: false,
          },
        });

        expect(renderShowButton).toHaveBeenCalledWith({
          props: expect.objectContaining({
            isCollapsed: true,
          }),
        });
      });
    });

    it('should not call renderShowButton when not collapsible', async () => {
      await renderComponent({
        collapsible: false,
        // @ts-expect-error Test fixture with partial mock
        generatedAnswerState: {
          isStreaming: false,
        },
      });

      expect(renderShowButton).not.toHaveBeenCalled();
    });
  });

  describe('when answer is not visible', () => {
    it('should not call renderGeneratedContentContainer', async () => {
      await renderComponent({
        isAnswerVisible: false,
      });

      expect(renderGeneratedContentContainer).not.toHaveBeenCalled();
    });

    it('should not call renderSourceCitations', async () => {
      await renderComponent({
        isAnswerVisible: false,
      });

      expect(renderSourceCitations).not.toHaveBeenCalled();
    });

    it('should not call renderDisclaimer', async () => {
      await renderComponent({
        isAnswerVisible: false,
      });

      expect(renderDisclaimer).not.toHaveBeenCalled();
    });
  });

  it('should not render feedback and copy buttons when there is a retryable error', async () => {
    const renderFeedbackAndCopyButtonsSlot = vi.fn(() => html``);

    await renderComponent({
      hasRetryableError: true,
      renderFeedbackAndCopyButtonsSlot,
    });

    expect(renderFeedbackAndCopyButtonsSlot).not.toHaveBeenCalled();
  });
});
