import QuanticFeedbackModalQna from 'c/quanticFeedbackModalQna';
import {createElement} from 'lwc';

jest.mock('@salesforce/label/c.quantic_Yes', () => ({default: 'Yes'}), {
  virtual: true,
});
jest.mock('@salesforce/label/c.quantic_No', () => ({default: 'No'}), {
  virtual: true,
});
jest.mock(
  '@salesforce/label/c.quantic_FeedbackNotSure',
  () => ({default: 'Not sure'}),
  {
    virtual: true,
  }
);

const functionsMocks = {
  handleSubmit: jest.fn(),
};

const selectors = {
  answerEvaluationQuestions: 'lightning-radio-group',
  questionTopicRadio: 'lightning-radio-group[data-name="correctTopic"]',
  questionHallucinationRadio:
    'lightning-radio-group[data-name="hallucinationFree"]',
  questionDocumentedRadio: 'lightning-radio-group[data-name="documented"]',
  questionReadableRadio: 'lightning-radio-group[data-name="readable"]',
  documentUrlInput: 'lightning-input[data-name="documentUrl"]',
  additionalDetailsTextarea: 'lightning-textarea[data-name="details"]',
  skipButton: 'lightning-button.skip',
  submitButton: 'lightning-button.submit-feedback',
  requiredMessages: 'slds-form-element__help',
  successMesage: '.feedback-modal-body__success-message',
};

const defaultOptions = {
  liked: false,
  handleSubmit: functionsMocks.handleSubmit,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-feedback-modal-qna', {
    is: QuanticFeedbackModalQna,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function selectOption(element, selector, value) {
  const radioGroup = element.shadowRoot.querySelector(selector);

  const event = new CustomEvent('change', {
    detail: {value},
  });
  expect(radioGroup).not.toBeNull();
  radioGroup.dispatchEvent(event);
}

describe('c-quantic-feedback-modal-qna', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it('loads correctly', async () => {
    const element = createTestComponent();
    await flushPromises();

    const answerEvaluationQuestions = element.shadowRoot.querySelectorAll(
      selectors.answerEvaluationQuestions
    );
    expect(answerEvaluationQuestions.length).toBe(4);

    const questionTopicRadio = element.shadowRoot.querySelector(
      selectors.questionTopicRadio
    );
    expect(questionTopicRadio).not.toBeNull();

    const questionHallucinationRadio = element.shadowRoot.querySelector(
      selectors.questionHallucinationRadio
    );
    expect(questionHallucinationRadio).not.toBeNull();

    const questionDocumentedRadio = element.shadowRoot.querySelector(
      selectors.questionDocumentedRadio
    );
    expect(questionDocumentedRadio).not.toBeNull();

    const questionReadableRadio = element.shadowRoot.querySelector(
      selectors.questionReadableRadio
    );
    expect(questionReadableRadio).not.toBeNull();

    const documentUrlInput = element.shadowRoot.querySelector(
      selectors.documentUrlInput
    );
    expect(documentUrlInput).not.toBeNull();

    const additionalDetailsInput = element.shadowRoot.querySelector(
      selectors.additionalDetailsTextarea
    );
    expect(additionalDetailsInput).not.toBeNull();

    const skipButton = element.shadowRoot.querySelector(selectors.skipButton);
    expect(skipButton).not.toBeNull();

    const submitButton = element.shadowRoot.querySelector(
      selectors.submitButton
    );
    expect(submitButton).not.toBeNull();
  });

  it('correctly marks the feedback questions as required if you try to submit without answering them', async () => {
    const element = createTestComponent();
    await flushPromises();

    const submitButton = element.shadowRoot.querySelector(
      selectors.submitButton
    );
    submitButton.click();
    await flushPromises();

    const successMesage = element.shadowRoot.querySelector(
      selectors.successMesage
    );
    expect(successMesage).toBeNull();
  });

  describe('when all the required questions are filled', () => {
    it('should display the success message and execute the handleSubmit function', async () => {
      const element = createTestComponent();
      await flushPromises();

      selectOption(element, selectors.questionTopicRadio, 'yes');
      await flushPromises();
      selectOption(element, selectors.questionDocumentedRadio, 'yes');
      await flushPromises();
      selectOption(element, selectors.questionHallucinationRadio, 'yes');
      await flushPromises();
      selectOption(element, selectors.questionReadableRadio, 'yes');
      await flushPromises();

      const submitButton = element.shadowRoot.querySelector(
        selectors.submitButton
      );
      submitButton.click();
      await flushPromises();

      const successMesage = element.shadowRoot.querySelector(
        selectors.successMesage
      );
      expect(successMesage).not.toBeNull();

      expect(functionsMocks.handleSubmit).toHaveBeenCalledWith({
        helpful: true,
      });
    });
  });
});
