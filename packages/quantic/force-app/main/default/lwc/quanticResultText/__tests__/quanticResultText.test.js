// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultText from '../quanticResultText';

const exampleField = 'exampleField';
const exampleFieldValue = 'example value';
const exampleLabel = 'example label';
const exampleResult = {
  raw: {
    [exampleField]: exampleFieldValue,
  },
};
const exampleFormattingFunction = (value) => `formatted ${value}`;

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

describe('c-quantic-result-text', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  describe('when no result is given', () => {
    it('should show an error', () => {
      // @ts-ignore
      const element = createTestComponent({field: exampleField});
      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
    });
  });

  describe('when no field is given', () => {
    it('should show an error', () => {
      // @ts-ignore
      const element = createTestComponent({result: exampleResult});
      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
    });
  });

  describe('when required props are given', () => {
    it('should render the result field value', () => {
      const element = createTestComponent();
      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(fieldValueElement.textContent).toBe(exampleFieldValue);
    });
  });

  describe('when a label is given', () => {
    it('should render the field value with a label', () => {
      const element = createTestComponent({
        ...defaultOptions,
        label: exampleLabel,
      });
      const labelElement = element.shadowRoot.querySelector(labelSelector);
      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(labelElement.textContent).toBe(`${exampleLabel}:`);
      expect(fieldValueElement.textContent).toBe(exampleFieldValue);
    });
  });

  describe('when a formatting function is given', () => {
    it('should render the formatted field value', () => {
      const element = createTestComponent({
        ...defaultOptions,
        formattingFunction: exampleFormattingFunction,
      });
      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(fieldValueElement.textContent).toBe(
        exampleFormattingFunction(exampleFieldValue)
      );
    });
  });
});
