// @ts-ignore
import {createElement} from 'lwc';
import QuanticFeedbackModal from '../quanticFeedbackModal';

const functionsMocks = {
  handleSubmit: jest.fn(),
};

const selectors = {
  errorMessage: '.error-message',
  submitButton: '.feedback-modal-footer__submit',
  successMesage: '.feedback-modal-body__success-message',
  radioGroup: 'lightning-radio-group',
  textarea: 'lightning-textarea',
};

const exampleValue = 'example value';
const exampleLabel = 'example label';
const exampleDetails = 'example details';
/** @type {Array} */
const exampleOptions = [{label: exampleLabel, value: exampleValue}];

const errors = {
  invalidArrayError: 'The options provided must be a non-empty array.',
  missingLabelOrValueError:
    'Each option requires a label and a value to be specified.',
  missingSubmitFeedback: 'The handleSubmit property is not a valid function.',
  invalidLabelTypeError: (label) =>
    `The "${label}" label is not a valid string.`,
  invalidValueTypeError: (value) =>
    `The "${value}" value is not a valid string.`,
};

const defaultOptions = {
  options: exampleOptions,
  handleSubmit: functionsMocks.handleSubmit,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-feedback-modal', {
    is: QuanticFeedbackModal,
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

function selectOption(element, value) {
  const radioGroup = element.shadowRoot.querySelector(selectors.radioGroup);

  const event = new CustomEvent('change', {
    detail: {value},
  });
  expect(radioGroup).not.toBeNull();
  radioGroup.dispatchEvent(event);
}

function typeDetails(element, value) {
  const textarea = element.shadowRoot.querySelector(selectors.textarea);
  const event = new CustomEvent('change', {
    detail: {value},
  });
  expect(textarea).not.toBeNull();
  textarea.dispatchEvent(event);
}

describe('c-quantic-fedback-modal', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  beforeEach(() => {
    console.error = jest.fn();
    // @ts-ignore
    global.Bueno = {
      isString: jest
        .fn()
        .mockImplementation(
          (value) => Object.prototype.toString.call(value) === '[object String]'
        ),
      isNumber: jest
        .fn()
        .mockImplementation(
          (value) => typeof value === 'number' && !isNaN(value)
        ),
      isArray: jest
        .fn()
        .mockImplementation(
          (value) => Object.prototype.toString.call(value) === '[object Array]'
        ),
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('when invalid options are provided to the feedback modal', () => {
    describe('when the submit feedback property is not a valid function', () => {
      it('should display and log an error message', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          handleSubmit: null,
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          errors.missingSubmitFeedback
        );
      });
    });

    describe('when the options property is not a valid array', () => {
      it('should display and log an error message', async () => {
        const element = createTestComponent({...defaultOptions, options: null});
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(errors.invalidArrayError);
      });
    });

    describe('when the options property is an empty array', () => {
      it('should display and log an error message', async () => {
        const element = createTestComponent({...defaultOptions, options: []});
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(errors.invalidArrayError);
      });
    });

    describe('when one of the options does not contain a label', () => {
      it('should display and log an error message', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          options: [{value: exampleValue}],
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          errors.missingLabelOrValueError
        );
      });
    });

    describe('when one of the options does not contain a value', () => {
      it('should display and log an error message', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          options: [{label: exampleValue}],
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          errors.missingLabelOrValueError
        );
      });
    });

    describe('when a label of one of the options is not of type string', () => {
      it('should display and log an error message', async () => {
        const invalidLabel = 1;
        const element = createTestComponent({
          ...defaultOptions,
          options: [{label: invalidLabel, value: exampleValue}],
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          errors.invalidLabelTypeError(invalidLabel)
        );
      });
    });

    describe('when a value of one of the options is not of type string', () => {
      it('should display and log an error message', async () => {
        const invalidValue = 1;
        const element = createTestComponent({
          ...defaultOptions,
          options: [{label: exampleValue, value: invalidValue}],
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorMessage
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          errors.invalidValueTypeError(invalidValue)
        );
      });
    });
  });

  describe('when valid options are provided to the feedback modal', () => {
    describe('when an option with details is provided', () => {
      it('should display the details input when the option is selected', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          options: [
            {label: exampleLabel, value: exampleValue, withDetails: true},
          ],
        });
        await flushPromises();

        selectOption(element, exampleValue);
        await flushPromises();

        const detailsInput = element.shadowRoot.querySelector(
          selectors.textarea
        );
        expect(detailsInput).not.toBeNull();
      });
    });

    describe('when a custom options label is provided', () => {
      it('should display the correct label', async () => {
        const customLabel = 'example label';
        const element = createTestComponent({
          ...defaultOptions,
          optionsLabel: customLabel,
        });
        await flushPromises();

        const radioGroup = element.shadowRoot.querySelector(
          selectors.radioGroup
        );
        expect(radioGroup.label).toBe(customLabel);
      });
    });

    describe('when an option without details is provided', () => {
      it('should not display the details input when the option is selected', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          options: [
            {label: exampleLabel, value: exampleValue, withDetails: false},
          ],
        });
        await flushPromises();

        selectOption(element, exampleValue);
        await flushPromises();

        const detailsInput = element.shadowRoot.querySelector(
          selectors.textarea
        );
        expect(detailsInput).toBeNull();
      });
    });

    describe('when the form is submitted and the required inputs are not filled', () => {
      it('should not display the success message', async () => {
        const element = createTestComponent();
        await flushPromises();

        const submitButton = element.shadowRoot.querySelector(
          selectors.submitButton
        );

        expect(submitButton).not.toBeNull();
        submitButton.click();
        await flushPromises();

        const successMesage = element.shadowRoot.querySelector(
          selectors.successMesage
        );
        expect(successMesage).toBeNull();
      });

      describe('when an option with required details is selected', () => {
        it('should not display the success message', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            options: [
              {
                label: exampleLabel,
                value: exampleValue,
                withDetails: true,
                detailsRequired: true,
              },
            ],
          });
          await flushPromises();

          selectOption(element, exampleValue);

          const submitButton = element.shadowRoot.querySelector(
            selectors.submitButton
          );

          expect(submitButton).not.toBeNull();
          submitButton.click();
          await flushPromises();

          const successMesage = element.shadowRoot.querySelector(
            selectors.successMesage
          );
          expect(successMesage).toBeNull();
        });
      });
    });

    describe('when the form is submitted and the required inputs are properly filled', () => {
      it('should display the success message and execute the submit feedback function', async () => {
        const element = createTestComponent();
        await flushPromises();

        selectOption(element, exampleValue);

        const submitButton = element.shadowRoot.querySelector(
          selectors.submitButton
        );

        expect(submitButton).not.toBeNull();
        submitButton.click();
        await flushPromises();

        const successMesage = element.shadowRoot.querySelector(
          selectors.successMesage
        );
        expect(successMesage).not.toBeNull();
        expect(functionsMocks.handleSubmit).toHaveBeenCalledWith({
          details: undefined,
          value: exampleValue,
        });
      });

      describe('when an option with required details is selected', () => {
        it('should display the success message and execute the submit feedback function', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            options: [
              {
                label: exampleLabel,
                value: exampleValue,
                withDetails: true,
                detailsRequired: true,
              },
            ],
          });
          await flushPromises();

          selectOption(element, exampleValue);
          await flushPromises();
          typeDetails(element, exampleDetails);

          const submitButton = element.shadowRoot.querySelector(
            selectors.submitButton
          );

          expect(submitButton).not.toBeNull();
          submitButton.click();
          await flushPromises();

          const successMesage = element.shadowRoot.querySelector(
            selectors.successMesage
          );
          expect(successMesage).not.toBeNull();
          expect(functionsMocks.handleSubmit).toHaveBeenCalledWith({
            details: exampleDetails,
            value: exampleValue,
          });
        });
      });

      describe('when an option with optional details is selected', () => {
        it('should display the success message and execute the submit feedback function', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            options: [
              {
                label: exampleLabel,
                value: exampleValue,
                withDetails: true,
                detailsRequired: false,
              },
            ],
          });
          await flushPromises();

          selectOption(element, exampleValue);
          await flushPromises();

          const submitButton = element.shadowRoot.querySelector(
            selectors.submitButton
          );

          expect(submitButton).not.toBeNull();
          submitButton.click();
          await flushPromises();

          const successMesage = element.shadowRoot.querySelector(
            selectors.successMesage
          );
          expect(successMesage).not.toBeNull();
          expect(functionsMocks.handleSubmit).toHaveBeenCalledWith({
            details: undefined,
            value: exampleValue,
          });
        });
      });
    });
  });
});
