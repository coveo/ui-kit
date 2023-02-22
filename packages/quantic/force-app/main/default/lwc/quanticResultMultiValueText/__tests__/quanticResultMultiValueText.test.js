// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultMultiValueText from '../quanticResultMultiValueText';

const exampleField = 'examplemultivaluefield';
const exampleFieldValue = ['One', 'Two', 'Three'];
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
  const element = createElement('c-quantic-result-multi-value-text', {
    is: QuanticResultMultiValueText,
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

describe('c-quantic-result-multi-value-text', () => {
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
        'The c-quantic-result-multi-value-text requires a result and a multi-value field to be specified.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Could not parse value from field "examplemultivaluefield" as a string array.'
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
        'The c-quantic-result-multi-value-text requires a result and a multi-value field to be specified.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Could not parse value from field "undefined" as a string array.'
      );
    });
  });

  describe('when the field value is an empty string', () => {
    it('should show an error', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        result: {
          raw: {
            // @ts-ignore
            [exampleField]: '',
          },
        },
      });
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Could not parse value from field "examplemultivaluefield" as a string array.'
      );
    });
  });

  describe('when the field value is not a valid multi-value field', () => {
    it('should show an error', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        result: {
          raw: {
            // @ts-ignore
            [exampleField]: 1,
          },
        },
      });
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Could not parse value from field "examplemultivaluefield" as a string array.'
      );
    });
  });

  describe('when required props are given', () => {
    it('should render the result field value', async () => {
      const element = createTestComponent();
      await flushPromises();

      const fieldValueElement = element.shadowRoot.querySelector(valueSelector);

      expect(fieldValueElement.textContent).toBe('One, Two, Three');
    });

    describe('when the number of values exceeds the maximum', () => {
      const options = {
        ...defaultOptions,
        maxValuesToDisplay: 2,
      };

      it('should hide the extra values', async () => {
        const element = createTestComponent(options);
        await flushPromises();

        const fieldValueElement =
          element.shadowRoot.querySelector(valueSelector);

        expect(fieldValueElement.textContent).toBe('One, Two, c.quantic_NMore');
      });
    });

    describe('when the field value is a string with a delimiter', () => {
      const testResult = {
        raw: {
          [exampleField]: 'One-Two-Three',
        },
      };
      const options = {
        ...defaultOptions,
        result: testResult,
        delimiter: '-',
      };

      it('should render the result field value', async () => {
        // @ts-ignore
        const element = createTestComponent(options);
        await flushPromises();

        const fieldValueElement =
          element.shadowRoot.querySelector(valueSelector);

        expect(fieldValueElement.textContent).toBe('One, Two, Three');
      });
    });

    describe('when a label is provided', () => {
      const testLabel = 'Numbers';
      const options = {
        ...defaultOptions,
        label: testLabel,
      };

      it('should hide the extra values', async () => {
        const element = createTestComponent(options);
        await flushPromises();

        const fieldValueElement =
          element.shadowRoot.querySelector(valueSelector);
        const labelElement = element.shadowRoot.querySelector(labelSelector);

        expect(fieldValueElement.textContent).toBe('One, Two, Three');
        expect(labelElement.textContent).toBe(`${testLabel}:`);
      });

      describe('when the label is not a valid string', () => {
        const invalidLabel = {};
        const invalidOptions = {
          ...defaultOptions,
          label: invalidLabel,
        };

        it('should show an error', async () => {
          const element = createTestComponent(invalidOptions);
          await flushPromises();

          const errorMessage = element.shadowRoot.querySelector(errorSelector);

          expect(errorMessage).not.toBeNull();
          expect(console.error).toHaveBeenCalledWith(
            `The "${invalidLabel}" label is not a valid string.`
          );
        });
      });
    });
  });
});
