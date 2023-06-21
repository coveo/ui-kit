// @ts-ignore
import {createElement} from 'lwc';
import QuanticHeading from '../quanticHeading';

const exampleLabel = 'Example Label';
const exampleLevel = 3;
const selectors = {
  label: '[data-section="label"]',
};

const defaultOptions = {
  label: exampleLabel,
  level: exampleLevel,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-heading', {
    is: QuanticHeading,
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

describe('c-quantic-heading', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }

  afterEach(() => {
    cleanup();
  });

  it('should display the label with the right header tag level', async () => {
    const expectedTag = `h${exampleLevel}`;
    const element = createTestComponent();
    await flushPromises();

    const label = element.shadowRoot.querySelector(
      `${selectors.label} > ${expectedTag}`
    );
    expect(label).not.toBeNull();
    expect(label.innerText).toBe(exampleLabel);
  });

  describe('when an invalid value of the level property is used', () => {
    it('should display the label in a "div" tag', async () => {
      const expectedTag = 'div';
      const element = createTestComponent({...defaultOptions, level: 7});
      await flushPromises();

      const label = element.shadowRoot.querySelector(
        `${selectors.label} > ${expectedTag}`
      );
      expect(label).not.toBeNull();
      expect(label.innerText).toBe(exampleLabel);
    });
  });
});
