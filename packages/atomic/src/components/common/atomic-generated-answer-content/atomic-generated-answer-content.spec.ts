import type {GeneratedAnswerCitation} from '@coveo/headless';
import {html, type TemplateResult} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderGeneratedContentContainer} from '../generated-answer/generated-content-container';
import {renderAgentGenerationSteps} from '../generated-answer/render-agent-generation-steps';
import {renderFeedbackAndCopyButtons} from '../generated-answer/render-feedback-and-copy-buttons';
import {renderSourceCitations} from '../generated-answer/source-citations';
import type {
  AtomicGeneratedAnswerContent,
  GeneratedAnswer,
} from './atomic-generated-answer-content';
import './atomic-generated-answer-content';

vi.mock('../generated-answer/render-feedback-and-copy-buttons', () => ({
  renderFeedbackAndCopyButtons: vi.fn(() => html``),
}));
vi.mock('../generated-answer/generated-content-container', () => ({
  renderGeneratedContentContainer: vi.fn(
    () => (slot?: unknown) => html`${slot ?? ''}`
  ),
}));
vi.mock('../generated-answer/render-agent-generation-steps', () => ({
  renderAgentGenerationSteps: vi.fn(() => html``),
}));
vi.mock('../generated-answer/source-citations', () => ({
  renderSourceCitations: vi.fn(() => (slot?: unknown) => html`${slot ?? ''}`),
}));

describe('atomic-generated-answer-content', () => {
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
      renderCitations?: (
        citations: GeneratedAnswerCitation[],
        answerId?: string
      ) => TemplateResult;
    } = {}
  ) => {
    const generatedAnswer = {
      ...defaultGeneratedAnswer,
      ...options.generatedAnswer,
    } as GeneratedAnswer;

    const onClickLike = options.onClickLike ?? vi.fn();
    const onClickDislike = options.onClickDislike ?? vi.fn();
    const onCopyToClipboard = options.onCopyToClipboard ?? vi.fn();
    const renderCitations = options.renderCitations ?? vi.fn(() => html``);

    const {element} =
      await renderInAtomicSearchInterface<AtomicGeneratedAnswerContent>({
        template: html`<atomic-generated-answer-content
            .generatedAnswer=${generatedAnswer}
            .i18n=${i18n}
            .onClickLike=${onClickLike}
            .onClickDislike=${onClickDislike}
            .onCopyToClipboard=${onCopyToClipboard}
            .renderCitations=${renderCitations}
          ></atomic-generated-answer-content>`,
        selector: 'atomic-generated-answer-content',
      });

    return {
      element,
      generatedAnswer,
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
      generatedAnswer: {answer: undefined, answerId: undefined},
    });

    expect(renderAgentGenerationSteps).not.toHaveBeenCalled();
    expect(renderGeneratedContentContainer).not.toHaveBeenCalled();
    expect(renderFeedbackAndCopyButtons).not.toHaveBeenCalled();
  });

  it('should call renderAgentGenerationSteps with an empty list when generation steps are missing', async () => {
    await renderComponent({
      generatedAnswer: {generationSteps: undefined},
    });

    expect(renderAgentGenerationSteps).toHaveBeenCalledWith({
      props: expect.objectContaining({
        i18n,
        agentSteps: [],
        isStreaming: false,
      }),
    });
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
      expect.objectContaining({label: i18n.t('citations'), isVisible: true})
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
});
