// @ts-ignore
import QuanticGeneratedAnswerBody from 'c/quanticGeneratedAnswerBody';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  loadMarkdownDependencies: jest.fn(() => Promise.resolve()),
  transformMarkdownToHtml: jest.fn((answer) => answer),
  LinkUtils: {
    bindAnalyticsToLink: jest.fn(() => jest.fn()),
  },
  generateTextFragmentUrl: jest.fn((uri) => uri),
}));
jest.mock(
  '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer',
  () => ({default: 'Could not generate an answer.'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_GenericErrorTitle',
  () => ({
    default:
      'Something went wrong while generating the answer. Please try again later.',
  }),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_GeneratedAnswerErrorTurnLimitReached',
  () => ({
    default:
      'Conversation turn limit reached. Please start a new conversation.',
  }),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_ThisAnswerWasHelpful',
  () => ({default: 'This answer was helpful'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful',
  () => ({default: 'This answer was not helpful'}),
  {virtual: true}
);

const defaultOptions = {
  engineId: 'example-engine',
  generatedAnswer: {
    answerId: 'answer-1',
    question: 'What is the meaning of life?',
    answer: 'Example generated answer',
    answerContentFormat: 'text/plain',
    citations: [],
    isStreaming: false,
    liked: false,
    disliked: false,
    cannotAnswer: false,
  },
};

const selectors = {
  body: '[data-testid="generated-answer-body"]',
  actions: '[data-testid="generated-answer-body__actions"]',
  citations: 'c-quantic-source-citations',
  feedback: 'c-quantic-feedback',
  copy: 'c-quantic-generated-answer-copy-to-clipboard',
  error: '[data-testid="generated-answer-body__error"]',
  noAnswer: '[data-testid="generated-answer-body__no-answer-message"]',
  content: 'c-quantic-generated-answer-content',
  streamOfThought: 'c-quantic-generated-answer-stream-of-thought',
};

const createTestComponent = buildCreateTestComponent(
  QuanticGeneratedAnswerBody,
  'c-quantic-generated-answer-body',
  defaultOptions
);

describe('c-quantic-generated-answer-body', () => {
  afterEach(() => {
    cleanup();
  });

  it('should pass the answer, answerContentFormat, engineId, and answerId properties to the QuanticGeneratedAnswerContent component', async () => {
    const element = createTestComponent();
    await flushPromises();

    const content = element.shadowRoot.querySelector(selectors.content);

    expect(content.answer).toBe(defaultOptions.generatedAnswer.answer);
    expect(content.answerContentFormat).toBe(
      defaultOptions.generatedAnswer.answerContentFormat
    );
    expect(content.engineId).toBe(defaultOptions.engineId);
    expect(content.answerId).toBe(defaultOptions.generatedAnswer.answerId);
  });

  it('should pass agentSteps and isStreaming to the QuanticGeneratedAnswerStreamOfThought component', async () => {
    const generationSteps = [{id: 'step-1'}, {id: 'step-2'}];
    const element = createTestComponent({
      ...defaultOptions,
      generatedAnswer: {
        ...defaultOptions.generatedAnswer,
        // @ts-ignore
        generationSteps,
        isStreaming: true,
      },
    });
    await flushPromises();

    const streamOfThought = element.shadowRoot.querySelector(
      selectors.streamOfThought
    );

    expect(streamOfThought).not.toBeNull();
    expect(streamOfThought.agentSteps).toEqual(generationSteps);
    expect(streamOfThought.isStreaming).toBe(true);
  });

  it('should pass an empty agentSteps array to QuanticGeneratedAnswerStreamOfThought when generationSteps is undefined', async () => {
    const element = createTestComponent();
    await flushPromises();

    const streamOfThought = element.shadowRoot.querySelector(
      selectors.streamOfThought
    );

    expect(streamOfThought).not.toBeNull();
    expect(streamOfThought.agentSteps).toEqual([]);
  });

  it('should send the answerId within event details when dispatching the #quantic__generatedanswerlike event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__generatedanswerlike', handler);
    await flushPromises();

    const feedback = element.shadowRoot.querySelector(selectors.feedback);
    feedback.dispatchEvent(new CustomEvent('quantic__like'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should send the answerId within event details when dispatching the #quantic__generatedanswerdislike event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__generatedanswerdislike', handler);
    await flushPromises();

    const feedback = element.shadowRoot.querySelector(selectors.feedback);
    feedback.dispatchEvent(new CustomEvent('quantic__dislike'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should pass the answerId to the copy-to-clipboard component', async () => {
    const element = createTestComponent();
    await flushPromises();

    const copy = element.shadowRoot.querySelector(selectors.copy);

    expect(copy.answerId).toBe('answer-1');
  });

  it('should send the answerId within event details when dispatching the #quantic__citationhover event', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      generatedAnswer: {
        ...defaultOptions.generatedAnswer,
        // @ts-ignore
        citations: [{id: 'citation-1', title: 'Citation'}],
      },
    });
    const handler = jest.fn();
    element.addEventListener('quantic__citationhover', handler);
    await flushPromises();

    const citations = element.shadowRoot.querySelector(
      'c-quantic-source-citations'
    );
    citations.citationHoverHandler('citation-1', 1200);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      answerId: 'answer-1',
      citationId: 'citation-1',
      citationHoverTimeMs: 1200,
    });
  });

  describe('when an answer has not been generated', () => {
    it('should render the no-answer message when the answer cannot be generated', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          cannotAnswer: true,
        },
      });
      await flushPromises();

      const noAnswer = element.shadowRoot.querySelector(selectors.noAnswer);

      expect(noAnswer).not.toBeNull();
    });
  });

  describe('when an error occurs', () => {
    it('should render the generic error message when a non-retryable error occurs', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          answer: '',
          // @ts-ignore
          error: {code: 500},
        },
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).not.toBeNull();
      expect(error.textContent).toContain(
        'Something went wrong while generating the answer. Please try again later.'
      );
    });

    it('should render the turn limit reached error message when the SSE turn limit is exceeded', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          answer: '',
          // @ts-ignore
          error: {
            code: 429,
            isSseTurnLimitReachedError: () => true,
          },
        },
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).not.toBeNull();
      expect(error.textContent).toContain(
        'Conversation turn limit reached. Please start a new conversation.'
      );
    });

    it('should render the error message even when the answer is not empty', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          answer: 'Partial answer content',
          // @ts-ignore
          error: {code: 500},
        },
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);
      const content = element.shadowRoot.querySelector(selectors.content);

      expect(error).not.toBeNull();
      expect(content).toBeNull();
    });

    it('should render the generic error message when the error has no code (e.g., a network/transport failure)', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          answer: '',
          // @ts-ignore
          error: {
            message:
              'An error occurred while starting the follow-up answer generation.',
          },
        },
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).not.toBeNull();
      expect(error.textContent).toContain(
        'Something went wrong while generating the answer. Please try again later.'
      );
    });

    it('should not render the error message when the error object is present but empty', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          // @ts-ignore
          error: {},
        },
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).toBeNull();
    });
  });

  describe('rendering of actions', () => {
    it('should display actions when the answer is not empty and done streaming', async () => {
      const element = createTestComponent();
      await flushPromises();

      const actions = element.shadowRoot.querySelector(selectors.actions);

      expect(actions).not.toBeNull();
    });

    it('should not display actions while the answer is streaming', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          isStreaming: true,
        },
      });
      await flushPromises();

      const actions = element.shadowRoot.querySelector(selectors.actions);

      expect(actions).toBeNull();
    });

    it('should not display actions when there is no answer', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          answer: '',
        },
      });
      await flushPromises();

      const actions = element.shadowRoot.querySelector(selectors.actions);

      expect(actions).toBeNull();
    });
  });

  describe('rendering of citations', () => {
    it('should display citations when citations are not empty', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          // @ts-ignore
          citations: [{id: 'citation-1', title: 'Citation'}],
        },
      });
      await flushPromises();

      const citations = element.shadowRoot.querySelector(selectors.citations);

      expect(citations).not.toBeNull();
      expect(citations.answerId).toBe(defaultOptions.generatedAnswer.answerId);
    });

    it('should not display citations when citations are empty', async () => {
      const element = createTestComponent();
      await flushPromises();

      const citations = element.shadowRoot.querySelector(selectors.citations);

      expect(citations).toBeNull();
    });

    it('should not display citations while the answer is streaming', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          // @ts-ignore
          citations: [{id: 'citation-1', title: 'Citation'}],
          isStreaming: true,
        },
      });
      await flushPromises();

      const citations = element.shadowRoot.querySelector(selectors.citations);

      expect(citations).toBeNull();
    });
  });

  describe('when generatedAnswer is null', () => {
    it('should render without errors', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: null,
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);
      const noAnswer = element.shadowRoot.querySelector(selectors.noAnswer);
      const actions = element.shadowRoot.querySelector(selectors.actions);
      const citations = element.shadowRoot.querySelector(selectors.citations);

      expect(error).toBeNull();
      expect(noAnswer).toBeNull();
      expect(actions).toBeNull();
      expect(citations).toBeNull();
    });
  });
});
