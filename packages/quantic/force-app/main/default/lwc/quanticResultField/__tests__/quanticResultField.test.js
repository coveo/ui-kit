// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultField from '../quanticResultField';

const invalidType = 'invalid type';

const fieldTypes = [
  {
    name: 'string',
    element: 'c-quantic-result-text',
  },
  {
    name: 'date',
    element: 'c-quantic-result-date',
  },
  {
    name: 'number',
    element: 'c-quantic-result-number',
  },
  {
    name: 'multi',
    element: 'c-quantic-result-multi-value-text',
  },
];

const defaultOptions = {
  result: {
    raw: {
      testField: 'test value',
    },
  },
  field: 'testField',
  label: 'test label',
  type: 'string',
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-result-field', {
    is: QuanticResultField,
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

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

describe('c-quantic-result-field', () => {
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
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('when the field type is invalid', () => {
    it('should display an error', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        type: invalidType,
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector('.error-message');

      expect(error).not.toBeNull();
      expect(error.textContent).toBe('c-quantic-result-field Error');
      expect(console.error).toHaveBeenCalledWith(
        `The provided type "${invalidType}" is invalid. The type must be one of multi | number | date | string`
      );
    });
  });

  fieldTypes.forEach((fieldType) => {
    it(`should correctly display the result field of type ${fieldType.name} value`, async () => {
      const element = createTestComponent({
        ...defaultOptions,
        type: fieldType.name,
      });
      await flushPromises();

      const fieldComponent = element.shadowRoot.querySelector(
        fieldType.element
      );
      const {label, field} = fieldComponent;

      expect(fieldComponent).not.toBeNull();
      expect(label).toBe(defaultOptions.label);
      expect(field).toBe(defaultOptions.field);
    });
  });
});
