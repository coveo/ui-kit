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
  answerId: 'answer-1',
  answer: 'Example generated answer',
  answerContentFormat: 'text/plain',
  citations: [],
  isStreaming: false,
  feedbackState: 'neutral',
  showCitations: false,
  showActions: true,
  answerClass: 'generated-answer__answer generated-answer__answer--collapsed',
};

const selectors = {
  body: '[data-testid="generated-answer-body"]',
  answer: '[data-testid="generated-answer-body__answer"]',
  actions: '[data-testid="generated-answer-body__actions"]',
  feedback: 'c-quantic-feedback',
  copy: 'c-quantic-generated-answer-copy-to-clipboard',
  retry: '[data-testid="generated-answer-body__retry"]',
  retryButton: '[data-testid="generated-answer-body__retry-button"]',
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
    const answer = element.shadowRoot.querySelector(selectors.answer);
    const actions = element.shadowRoot.querySelector(selectors.actions);
    const content = element.shadowRoot.querySelector(selectors.content);

    expect(body).not.toBeNull();
    expect(answer).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(content.answer).toBe(defaultOptions.answer);
    expect(content.answerContentFormat).toBe(
      defaultOptions.answerContentFormat
    );
    expect(answer.style.getPropertyValue('--maxHeight')).toBe('250px');
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
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__citationhover', handler);
    await flushPromises();

    element.handleCitationHover('citation-1', 1200);

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
      hasRetryableError: true,
      showActions: false,
      showCitations: false,
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
      showActions: false,
      showCitations: false,
    });
    await flushPromises();

    const noAnswer = element.shadowRoot.querySelector(selectors.noAnswer);

    expect(noAnswer).not.toBeNull();
    expect(noAnswer.textContent).toContain('No generated answer available.');
  });
});
