// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultText from '../quanticResultText';

const exampleField = 'examplefield';
const exampleFieldValue = 'example value';
const exampleLabel = 'example label';
const exampleResult = {
  raw: {
    [exampleField]: exampleFieldValue,
  },
};

const labelSelector = '.result-text__label';
const valueSelector = '.result-text__value';
const errorSelector = '.error-message';

const defaultOptions = {
  result: exampleResult,
  field: exampleField,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-result-text', {
    is: QuanticResultText,
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

describe('c-quantic-result-text', () => {
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
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('when no result is given', () => {
    it('should show an error', async () => {
      // @ts-ignore
      const element = createTestComponent({field: exampleField});
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'The c-quantic-result-text requires a result and a field to be specified.'
      );
    });
  });

  describe('when no field is given', () => {
    it('should show an error', async () => {
      // @ts-ignore
      const element = createTestComponent({result: exampleResult});
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'The c-quantic-result-text requires a result and a field to be specified.'
      );
    });
  });

  describe('when field is given as am empty string', () => {
    it('should show an error', async () => {
      // @ts-ignore
      const element = createTestComponent({...defaultOptions, field: ''});
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'The c-quantic-result-text requires a result and a field to be specified.'
      );
    });
  });

  describe('when required props are given', () => {
    it('should render the result field value', async () => {
      const element = createTestComponent();
      await flushPromises();

      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(fieldValueElement.textContent).toBe(exampleFieldValue);
    });
  });

  describe('when a label is given', () => {
    it('should render the field value with a label', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        label: exampleLabel,
      });
      await flushPromises();

      const labelElement = element.shadowRoot.querySelector(labelSelector);
      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(labelElement.textContent).toBe(`${exampleLabel}:`);
      expect(fieldValueElement.textContent).toBe(exampleFieldValue);
    });
  });

  describe('when a formatting function is given', () => {
    const exampleFormattingFunction = (value) => `formatted ${value}`;

    it('should render the formatted field value', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        formattingFunction: exampleFormattingFunction,
      });
      await flushPromises();

      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(fieldValueElement.textContent).toBe(
        exampleFormattingFunction(exampleFieldValue)
      );
    });
  });
});
