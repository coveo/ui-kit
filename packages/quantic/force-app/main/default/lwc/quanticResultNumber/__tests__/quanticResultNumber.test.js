// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultNumber from '../quanticResultNumber';

const exampleField = 'examplenumberfield';
const exampleFieldValue = 1670118414000;
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
  const element = createElement('c-quantic-result-number', {
    is: QuanticResultNumber,
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

describe('c-quantic-result-number', () => {
  let mockedConsoleError;
  let isStringMock;
  let isNumberMock;
  let formattingFunctionMock;

  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  beforeEach(() => {
    mockedConsoleError = jest.fn();
    isStringMock = jest.fn().mockReturnValue(true);
    isNumberMock = jest.fn().mockReturnValue(true);
    formattingFunctionMock = jest
      .fn()
      .mockImplementation((value) => `formatted ${value}`);
    console.error = mockedConsoleError;
    // @ts-ignore
    global.Bueno = {
      isString: isStringMock,
      isNumber: isNumberMock,
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
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('when no field is given', () => {
    it('should show an error', async () => {
      // @ts-ignore
      const element = createTestComponent({result: exampleResult});
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the field value is not a valid timestamp', () => {
    it('should show an error', async () => {
      isNumberMock.mockReturnValue(false);
      const element = createTestComponent();
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
    });
  });

  describe('when a formatting function is given', () => {
    it('should render the formatted field value', async () => {
      createTestComponent({
        ...defaultOptions,
        formattingFunction: formattingFunctionMock,
      });
      await flushPromises();

      expect(formattingFunctionMock).toHaveBeenCalledWith(exampleFieldValue);
    });
  });
});
