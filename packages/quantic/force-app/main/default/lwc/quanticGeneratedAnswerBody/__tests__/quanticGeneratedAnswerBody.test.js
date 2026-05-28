/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticGeneratedAnswerBody from 'c/quanticGeneratedAnswerBody';
jest.mock('c/quanticUtils', () => ({
  getAbsoluteHeight: jest.fn(() => 250),
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
  '@salesforce/label/c.quantic_GeneratedAnswerCannotGenerateAnswer',
  () => ({
    default:
      "I couldn't find an answer to that. Try rephrasing your follow-up or check the related results below.",
  }),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_GeneratedAnswerErrorGeneric',
  () => ({
    default:
      'Something went wrong while generating the answer. Please try again later.',
  }),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_GeneratedAnswerErrorTurnLimitReached',
  () => ({
    default: 'Conversation turn limit reached. Please start a new conversation.',
  }),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_NoGeneratedAnswer',
  () => ({default: 'No generated answer available.'}),
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
jest.mock(
  '@salesforce/label/c.quantic_TryAgain',
  () => ({default: 'Try again'}),
  {
    virtual: true,
  }
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
  retry: '[data-testid="generated-answer-body__retry"]',
  retryButton: '[data-testid="generated-answer-body__retry-button"]',
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

function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-quantic-generated-answer-body', () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it('should render a single generated answer unit', async () => {
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

  it('should dispatch the answer height with answer content updates', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__answercontentupdated', handler);
    await flushPromises();

    const content = element.shadowRoot.querySelector(selectors.content);
    content.dispatchEvent(new CustomEvent('quantic__answercontentupdated'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerElementHeight: 250});
  });

  it('should dispatch the quantic__like event with the answerId', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__like', handler);
    await flushPromises();

    const feedback = element.shadowRoot.querySelector(selectors.feedback);
    feedback.dispatchEvent(new CustomEvent('quantic__like'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should dispatch the quantic__dislike event with the answerId', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__dislike', handler);
    await flushPromises();

    const feedback = element.shadowRoot.querySelector(selectors.feedback);
    feedback.dispatchEvent(new CustomEvent('quantic__dislike'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should dispatch the quantic__generatedanswercopy event with the answerId', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__generatedanswercopy', handler);
    await flushPromises();

    const copy = element.shadowRoot.querySelector(selectors.copy);
    copy.dispatchEvent(new CustomEvent('quantic__generatedanswercopy'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should dispatch the quantic__citationhover event with the answerId', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      generatedAnswer: {
        ...defaultOptions.generatedAnswer,
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

  it('should render the retry prompt and dispatch a retry event', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      generatedAnswer: {
        ...defaultOptions.generatedAnswer,
        error: {isRetryable: true},
      },
    });
    const handler = jest.fn();
    element.addEventListener('quantic__retry', handler);
    await flushPromises();

    const retry = element.shadowRoot.querySelector(selectors.retry);
    const retryButton = element.shadowRoot.querySelector(selectors.retryButton);

    expect(retry).not.toBeNull();
    retryButton.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({answerId: 'answer-1'});
  });

  it('should render the no-answer message', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      cannotAnswer: true,
    });
    await flushPromises();

    const noAnswer = element.shadowRoot.querySelector(selectors.noAnswer);

    expect(noAnswer).not.toBeNull();
    expect(noAnswer.textContent).toContain(
      "I couldn't find an answer to that. Try rephrasing your follow-up or check the related results below."
    );
  });

  it('should render the generic error message for non-retryable errors', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      generatedAnswer: {
        ...defaultOptions.generatedAnswer,
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

  it('should render the turn limit reached error message when applicable', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      generatedAnswer: {
        ...defaultOptions.generatedAnswer,
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
