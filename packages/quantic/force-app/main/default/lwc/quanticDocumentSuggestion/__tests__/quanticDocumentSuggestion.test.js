jest.mock('c/quanticHeadlessLoader');

import QuanticDocumentSuggestion from 'c/quanticDocumentSuggestion';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import * as quanticHeadlessLoader from 'c/quanticHeadlessLoader';
const headlessLoaderMock = jest.mocked(quanticHeadlessLoader);

const engineMock = {
  id: 'exampleEngineIdMock',
  dispatch: jest.fn(),
};
headlessLoaderMock.initializeWithHeadless.mockImplementation(
  async (element, _, initialize) => {
    initialize(engineMock);
  }
);
headlessLoaderMock.getHeadlessEnginePromise.mockImplementation(() =>
  Promise.reject({message: 'Skip initialization'})
);

let updateSuggestions;
const documentSuggestionListMock = {
  subscribe: jest.fn((callback) => {
    updateSuggestions = async () => {
      callback();
      await flushPromises();
    };
    return () => {}; // Fake unsubscribe function
  }),
};

// @ts-ignore
global.CoveoHeadlessCaseAssist = {
  buildDocumentSuggestionList: jest
    .fn()
    .mockReturnValue(documentSuggestionListMock),
  loadCaseAssistAnalyticsActions: jest.fn().mockReturnValue({}),
  loadDocumentSuggestionActions: jest.fn().mockReturnValue({
    fetchDocumentSuggestions: jest
      .fn()
      .mockReturnValue('mockedFetchDocumentSuggestions'),
    logDocumentSuggestionClick: jest.fn((id) => [
      'mockedLogDocumentSuggestionClick',
      id,
    ]),
    logDocumentSuggestionRating: jest.fn((id, score) => [
      'mockedLogDocumentSuggestionRating',
      id,
      score,
    ]),
  }),
};

const createTestComponent = buildCreateTestComponent(
  QuanticDocumentSuggestion,
  'c-quantic-document-suggestion',
  {
    engineId: engineMock.id,
  }
);

const selectors = {
  container: '.slds-card',
  accordion: 'lightning-accordion',
  accordionSection: 'lightning-accordion-section',
  noSuggestions: 'slot[name="no-suggestions"]',
  spinner: '.loading-holder lightning-spinner',
  quickview: 'c-quantic-result-quickview',
  componentError: 'c-quantic-component-error',
};

function checkElement(element, selector, shouldExist) {
  if (shouldExist) {
    expect(element.shadowRoot.querySelector(selector)).toBeTruthy();
  } else {
    expect(element.shadowRoot.querySelector(selector)).toBeFalsy();
  }
}

describe('c-quantic-document-suggestion', () => {
  beforeEach(() => {
    documentSuggestionListMock.state = {
      documents: [],
      loading: false,
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('when loading suggestions', () => {
    it('should render the loading holder only', async () => {
      const element = createTestComponent();
      documentSuggestionListMock.state.loading = true;
      updateSuggestions();
      await flushPromises();

      checkElement(element, selectors.spinner, true);
      checkElement(element, selectors.container, false);
      checkElement(element, selectors.noSuggestions, false);
    });
  });

  describe('when there are no suggestions', () => {
    it('should render the no-suggestions message', async () => {
      const element = createTestComponent();
      await updateSuggestions();

      expect(engineMock.dispatch).not.toHaveBeenCalled();
      expect(headlessLoaderMock.registerComponentForInit).toHaveBeenCalled();
      checkElement(element, selectors.accordion, false);
      checkElement(element, selectors.noSuggestions, true);
    });
  });

  describe('when fetchOnInit property is set to true', () => {
    it('should fetch document suggestion on initialization', async () => {
      createTestComponent({
        fetchOnInit: true,
      });
      await flushPromises();

      expect(engineMock.dispatch).toHaveBeenCalledWith(
        'mockedFetchDocumentSuggestions'
      );
    });
  });

  describe('with suggestions', () => {
    beforeEach(() => {
      documentSuggestionListMock.state.documents = [
        {
          uniqueId: 'ego',
          fields: {
            uri: 'weed eater',
          },
        },
        {
          uniqueId: 'stihl',
          fields: {
            uri: 'chainsaw',
          },
        },
      ];
    });

    it('should render the component and all parts with default options', async () => {
      const element = createTestComponent();
      await flushPromises();

      checkElement(element, selectors.accordion, false);
      checkElement(element, selectors.noSuggestions, true);
      checkElement(element, selectors.componentError, false);

      await updateSuggestions();

      expect(engineMock.dispatch).not.toHaveBeenCalled();
      expect(headlessLoaderMock.registerComponentForInit).toHaveBeenCalled();

      checkElement(element, selectors.noSuggestions, false);
      checkElement(element, selectors.container, true);
      checkElement(element, selectors.accordion, true);
      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );
      expect(sections.length).toBe(2);
      expect(sections[0].getAttribute('data-id')).toBe('ego');
      checkElement(element, selectors.quickview, true);
    });

    it('should not render quick view button when withoutQuickview is set to true', async () => {
      const element = createTestComponent({
        withoutQuickview: true,
        fetchOnInit: true,
      });
      await flushPromises();

      expect(element.shadowRoot.querySelector(selectors.quickview)).toBeFalsy();
    });

    it('should log a suggestion click if not opened', async () => {
      const element = createTestComponent({
        fetchOnInit: true,
      });
      await updateSuggestions();

      const accordion = element.shadowRoot.querySelector(selectors.accordion);
      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );

      // Should not log click when opening first
      sections[0].click();
      expect(engineMock.dispatch).not.toHaveBeenCalledWith(
        'mockedLogDocumentSuggestionClick'
      );

      accordion.activeSectionName = sections[1].name;
      sections[1].click();
      expect(engineMock.dispatch).toHaveBeenCalledWith([
        'mockedLogDocumentSuggestionClick',
        sections[1].name,
      ]);
    });

    it('should handle document rating event', async () => {
      const element = createTestComponent({
        fetchOnInit: true,
      });
      await updateSuggestions();

      const customEvent = new CustomEvent('quantic__rating', {
        detail: {id: 'mastercraft', score: 2},
      });
      element.shadowRoot.dispatchEvent(customEvent);
      expect(engineMock.dispatch).toHaveBeenCalledWith([
        'mockedLogDocumentSuggestionRating',
        'mastercraft',
        2,
      ]);
    });

    it('should truncate documents to maxDocuments', async () => {
      const element = createTestComponent({
        fetchOnInit: true,
        maxDocuments: 1,
      });
      await updateSuggestions();

      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );
      expect(sections.length).toBe(1);
    });

    it('should open the documents depending on numberOfAutoOpenedDocuments', async () => {
      const element = createTestComponent({
        fetchOnInit: true,
        numberOfAutoOpenedDocuments: 2,
      });
      await updateSuggestions();

      const accordion = element.shadowRoot.querySelector(selectors.accordion);
      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );
      expect(sections.length).toBe(2);
      expect(accordion.activeSectionName).toEqual([
        sections[0].name,
        sections[1].name,
      ]);
    });
  });

  describe('with invalid options', () => {
    it('should set an error message if maxDocuments is invalid', async () => {
      const element = createTestComponent({
        maxDocuments: 0,
      });
      await flushPromises();

      checkElement(element, selectors.componentError, true);
    });
    it('should set an error message if numberOfAutoOpenedDocuments is invalid', async () => {
      const element = createTestComponent({
        numberOfAutoOpenedDocuments: -1,
      });
      await flushPromises();

      checkElement(element, selectors.componentError, true);
    });
  });
});
