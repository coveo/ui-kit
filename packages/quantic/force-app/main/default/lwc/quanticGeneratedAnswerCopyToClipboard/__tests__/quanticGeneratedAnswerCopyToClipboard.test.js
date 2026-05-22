/* eslint-disable jest/no-focused-tests */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticGeneratedAnswerCopyToClipboard from '../quanticGeneratedAnswerCopyToClipboard';
import {copyToClipboard} from 'c/quanticUtils';

const defaultCopyLabel = 'Copy';
const defaultCopiedLabel = 'Copied';
const defaultSize = 'xx-small';

jest.mock(
  '@salesforce/label/c.quantic_Copy',
  () => ({default: defaultCopyLabel}),
  {
    virtual: true,
  }
);

jest.mock(
  '@salesforce/label/c.quantic_Copied',
  () => ({default: defaultCopiedLabel}),
  {
    virtual: true,
  }
);

jest.mock('c/quanticUtils', () => ({
  copyToClipboard: jest.fn(() => Promise.resolve()),
}));

const selectors = {
  copyButton: 'c-quantic-stateful-button',
};

const defaultOptions = {
  answer: 'Example generated answer',
  size: defaultSize,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-generated-answer-copy-to-clipboard', {
    is: QuanticGeneratedAnswerCopyToClipboard,
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

describe('c-quantic-generated-answer-copy-to-clipboard', () => {
  function cleanup() {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  it('should render the copy button with default size', async () => {
    const element = createTestComponent();
    await flushPromises();

    const copyButton = element.shadowRoot.querySelector(selectors.copyButton);

    expect(copyButton).not.toBeNull();
    expect(copyButton.iconName).toBe('utility:copy');
    expect(copyButton.iconSize).toBe(defaultSize);
    expect(copyButton.tooltip).toBe(defaultCopyLabel);
    expect(copyButton.selected).toBe(false);
    expect(copyButton.withoutBorders).toBe(true);
  });

  it('should apply a custom valid size', async () => {
    const customSize = 'large';
    const element = createTestComponent({...defaultOptions, size: customSize});
    await flushPromises();

    const copyButton = element.shadowRoot.querySelector(selectors.copyButton);

    expect(copyButton).not.toBeNull();
    expect(copyButton.iconSize).toBe(customSize);
  });

  it('should ignore an invalid size and keep the default value', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      size: 'oliphant',
    });
    await flushPromises();

    const copyButton = element.shadowRoot.querySelector(selectors.copyButton);

    expect(copyButton).not.toBeNull();
    expect(copyButton.iconSize).toBe(defaultSize);
  });

  it('should copy the answer and dispatch the #quantic__generatedanswercopy event', async () => {
    const element = createTestComponent();
    const handler = jest.fn();
    element.addEventListener('quantic__generatedanswercopy', handler);
    await flushPromises();

    const copyButton = element.shadowRoot.querySelector(selectors.copyButton);
    copyButton.dispatchEvent(new CustomEvent('quantic__select'));
    await flushPromises();

    expect(copyToClipboard).toHaveBeenCalledWith(defaultOptions.answer);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
