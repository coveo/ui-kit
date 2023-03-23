// @ts-ignore
import {createElement} from 'lwc';
import QuanticQuickviewContent from '../quanticQuickviewContent';

const contentURLMock = 'https://longdogechallenge.com/';

const youtubeTestCase = {
  nameOfTemplate: 'quanticQuickviewYoutube',
  contentType: 'youtube video',
  options: {
    result: {
      uniqueId:
        '42.54689$https://youtube.com/Channel:UCLD76EfBpKKuBH52RMIdrJw/Video:lZHu8AM5bjY',
    },
    contentUrl: contentURLMock,
  },
  selectors: {
    templateSelector: '.iframe-wrapper__youtube',
  },
};
const defaultTestCase = {
  nameOfTemplate: 'quanticQuickviewDefault',
  contentType: 'other than youtube',
  options: {
    result: {
      uniqueId:
        '42.38148$https://community.fitbit.com/board:charge/thread:5332832/message:5333023',
    },
    contentUrl: contentURLMock,
  },
  selectors: {
    templateSelector: '.iframe-wrapper__default',
  },
};

function createTestComponent(options) {
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

  [youtubeTestCase, defaultTestCase].forEach((testCase) => {
    it(`should display the ${testCase.nameOfTemplate} template when the content is of type ${testCase.contentType}`, async () => {
      const element = createTestComponent(testCase.options);
      await flushPromises();

      document.body.appendChild(element);

      const actualTemplate = element.shadowRoot.querySelector(
        testCase.selectors.templateSelector
      );

      expect(actualTemplate).not.toBeNull();
    });
  });
});
