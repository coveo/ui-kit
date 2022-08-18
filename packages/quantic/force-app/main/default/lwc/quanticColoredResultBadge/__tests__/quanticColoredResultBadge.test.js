import {createElement} from 'lwc';
import QuanticColoredResultBadge from '../quanticColoredResultBadge';

const defaultPrimaryColor = '#FFF7BA';
const defaultSecondaryColor = '#E2B104';
const defaultLabel = 'Case';

const defaultResult = {
  raw: {
    fieldOne: 'valueOne',
  },
};

const colorsToTest = [
  {
    primaryColor: '#DABFE9',
    expectedSecondaryColor: 'hsl(279, 48.8%, 35.1%)',
  },
  {
    primaryColor: '#EF233C',
    expectedSecondaryColor: 'hsl(353, 86.4%, 5.7%)',
  },
  {
    primaryColor: '03A06E',
    expectedSecondaryColor: 'hsl(161, 96.3%, 80.0%)',
  },
  {
    primaryColor: 'FFF',
    expectedSecondaryColor: 'hsl(0, 0%, 52.0%)',
  },
];

const invalidColors = [
  {
    primaryColor: '#ZZFFFF',
    portion: 'red',
  },
  {
    primaryColor: '#FFZZFF',
    portion: 'green',
  },
  {
    primaryColor: '#FFFFZZ',
    portion: 'blue',
  },
];

const invalidPropertiesError =
  '"QuanticColoredResultBadge" requires either specified value for label or a result object with a fieldname to display correctly.';

function createTestComponent(color, label = defaultLabel, result, fieldname) {
  const element = createElement('c-quantic-colored-result-badge', {
    is: QuanticColoredResultBadge,
  });
  element.label = label;
  element.color = color;
  element.result = result;
  element.fieldname = fieldname;

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

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should display the colored badge with the correct label and color when the label property is given', async () => {
    const label = 'Document';
    const element = createTestComponent('#FFF7BA', label);
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe(label);
  });

  it('should display the colored badge with the correct label and color when the result and fieldname properties are given', async () => {
    const element = createTestComponent(
      '#FFF7BA',
      '',
      defaultResult,
      'fieldOne'
    );
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe(defaultResult.raw.fieldOne);
  });

  it('should not display the colored badge when the label and the result properties are missing', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    const element = createTestComponent('#FFF7BA', null, null);
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).toBeNull();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(invalidPropertiesError);
  });

  it('should not display the colored badge when the result property is given but the fieldname property is missing', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    const element = createTestComponent('#FFF7BA', null, defaultResult, null);
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).toBeNull();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(invalidPropertiesError);
  });

  colorsToTest.forEach((color) => {
    it(`should display the colored badge with the following colors: Primary Color: ${color.primaryColor}; Secondary Color: ${color.expectedSecondaryColor}`, async () => {
      const element = createTestComponent(color.primaryColor);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge');

      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe(defaultLabel);
      expect(badge.style._values['--primaryColor']).toBe(color.primaryColor);
      expect(badge.style._values['--secondaryColor']).toBe(
        color.expectedSecondaryColor
      );
    });
  });

  invalidColors.forEach((color) => {
    it(`should display the colored badge with the correct label and the default colors when the ${color.portion} portion of the color value is invalid`, async () => {
      const invalidColor = color.primaryColor;
      const element = createTestComponent(invalidColor);
      await flushPromises();

      const badge = element.shadowRoot.querySelector('.result-badge');

      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe(defaultLabel);
      expect(badge.style._values['--primaryColor']).toBe(defaultPrimaryColor);
      expect(badge.style._values['--secondaryColor']).toBe(
        defaultSecondaryColor
      );
    });
  });

  it('should display the colored badge with the correct label and the default colors when the color is not given', async () => {
    const element = createTestComponent('');
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe(defaultLabel);
    expect(badge.style._values['--primaryColor']).toBe(defaultPrimaryColor);
    expect(badge.style._values['--secondaryColor']).toBe(defaultSecondaryColor);
  });
});
