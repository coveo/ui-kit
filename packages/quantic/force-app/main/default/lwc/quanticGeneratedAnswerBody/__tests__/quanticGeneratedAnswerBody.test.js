/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
// @ts-ignore
import QuanticGeneratedAnswerBody from 'c/quanticGeneratedAnswerBody';
import {cleanup, flushPromises} from 'c/testUtils';
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
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-generated-answer-body', {
    is: QuanticGeneratedAnswerBody,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

describe('c-quantic-generated-answer-body', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should pass answer and answerContentFormat to the content component', async () => {
    const element = createTestComponent();
    await flushPromises();

    const body = element.shadowRoot.querySelector(selectors.body);
    const actions = element.shadowRoot.querySelector(selectors.actions);
    const content = element.shadowRoot.querySelector(selectors.content);

    expect(body).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(content.answer).toBe(defaultOptions.generatedAnswer.answer);
    expect(content.answerContentFormat).toBe(
      defaultOptions.generatedAnswer.answerContentFormat
    );
  });

  it('should send the answerId within event details when dispatching the #quantic__like event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__like', handler);
    await flushPromises();

    const feedback = element.shadowRoot.querySelector(selectors.feedback);
    feedback.dispatchEvent(new CustomEvent('quantic__like'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should send the answerId within event details when dispatching the #quantic__dislike event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__dislike', handler);
    await flushPromises();

    const feedback = element.shadowRoot.querySelector(selectors.feedback);
    feedback.dispatchEvent(new CustomEvent('quantic__dislike'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should send the answerId within event details when dispatching the #quantic__generatedanswercopy event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__generatedanswercopy', handler);
    await flushPromises();

    const copy = element.shadowRoot.querySelector(selectors.copy);
    copy.dispatchEvent(new CustomEvent('quantic__generatedanswercopy'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
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
    expect(handler.mock.calls[0][0].detail.answerId).toBe('answer-1');
  });

  it('should send the citation data within event details when dispatching the #quantic__citationhover event', async () => {
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
    expect(handler.mock.calls[0][0].detail.citationId).toBe('citation-1');
    expect(handler.mock.calls[0][0].detail.citationHoverTimeMs).toBe(1200);
  });

  it('should forward the #quantic__answercontentupdated event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__answercontentupdated', handler);
    await flushPromises();

    const content = element.shadowRoot.querySelector(selectors.content);
    content.dispatchEvent(new CustomEvent('quantic__answercontentupdated'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  describe('when an error occurs', () => {
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

    it('should render the generic error message when a non-retryable error occurs', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        generatedAnswer: {
          ...defaultOptions.generatedAnswer,
          answer: '',
          // @ts-ignore
          error: {},
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
  });
});
