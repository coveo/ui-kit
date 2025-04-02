// @ts-ignore
import {createElement} from 'lwc';
import QuanticColoredResultBadge from '../quanticColoredResultBadge';

const badgeSelector = '.result-badge';
const resultFieldSelector = 'c-quantic-result-field';
const errorSelector = '.error-message';

const defaultPrimaryColor = '#FFF7BA';
const defaultSecondaryColor = 'black';
const exampleLabel = 'Document';
const exampleColor = '#FFFFFF';
const defaultOptions = {
  color: exampleColor,
  label: exampleLabel,
  result: {
    raw: {
      testField: 'test value',
    },
  },
  field: 'testField',
  type: 'string',
};

const coloredResultBadgeError =
  'The c-quantic-colored-result-badge requires a label or result and a field to be specified.';
const coloredResultBadgeWarning =
  'The color property has not been specified, the default colors will be used.';
const coloredResultBadgeColorError = (color) =>
  `The "${color}" color is not a valid HEX color.`;

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-colored-result-badge', {
    is: QuanticColoredResultBadge,
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

describe('c-quantic-colored-result-badge', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
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

  describe('when the badge is used to display a label', () => {
    describe('when a label is given', () => {
      it('should display the colored badge with the correct label and color', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          result: null,
          field: null,
        });
        await flushPromises();

        const badge = element.shadowRoot.querySelector(badgeSelector);

        expect(badge).not.toBeNull();
        expect(badge.textContent).toBe(exampleLabel);
        expect(badge.style._values['--primaryColor']).toBe(exampleColor);
        expect(badge.style._values['--secondaryColor']).toBe('black');
      });
    });

    describe('when no label is given', () => {
      it('should show an error', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          label: null,
          result: null,
          field: null,
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(errorSelector);

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(coloredResultBadgeError);
      });
    });
  });

  describe('when the badge is used to display a result field', () => {
    describe('when a result and a field are provided', () => {
      it('should display the colored badge with the correct result field', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          label: undefined,
        });
        await flushPromises();

        const badge = element.shadowRoot.querySelector(badgeSelector);
        const resultField =
          element.shadowRoot.querySelector(resultFieldSelector);

        expect(badge).not.toBeNull();
        expect(resultField).not.toBeNull();
        expect(resultField.result).toEqual(defaultOptions.result);
        expect(resultField.field).toEqual(defaultOptions.field);
        expect(resultField.type).toEqual(defaultOptions.type);
        expect(badge.style._values['--primaryColor']).toBe(exampleColor);
        expect(badge.style._values['--secondaryColor']).toBe('black');
      });
    });

    describe('when no result is given', () => {
      it('should show an error', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          label: null,
          result: null,
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(errorSelector);

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(coloredResultBadgeError);
      });
    });

    describe('when no field is given', () => {
      it('should show an error', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          label: null,
          field: null,
        });
        await flushPromises();

        const errorMessage = element.shadowRoot.querySelector(errorSelector);

        expect(errorMessage).not.toBeNull();
        expect(console.error).toHaveBeenCalledWith(coloredResultBadgeError);
      });
    });
  });

  describe('when no color is given', () => {
    it('should display the colored badge with the default colors', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        color: null,
      });
      await flushPromises();

      const badge = element.shadowRoot.querySelector(badgeSelector);

      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe(exampleLabel);
      expect(badge.style._values['--primaryColor']).toBe(defaultPrimaryColor);
      expect(badge.style._values['--secondaryColor']).toBe(
        defaultSecondaryColor
      );
      expect(console.warn).toHaveBeenCalledWith(coloredResultBadgeWarning);
    });
  });

  describe('when an invalid color is given', () => {
    it('should show an error', async () => {
      const invalidColor = 'invalid color';
      const element = createTestComponent({
        ...defaultOptions,
        color: invalidColor,
      });
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(errorSelector);

      expect(errorMessage).not.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        coloredResultBadgeColorError(invalidColor)
      );
    });
  });
});
