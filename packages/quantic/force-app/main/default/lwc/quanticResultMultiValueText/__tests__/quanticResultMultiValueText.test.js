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
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-quantic-result-multi-value-text', () => {
  let isStringMock;

  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  beforeEach(() => {
    isStringMock = jest.fn().mockReturnValue(true);

    console.error = jest.fn();
    // @ts-ignore
    global.Bueno = {
      isString: isStringMock,
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
      expect(console.error).toHaveBeenCalledTimes(2);
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
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the field value is not a valid multi-value field', () => {
    it('should show an error', async () => {
      isStringMock.mockReturnValue(false);
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
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });
});
