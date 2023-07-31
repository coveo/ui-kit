// @ts-ignore
import { createElement } from 'lwc';
import QuanticSourceCitations from '../quanticSourceCitations';


const functionsMocks = {
  mockCitationClickHandler: jest.fn(() => {}),
};

const mockCitations = [
  {
    id: '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4-5961c9b4-ae43-405f-a750-a4cc4e7437f0',
    title: 'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359302/How+To+Resolve+Netflix+Connection+With+Tivo+on+XB+Family+Smart+TVs',
    permanentid: '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4',
  },
  {
    id: '8c3c7080cf1c225f74b3e5a2f9d8603272bbc97d756b5a3992c6bda33ba4-2396ec3c-41db-43f2-9d04-734765e2166d',
    title: 'How-to articles',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How-to-articles',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/1933326/How-to+articles',
    permanentid: '8c3c7080cf1c225f74b3e5a2f9d8603272bbc97d756b5a3992c6bda33ba4',
  },
  {
    id: '681eb97870fc99957bbd47e4c96d35bd88be7a6938f0797ee75991e4ab2a-e704d723-0a4d-470f-be62-5381912ef783',
    title:
      'How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359300/How+To+Resolve+Netflix+Android+Connection+Error+on+XB%2C+XBR%2C+and+XBR6+Smart+TV',
    permanentid: '681eb97870fc99957bbd47e4c96d35bd88be7a6938f0797ee75991e4ab2a',
  },
  {
    id: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a-e024eeb5-4bdc-46d6-9d22-36cf9676871a',
    title: 'How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359298/How+To+Resolve+Netflix+Playback+Errors+on+Besttech+XB+Smart+TVs',
    permanentid: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a',
  },
  {
    id: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a-952c4fec-d9a1-47ba-aa4c-1ea3d132c841',
    title: 'How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359298/How+To+Resolve+Netflix+Playback+Errors+on+Besttech+XB+Smart+TVs',
    permanentid: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a',
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
      expect(citations.length).toBeGreaterThan(0);
      expect(citations.length).toEqual(mockCitations.length);

      for (let i = 0; i < citations.length; i++) {
        expect(citations[i].getAttribute('data-key')).toEqual(mockCitations[i].id);
      }
    });

    it('should display the proper citation index', async () => {
      const element = createTestComponent();
      await flushPromises();

      const citationsIndices = element.shadowRoot.querySelectorAll(
        selectors.citationIndex
      );

      expect(citationsIndices).not.toBeNull();
      expect(citationsIndices.length).toEqual(mockCitations.length);

      for (let i = 0; i < citationsIndices.length; i++) {
        const indexAsString = (i + 1).toString();
        expect(citationsIndices[i].textContent).toEqual(indexAsString);
      }
    });

    it('should properly display the citation links', async () => {
      const element = createTestComponent();
      await flushPromises();

      const citationLinks = element.shadowRoot.querySelectorAll('a');

      expect(citationLinks).not.toBeNull();
      expect(citationLinks.length).toEqual(mockCitations.length);

      for (let i = 0; i < citationLinks.length; i++) {
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

        expect(element.citationClickHandler).toHaveBeenCalled();
        expect(element.citationClickHandler).toHaveBeenCalledWith(
          mockCitations[0].id
        );
      });
    });
  });

  describe('when there are no citations found', () => {
    it('should not display the quantic-source-citations component', async () => {
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