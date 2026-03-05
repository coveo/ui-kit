import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderGeneratedContentContainer} from '../generated-content-container';
import {renderAgentGenerationSteps} from '../render-agent-generation-steps';
import {renderFeedbackAndCopyButtons} from '../render-feedback-and-copy-buttons';
import {renderSourceCitations} from '../source-citations';
import type {
  AtomicAnswerContent,
  GeneratedAnswer,
} from './atomic-answer-content';
import './atomic-answer-content';

vi.mock('../render-feedback-and-copy-buttons', () => ({
  renderFeedbackAndCopyButtons: vi.fn(() => html``),
}));
vi.mock('../generated-content-container', () => ({
  renderGeneratedContentContainer: vi.fn(
    () => (slot?: unknown) => html`${slot ?? ''}`
  ),
}));
vi.mock('../render-agent-generation-steps', () => ({
  renderAgentGenerationSteps: vi.fn(() => html``),
}));
vi.mock('../source-citations', () => ({
  renderSourceCitations: vi.fn(() => (slot?: unknown) => html`${slot ?? ''}`),
}));

describe('atomic-answer-content', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let writeTextMock: ReturnType<typeof vi.fn>;

  const defaultGeneratedAnswer: GeneratedAnswer = {
    question: 'Test question',
    answer: 'Test answer',
    answerId: 'answer-id',
    answerContentFormat: 'text/markdown',
    citations: [],
    generationSteps: [],
    isStreaming: false,
    liked: false,
    disliked: false,
    feedbackSubmitted: false,
    expanded: true,
    isLoading: false,
    cannotAnswer: false,
  };

  const renderComponent = async (
    options: {
      generatedAnswer?: Partial<GeneratedAnswer>;
      onClickLike?: (answerId?: string) => void;
      onClickDislike?: (answerId?: string) => void;
      onCopyToClipboard?: (answerId?: string) => void;
    } = {}
  ) => {
    const generatedAnswer = {
      ...defaultGeneratedAnswer,
      ...options.generatedAnswer,
    } as GeneratedAnswer;

    const onClickLike = options.onClickLike ?? vi.fn();
    const onClickDislike = options.onClickDislike ?? vi.fn();
    const onCopyToClipboard = options.onCopyToClipboard ?? vi.fn();

    const {element} = await renderInAtomicSearchInterface<AtomicAnswerContent>({
      template: html`<atomic-answer-content
        .generatedAnswer=${generatedAnswer}
        .i18n=${i18n}
        .onClickLike=${onClickLike}
        .onClickDislike=${onClickDislike}
        .onCopyToClipboard=${onCopyToClipboard}
      ></atomic-answer-content>`,
      selector: 'atomic-answer-content',
    });

    return {
      element,
      generatedAnswer,
      onClickLike,
      onClickDislike,
      onCopyToClipboard,
      getFeedbackProps: () =>
        vi.mocked(renderFeedbackAndCopyButtons).mock.calls.at(-1)?.[0].props,
      getGeneratedContentProps: () =>
        vi.mocked(renderGeneratedContentContainer).mock.calls.at(-1)?.[0].props,
      getSourceCitationsProps: () =>
        vi.mocked(renderSourceCitations).mock.calls.at(-1)?.[0].props,
    };
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: writeTextMock},
      writable: true,
    });
  });

  it('should render nothing when the answer id is missing', async () => {
    await renderComponent({
      generatedAnswer: {
        answer: undefined,
        answerId: undefined,
      },
    });

    expect(renderAgentGenerationSteps).not.toHaveBeenCalled();
    expect(renderGeneratedContentContainer).not.toHaveBeenCalled();
    expect(renderFeedbackAndCopyButtons).not.toHaveBeenCalled();
  });

  it('should call renderAgentGenerationSteps with an empty list when generation steps are missing', async () => {
    await renderComponent({
      generatedAnswer: {
        generationSteps: undefined,
      },
    });

    expect(renderAgentGenerationSteps).toHaveBeenCalledWith({
      props: expect.objectContaining({
        i18n,
        agentSteps: [],
        isStreaming: false,
      }),
    });
  });

  it('should call renderAgentGenerationSteps with isStreaming false when not streaming', async () => {
    const generationSteps = [
      {
        name: 'searching' as const,
        status: 'active' as const,
        startedAt: 1,
      },
    ];

    await renderComponent({
      generatedAnswer: {
        isStreaming: false,
        generationSteps,
      },
    });

    expect(renderAgentGenerationSteps).toHaveBeenCalledWith({
      props: expect.objectContaining({
        i18n,
        agentSteps: generationSteps,
        isStreaming: false,
      }),
    });
  });

  it('should render generation-step state when streaming without answer content', async () => {
    await renderComponent({
      generatedAnswer: {
        answer: undefined,
        answerId: 'answer-id',
        isStreaming: true,
        generationSteps: [
          {
            name: 'thinking',
            status: 'active',
            startedAt: 1,
          },
        ],
      },
    });

    expect(renderAgentGenerationSteps).toHaveBeenCalledWith({
      props: expect.objectContaining({
        i18n,
        isStreaming: true,
        agentSteps: [
          {
            name: 'thinking',
            status: 'active',
            startedAt: 1,
          },
        ],
      }),
    });
    expect(renderGeneratedContentContainer).toHaveBeenCalledWith({
      props: expect.objectContaining({
        answer: undefined,
        answerContentFormat: 'text/markdown',
        isStreaming: true,
      }),
    });
    expect(renderFeedbackAndCopyButtons).not.toHaveBeenCalled();
  });

  it('should render the error template when the generated answer has an error', async () => {
    const {element} = await renderComponent({
      generatedAnswer: {
        error: {message: 'error'},
      },
    });

    await element.updateComplete;

    const errorContainer = element.shadowRoot?.querySelector(
      '[part="generated-answer-error"]'
    );

    expect(renderGeneratedContentContainer).not.toHaveBeenCalled();
    expect(errorContainer).not.toBeNull();
    expect(errorContainer?.textContent).toContain(
      i18n.t('generated-answer-error-generic')
    );
  });

  it('should render the generated content container with answer data', async () => {
    const {getGeneratedContentProps} = await renderComponent();

    expect(getGeneratedContentProps()).toEqual(
      expect.objectContaining({
        answer: 'Test answer',
        answerContentFormat: 'text/markdown',
        isStreaming: false,
      })
    );
  });

  it('should render source citations with visibility based on citations length', async () => {
    const citations = [
      {
        title: 'citation',
        id: '1',
        uri: 'uri',
        permanentid: '1',
        source: 'source',
      },
    ];

    const {getSourceCitationsProps} = await renderComponent({
      generatedAnswer: {citations},
    });

    expect(getSourceCitationsProps()).toEqual(
      expect.objectContaining({
        label: i18n.t('citations'),
        isVisible: true,
      })
    );
  });

  it('should wire feedback buttons to the provided callbacks with answerId', async () => {
    const onClickLike = vi.fn();
    const onClickDislike = vi.fn();

    const {generatedAnswer, getFeedbackProps} = await renderComponent({
      onClickLike,
      onClickDislike,
    });

    const feedbackProps = getFeedbackProps();
    await feedbackProps?.onClickLike();
    await feedbackProps?.onClickDislike();

    expect(onClickLike).toHaveBeenCalledWith(generatedAnswer.answerId);
    expect(onClickDislike).toHaveBeenCalledWith(generatedAnswer.answerId);
  });

  it('should pass the default copy tooltip label to the FeedbackAndCopyButtons component', async () => {
    const {getFeedbackProps} = await renderComponent();

    expect(getFeedbackProps()?.getCopyToClipboardTooltip()).toBe(
      i18n.t('copy-generated-answer')
    );
  });

  it('should copy the answer to the clipboard and expose copied state when the copy button is clicked', async () => {
    const onCopyToClipboard = vi.fn();
    const {element, generatedAnswer, getFeedbackProps} = await renderComponent({
      onCopyToClipboard,
    });

    const feedbackProps = getFeedbackProps();
    await feedbackProps?.onCopyToClipboard('example answer');
    await element.updateComplete;

    const latestFeedbackProps = getFeedbackProps();
    expect(writeTextMock).toHaveBeenCalledWith(generatedAnswer.answer);
    expect(onCopyToClipboard).toHaveBeenCalledWith(generatedAnswer.answerId);
    expect(latestFeedbackProps).toEqual(
      expect.objectContaining({
        copied: true,
        copyError: false,
      })
    );
    expect(latestFeedbackProps?.getCopyToClipboardTooltip()).toBe(
      i18n.t('generated-answer-copied')
    );
  });

  it('should set copy error state when clipboard write fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    writeTextMock.mockRejectedValueOnce(new Error('copy failed'));

    const {element, getFeedbackProps, onCopyToClipboard} =
      await renderComponent();

    const feedbackProps = getFeedbackProps();
    await feedbackProps?.onCopyToClipboard('example answer');
    await element.updateComplete;

    const latestFeedbackProps = getFeedbackProps();
    expect(onCopyToClipboard).not.toHaveBeenCalled();
    expect(latestFeedbackProps).toEqual(
      expect.objectContaining({
        copied: false,
        copyError: true,
      })
    );
    expect(latestFeedbackProps?.getCopyToClipboardTooltip()).toBe(
      i18n.t('failed-to-copy-generated-answer')
    );
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
