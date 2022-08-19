import {createElement} from 'lwc';
import QuanticColoredResultBadge from '../quanticColoredResultBadge';

const defaultPrimaryColor = '#FFF7BA';
const defaultSecondaryColor = '#E2B104';
const defaultLabel = 'Case';

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

function createTestComponent(color, label = defaultLabel) {
  const element = createElement('c-quantic-colored-result-badge', {
    is: QuanticColoredResultBadge,
  });
  element.label = label;
  element.color = color;

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

  it('should not display the colored badge when the label property is missing', async () => {
    const element = createTestComponent('#FFF7BA', null);
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).toBeNull();
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

  it(`should display the colored badge with the correct label and the default colors when the given the color value is an invalid HEX color value`, async () => {
    const invalidColor = '#AAAAAAB';
    const element = createTestComponent(invalidColor);
    await flushPromises();

    const badge = element.shadowRoot.querySelector('.result-badge');

    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe(defaultLabel);
    expect(badge.style._values['--primaryColor']).toBe(defaultPrimaryColor);
    expect(badge.style._values['--secondaryColor']).toBe(defaultSecondaryColor);
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
