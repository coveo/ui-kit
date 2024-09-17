// @ts-ignore
import {createElement} from 'lwc';
import QuanticQuickviewContent from '../quanticQuickviewContent';
// @ts-ignore
import defaultTestCase from './data/defaultTestCase.json';
// @ts-ignore
import youtubeTestCase from './data/youtubeTestCase.json';

const functionsMocks = {
  listener: jest.fn(() => {}),
};

function setupSimulation(element, eventName) {
  const handler = () => {
    functionsMocks.listener();
    element.removeEventListener(eventName, handler);
  };
  element.addEventListener(eventName, handler);
}

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

  describe('when the iframe is loaded', () => {
    it('should dispatch the loadingstatechange event properly', async () => {
      const element = createTestComponent(youtubeTestCase.options);
      await flushPromises();

      setupSimulation(element, 'quantic__loadingstatechange');

      const iframe = element.shadowRoot.querySelector(
        youtubeTestCase.selectors.iframeSelector
      );
      iframe.dispatchEvent(new CustomEvent('load'));

      expect(iframe).not.toBeNull();
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    });
  });
});
