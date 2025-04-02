/* eslint-disable no-import-assign */
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultHighlightedTextField from '../quanticResultHighlightedTextField';

const componentName = 'c-quantic-result-highlighted-text-field';

const expectedConsoleErrorMessage = `The ${componentName} requires a result and a field to be specified.`;

const exampleField = 'examplefield';
const exampleFieldValue = 'example highlight';
const highlightedValue = 'highlight';
const exampleHighlightedFieldValue = `example <b>${highlightedValue}</b>`;

const exampleLabel = 'example label';
const exampleResult = {
  [exampleField]: exampleFieldValue,
};

const selectors = {
  labelSelector: '.result-text__label',
  valueSelector: '.result-text__value',
  errorSelector: '.error-message',
  highlightedSection: 'b',
};

const defaultOptions = {
  result: exampleResult,
  field: exampleField,
};

let isInitialized = false;

// @ts-ignore
mockHeadlessLoader.initializeWithHeadless = (element, engineId, initialize) => {
  if (element instanceof QuanticResultHighlightedTextField) {
    if (!isInitialized) {
      isInitialized = true;
      initialize();
    }
  }
};

// @ts-ignore
mockHeadlessLoader.getHeadlessBundle = () => {
  return {
    ResultTemplatesHelpers: {
      getResultProperty: (result, field) => result[`${field}`],
    },
    HighlightUtils: {
      highlightString: () => exampleHighlightedFieldValue,
    },
  };
};

function createTestComponent(options = defaultOptions) {
  const element = createElement(componentName, {
    is: QuanticResultHighlightedTextField,
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

describe('c-quantic-result-highlighted-text-field', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    isInitialized = false;
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
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('error handeling when the componentis used with missing properties', () => {
    describe('when no result is given', () => {
      it('should show an error', async () => {
        // @ts-ignore
        const element = createTestComponent({field: exampleField});
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorSelector
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(expectedConsoleErrorMessage);
      });
    });

    describe('when no field is given', () => {
      it('should show an error', async () => {
        // @ts-ignore
        const element = createTestComponent({result: exampleResult});
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorSelector
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(expectedConsoleErrorMessage);
      });
    });

    describe('when an empty string is given as a field', () => {
      it('should show an error', async () => {
        const element = createTestComponent({...defaultOptions, field: ''});
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(
          selectors.errorSelector
        );

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(expectedConsoleErrorMessage);
      });
    });
  });

  describe('displaying highlights', () => {
    describe('when field highlights are found in the result', () => {
      it('should render the result field value with proper highlights', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          result: {
            ...defaultOptions.result,
            [`${exampleField}Highlights`]: exampleFieldValue,
          },
        });
        await flushPromises();

        const fieldValueElement = element.shadowRoot.querySelector(
          selectors.valueSelector
        );
        const highlightedSection = fieldValueElement.querySelector(
          selectors.highlightedSection
        );

        expect(fieldValueElement.textContent).toBe(exampleFieldValue);
        expect(highlightedSection).not.toBeNull();
        expect(highlightedSection.textContent).toBe(highlightedValue);
      });
    });

    describe('when field highlights are not found in the result', () => {
      it('should render the result field value without highlights', async () => {
        const element = createTestComponent();
        await flushPromises();

        const fieldValueElement = element.shadowRoot.querySelector(
          selectors.valueSelector
        );
        const highlightedSection = fieldValueElement.querySelector(
          selectors.highlightedSection
        );

        expect(fieldValueElement.textContent).toBe(exampleFieldValue);
        expect(highlightedSection).toBeNull();
      });
    });
  });

  describe('displaying the component with a label', () => {
    it('should render the field value with a label', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        label: exampleLabel,
      });
      await flushPromises();

      const labelElement = element.shadowRoot.querySelector(
        selectors.labelSelector
      );
      const fieldValueElement = element.shadowRoot.querySelector(
        selectors.valueSelector
      );

      expect(labelElement.textContent).toBe(`${exampleLabel}:`);
      expect(fieldValueElement.textContent).toBe(exampleFieldValue);
    });
  });
});
