import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderHeading} from '../heading';
import {renderSwitch} from '../switch';
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
    await renderComponent();

    expect(renderHeading).toHaveBeenCalledWith({
      props: expect.objectContaining({
        level: 0,
        part: 'header-label',
      }),
    });
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

  describe('when hasRetryableError is true and answer is visible', () => {
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
  });

  describe('when answer is visible and no retryable error', () => {
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
});
