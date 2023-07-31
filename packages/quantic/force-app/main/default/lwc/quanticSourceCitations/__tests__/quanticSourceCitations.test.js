// @ts-ignore
import { createElement } from 'lwc';
import QuanticSourceCitations from '../quanticSourceCitations';


const functionsMocks = {
  mockCitationClickHandler: jest.fn((citationId) => { return citationId}),
};

const mockCitations = [
  {
    id: '1',
    title: 'Example title 1',
    uri: 'https://example.com/',
    clickUri: 'https://example.com/',
    permanentid: '1',
  },
  {
    id: '2',
    title: 'Example title 2',
    uri: 'https://example.com/',
    clickUri: 'https://example.com/',
    permanentid: '2',
  },
];

const defaultOptions = {
  citations: mockCitations,
  citationClickHandler: functionsMocks.mockCitationClickHandler,
};

const selectors = {
  citation: '.citation',
  citationIndex: '.citation__index',
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

      const citationsIndices = element.shadowRoot.querySelectorAll(
        selectors.citationIndex
      );
      expect(citationsIndices).not.toBeNull();
      expect(citationsIndices.length).toEqual(mockCitations.length);

      const citationLinks = element.shadowRoot.querySelectorAll('a');
      expect(citationLinks).not.toBeNull();
      expect(citationLinks.length).toEqual(mockCitations.length);

      for (let i = 0; i < citations.length; i++) {
        expect(citations[i].getAttribute('data-key')).toEqual(
          mockCitations[i].id
        );

        const indexAsString = (i + 1).toString();
        expect(citationsIndices[i].textContent).toEqual(indexAsString);

        expect(citationLinks[i].getAttribute('title')).toEqual(
          mockCitations[i].title
        );
        expect(citationLinks[i].getAttribute('href')).toEqual(
          mockCitations[i].clickUri
        );
      }
    });

    describe('when a citation is clicked', () => {
      it('should properly open the citation in a new tab', async () => {
        const element = createTestComponent();
        await flushPromises();

        const citationLinks = element.shadowRoot.querySelectorAll('a');

        expect(citationLinks).not.toBeNull();
        expect(citationLinks.length).toEqual(mockCitations.length);

        for (let i = 0; i < citationLinks.length; i++) {
          expect(citationLinks[i].getAttribute('target')).toEqual('_blank');
        }
      });

      it('should execute the citationClickHandler function', async () => {
        const element = createTestComponent();
        await flushPromises();

        const citations = element.shadowRoot.querySelectorAll(
          selectors.citation
        );
        expect(citations).not.toBeNull();
        expect(citations.length).toEqual(mockCitations.length);

        citations[0].click();
        await flushPromises();

        expect(functionsMocks.mockCitationClickHandler).toHaveBeenCalled();
        expect(functionsMocks.mockCitationClickHandler).toHaveBeenCalledWith(
          mockCitations[0].id
        );
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