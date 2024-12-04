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
  successMessage: '.feedback-modal-body__success-message',
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

function lightningElementValueChange(element, selector, value) {
  const lightningElement = element.shadowRoot.querySelector(selector);
  // All base components in Jest tests are stubs. So we have to set the value manually.
  // Including to the checkValidity method.
  lightningElement.value = value;
  lightningElement.validity = true;
  lightningElement.checkValidity = () => true;
  const event = new CustomEvent('change');
  expect(lightningElement).not.toBeNull();
  lightningElement.dispatchEvent(event);
}

describe('c-quantic-feedback-modal-qna', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it('should properly render', async () => {
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

  describe('when submitting the feedback', () => {
    describe('with missing required answers', () => {
      it('should not submit the feedback and not show the success screen', async () => {
        const element = createTestComponent();
        await flushPromises();

        // Mock the checkValidity method to return false since the questions are not answered.
        const checkValidityMock = jest.fn(() => false);
        const answerEvaluationQuestions = element.shadowRoot.querySelectorAll(
          selectors.answerEvaluationQuestions
        );
        answerEvaluationQuestions.forEach((question) => {
          question.checkValidity = checkValidityMock;
        });

        const submitButton = element.shadowRoot.querySelector(
          selectors.submitButton
        );
        submitButton.click();
        await flushPromises();

        const successMesage = element.shadowRoot.querySelector(
          selectors.successMessage
        );
        expect(successMesage).toBeNull();
        expect(checkValidityMock).toHaveBeenCalledTimes(4);
      });
    });

    describe('with all the required questions answered', () => {
      it('should display the success message and execute the handleSubmit function', async () => {
        const element = createTestComponent();
        await flushPromises();

        lightningElementValueChange(
          element,
          selectors.questionTopicRadio,
          'yes'
        );
        lightningElementValueChange(
          element,
          selectors.questionDocumentedRadio,
          'yes'
        );
        lightningElementValueChange(
          element,
          selectors.questionHallucinationRadio,
          'yes'
        );
        lightningElementValueChange(
          element,
          selectors.questionReadableRadio,
          'yes'
        );

        const submitButton = element.shadowRoot.querySelector(
          selectors.submitButton
        );
        submitButton.click();
        await flushPromises();

        const successMesage = element.shadowRoot.querySelector(
          selectors.successMessage
        );
        expect(successMesage).not.toBeNull();

        expect(functionsMocks.handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            correctTopic: 'yes',
            hallucinationFree: 'yes',
            documented: 'yes',
            readable: 'yes',
          })
        );
      });

      it('should also send the additional details and document url if filled', async () => {
        const testUrl = 'https://www.example.com';
        const testDetails = 'Some additional details';
        const expectedDocumentUrl = testUrl;
        const expectedDetails = testDetails;
        const element = createTestComponent();
        await flushPromises();

        lightningElementValueChange(
          element,
          selectors.questionTopicRadio,
          'yes'
        );
        lightningElementValueChange(
          element,
          selectors.questionDocumentedRadio,
          'yes'
        );
        lightningElementValueChange(
          element,
          selectors.questionHallucinationRadio,
          'yes'
        );
        lightningElementValueChange(
          element,
          selectors.questionReadableRadio,
          'yes'
        );

        lightningElementValueChange(
          element,
          selectors.documentUrlInput,
          testUrl
        );
        lightningElementValueChange(
          element,
          selectors.additionalDetailsTextarea,
          testDetails
        );

        const submitButton = element.shadowRoot.querySelector(
          selectors.submitButton
        );
        submitButton.click();
        await flushPromises();

        const successMesage = element.shadowRoot.querySelector(
          selectors.successMessage
        );
        expect(successMesage).not.toBeNull();

        expect(functionsMocks.handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            documentUrl: expectedDocumentUrl,
            details: expectedDetails,
          })
        );
      });
    });
  });

  describe('when clicking the skip button', () => {
    it('should not submit the feedback and not execute the handleSubmit function', async () => {
      const element = createTestComponent();
      await flushPromises();

      lightningElementValueChange(element, selectors.questionTopicRadio, 'yes');
      lightningElementValueChange(
        element,
        selectors.questionDocumentedRadio,
        'yes'
      );
      lightningElementValueChange(
        element,
        selectors.questionHallucinationRadio,
        'yes'
      );
      lightningElementValueChange(
        element,
        selectors.questionReadableRadio,
        'yes'
      );

      const skipButton = element.shadowRoot.querySelector(selectors.skipButton);
      skipButton.click();
      await flushPromises();

      const successMesage = element.shadowRoot.querySelector(
        selectors.successMessage
      );
      expect(successMesage).toBeNull();
      expect(functionsMocks.handleSubmit).not.toHaveBeenCalled();
    });
  });
});
