/* eslint-disable no-import-assign */
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticSourceCitations from '../quanticSourceCitations';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

// @ts-ignore
mockHeadlessLoader.initializeWithHeadless = (element, engineId, initialize) => {
  if (element instanceof QuanticSourceCitations) {
    if (!isInitialized) {
      isInitialized = true;
      initialize();
    }
  }
};

// @ts-ignore
mockHeadlessLoader.getHeadlessBundle = () => {
  return {
    buildInteractiveCitation: jest.fn((engine, {options}) => options.citation),
  };
};

const mockCitations = [
  {
    id: '1',
    title: 'Example title 1',
    uri: 'https://example.com/',
    clickUri: 'https://example.com/',
    permanentid: '1',
    text: 'text 01',
  },
  {
    id: '2',
    title: 'Example title 2',
    uri: 'https://example.com/',
    clickUri: 'https://example.com/',
    permanentid: '2',
    text: 'text 02',
  },
];

const defaultOptions = {
  citations: mockCitations,
};

const selectors = {
  citation: 'c-quantic-citation',
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-source-citations', {
    is: QuanticSourceCitations,
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

describe('c-quantic-source-citations', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    isInitialized = false;
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  describe('when there are citations found', () => {
    it('should properly display the citations', async () => {
      const element = createTestComponent();
      await flushPromises();

      const citations = element.shadowRoot.querySelectorAll(selectors.citation);
      expect(citations).not.toBeNull();
      expect(citations.length).toEqual(mockCitations.length);

      citations.forEach((citationElement, index) => {
        expect(citationElement.citation).toEqual({
          ...mockCitations[index],
          index: index + 1,
        });
        expect(citationElement.interactiveCitation).toEqual(
          mockCitations[index]
        );
      });
    });

    it('should pass the disableCitationAnchoring property to the citation component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const citations = element.shadowRoot.querySelectorAll(selectors.citation);
      expect(citations).not.toBeNull();
      expect(citations.length).toEqual(mockCitations.length);

      citations.forEach((citationElement) => {
        expect(citationElement.disableCitationAnchoring).toBe(false);
      });
    });
  });

  describe('when there are no citations found', () => {
    it('should not display citations', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citations: null,
      });
      await flushPromises();

      const citations = element.shadowRoot.querySelector(
        selectors.sourceCitation
      );

      expect(citations).toBeNull();
    });
  });
});
