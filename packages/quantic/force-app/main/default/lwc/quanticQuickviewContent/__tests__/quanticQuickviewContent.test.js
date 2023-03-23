// @ts-ignore
import {createElement} from 'lwc';
import QuanticQuickviewContent from '../quanticQuickviewContent';

const selectors = {
  youtubeTemplateSelector: '.iframe-wrapper__youtube',
  defaultTemplateSelector: '.iframe-wrapper__default',
};

const youtubeResult = {
  uniqueId:
    '42.54689$https://youtube.com/Channel:UCLD76EfBpKKuBH52RMIdrJw/Video:lZHu8AM5bjY',
};
const defaultResult = {
  uniqueId:
    '42.38148$https://community.fitbit.com/board:charge/thread:5332832/message:5333023',
};
const contentURLMock = 'https://longdogechallenge.com/';

const defaultOptions = {
  result: defaultResult,
  contentUrl: contentURLMock,
};

const youtubeOptions = {
  result: youtubeResult,
  contentUrl: contentURLMock,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-quickview-content', {
    is: QuanticQuickviewContent,
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

describe('c-quantic-quickview-content', () => {
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

  it('should display the quanticQuickviewYoutube template when the content is a youtube video', async () => {
    const element = createTestComponent(youtubeOptions);
    await flushPromises();

    document.body.appendChild(element);

    const actualYoutubeTemplate = element.shadowRoot.querySelector(
      selectors.youtubeTemplateSelector
    );

    expect(actualYoutubeTemplate).not.toBeNull();
  });

  it('should display the quanticQuickviewDefault template when the content is of type other than youtube', async () => {
    const element = createTestComponent(defaultOptions);
    await flushPromises();

    document.body.appendChild(element);

    const actualDefaultTemplate = element.shadowRoot.querySelector(
      selectors.defaultTemplateSelector
    );

    expect(actualDefaultTemplate).not.toBeNull();
  });
});
