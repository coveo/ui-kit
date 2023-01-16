// @ts-ignore
import {createElement} from 'lwc';
import QuanticColoredResultBadge from '../quanticColoredResultBadge';

const defaultPrimaryColor = '#FFF7BA';
const defaultSecondaryColor = 'black';
const defaultLabel = 'Document';
const defaultOptions = {
  result: {
    raw: {
      testField: 'test value',
    },
  },
  field: 'testField',
  type: 'string',
};

function createTestComponent(color, label, options = {}) {
  const element = createElement('c-quantic-colored-result-badge', {
    is: QuanticColoredResultBadge,
  });
  element.label = label;
  element.color = color;

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

describe('c-quantic-colored-result-badge', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
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
    };
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('when a label is provided', () => {
    it('should display the colored badge with the correct label and color when the label property is valid', async () => {
      const element = createTestComponent('#FFF7BA', defaultLabel);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge');

      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe(defaultLabel);
    });

    it(`should display the colored badge with the correct label and the default colors when the given value is an invalid HEX color value`, async () => {
      const invalidColor = '#AAAAAAB';
      const element = createTestComponent(invalidColor, defaultLabel);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge');

      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe(defaultLabel);
      expect(badge.style._values['--primaryColor']).toBe(defaultPrimaryColor);
      expect(badge.style._values['--secondaryColor']).toBe(defaultSecondaryColor);
    });

    it('should display the colored badge with the correct label and the default colors when the color is not given', async () => {
      const element = createTestComponent('',defaultLabel);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge');

      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe(defaultLabel);
      expect(badge.style._values['--primaryColor']).toBe(defaultPrimaryColor);
      expect(badge.style._values['--secondaryColor']).toBe(defaultSecondaryColor);
    });
  })

  describe('when a result is provided', () => {
    it('should display the colored badge with the correct result field', async () => {
      const element = createTestComponent('#FFF7BA', '', defaultOptions);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge')
      const resultField = element.shadowRoot.querySelector('c-quantic-result-field')

      expect(badge).not.toBeNull();
      expect(resultField).not.toBeNull();
      expect(resultField.result).toEqual(defaultOptions.result);
      expect(resultField.field).toEqual(defaultOptions.field);
      expect(resultField.type).toEqual(defaultOptions.type);

      // expect(fieldComponent.textContent).toBe(defaultOptions.result.raw.testField);
    });
  })

  describe('when no label and no result are provided', () => {
    it('should not display the colored badge when the label property is missing', async () => {
      const element = createTestComponent('#FFF7BA', null);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge');

      expect(badge).toBeNull();
    });
  })
});
