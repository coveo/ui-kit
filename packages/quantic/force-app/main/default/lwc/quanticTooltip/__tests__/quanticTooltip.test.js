// @ts-ignore
import {createElement} from 'lwc';
import QuanticTooltip from '../quanticTooltip';

const exampleValue = 'Example value';

const selectors = {
  tooltip: '.tooltip__content',
};

const exampleOptions = {
  value: exampleValue,
};

function createTestComponent(options = exampleOptions) {
  const element = createElement('c-quantic-tooltip', {
    is: QuanticTooltip,
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

describe('c-quantic-tooltip', () => {
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

  it('should display the tooltip when the method showTooltip is called', async () => {
    const element = createTestComponent();
    await flushPromises();

    const tooltip = element.shadowRoot.querySelector(selectors.tooltip);

    expect(tooltip).not.toBeNull();
    expect(tooltip.textContent).toBe(exampleValue);
    expect(tooltip.classList.contains('tooltip__content--visible')).toBe(false);

    await element.showTooltip();

    expect(tooltip.classList.contains('tooltip__content--visible')).toBe(true);
  });

  it('should hide the tooltip when the method hideTooltip method is called', async () => {
    const element = createTestComponent();
    await flushPromises();
    await element.showTooltip();

    const tooltip = element.shadowRoot.querySelector(selectors.tooltip);

    expect(tooltip).not.toBeNull();
    expect(tooltip.textContent).toBe(exampleValue);
    expect(tooltip.classList.contains('tooltip__content--visible')).toBe(true);

    await element.hideTooltip();

    expect(tooltip.classList.contains('tooltip__content--visible')).toBe(false);
  });
});
