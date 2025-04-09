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

const functionsMocks = {
  fetchDocumentSuggestions: jest.fn(),
  logDocumentSuggestionClick: jest.fn(),
  logDocumentSuggestionRating: jest.fn(),
};

const headlessCaseAssistMock = {
  buildDocumentSuggestionList: jest
    .fn()
    .mockReturnValue(documentSuggestionListMock),
  loadCaseAssistAnalyticsActions: jest.fn().mockReturnValue({}),
  loadDocumentSuggestionActions: jest.fn().mockReturnValue({
    fetchDocumentSuggestions: functionsMocks.fetchDocumentSuggestions,
    logDocumentSuggestionClick: functionsMocks.logDocumentSuggestionClick,
    logDocumentSuggestionRating: functionsMocks.logDocumentSuggestionRating,
  }),
};

// @ts-ignore
global.CoveoHeadlessCaseAssist = headlessCaseAssistMock;

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

function mockErroneousHeadlessInitialization() {
  headlessLoaderMock.initializeWithHeadless.mockImplementation(
    async (element) => {
      if (element instanceof QuanticDocumentSuggestion) {
        element.setInitializationError();
      }
    }
  );
}

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

  describe('on initialization', () => {
    it('should initialize the component and subscribe to the controller', async () => {
      createTestComponent();

      expect(headlessLoaderMock.registerComponentForInit).toHaveBeenCalled();
      expect(headlessLoaderMock.initializeWithHeadless).toHaveBeenCalled();
      expect(
        headlessCaseAssistMock.buildDocumentSuggestionList
      ).toHaveBeenCalledTimes(1);
      expect(
        headlessCaseAssistMock.buildDocumentSuggestionList
      ).toHaveBeenCalledWith(engineMock);
      expect(
        headlessCaseAssistMock.loadCaseAssistAnalyticsActions
      ).toHaveBeenCalledTimes(1);
      expect(
        headlessCaseAssistMock.loadDocumentSuggestionActions
      ).toHaveBeenCalledTimes(1);
      expect(engineMock.dispatch).not.toHaveBeenCalled();
      expect(documentSuggestionListMock.subscribe).toHaveBeenCalledTimes(1);
      expect(updateSuggestions).toBeDefined();
    });
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

      expect(functionsMocks.fetchDocumentSuggestions).toHaveBeenCalledTimes(1);
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
      expect(functionsMocks.fetchDocumentSuggestions).not.toHaveBeenCalled();
      expect(headlessLoaderMock.registerComponentForInit).toHaveBeenCalled();

      checkElement(element, selectors.accordion, false);
      checkElement(element, selectors.noSuggestions, true);
      checkElement(element, selectors.componentError, false);

      await updateSuggestions();

      checkElement(element, selectors.noSuggestions, false);
      checkElement(element, selectors.container, true);
      checkElement(element, selectors.accordion, true);
      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );
      expect(sections.length).toBe(2);
      sections.forEach((section, index) => {
        expect(section.label).toBe(
          documentSuggestionListMock.state.documents[index].title
        );
        const uniqueId =
          documentSuggestionListMock.state.documents[index].uniqueId;
        expect(section.getAttribute('data-id')).toBe(uniqueId);
        expect(section.querySelector(selectors.quickview)).toBeTruthy();
        expect(
          section
            .querySelector('slot[name="actions"]')
            .getAttribute('data-doc-id')
        ).toBe(uniqueId);
        expect(
          section
            .querySelector('slot[name="rating"]')
            .getAttribute('data-doc-id')
        ).toBe(uniqueId);
      });
    });

    it('should not render quick view button when withoutQuickview is set to true', async () => {
      const element = createTestComponent({
        withoutQuickview: true,
      });
      await updateSuggestions();

      expect(element.shadowRoot.querySelector(selectors.quickview)).toBeFalsy();
    });

    it('should log a suggestion click if not opened', async () => {
      const element = createTestComponent();
      await updateSuggestions();

      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );
      const accordion = element.shadowRoot.querySelector(selectors.accordion);

      // First document is already opened and will be collapsed, no click event logged.
      sections[0].click();
      expect(functionsMocks.logDocumentSuggestionClick).toHaveBeenCalledTimes(
        0
      );
      accordion.activeSectionName = sections[1].name;

      sections[1].click();
      await flushPromises();
      expect(functionsMocks.logDocumentSuggestionClick).toHaveBeenCalledTimes(
        1
      );
      expect(functionsMocks.logDocumentSuggestionClick).toHaveBeenCalledWith(
        documentSuggestionListMock.state.documents[1].uniqueId
      );
    });

    it('should handle document rating event', async () => {
      const element = createTestComponent();
      await updateSuggestions();

      const customEvent = new CustomEvent('quantic__rating', {
        detail: {id: 'mastercraft', score: 2},
      });
      element.shadowRoot.dispatchEvent(customEvent);
      expect(functionsMocks.logDocumentSuggestionRating).toHaveBeenCalledTimes(
        1
      );
      expect(functionsMocks.logDocumentSuggestionRating).toHaveBeenCalledWith(
        'mastercraft',
        2
      );
    });

    it('should truncate documents to maxDocuments if the state contains more', async () => {
      const element = createTestComponent({
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

  describe('when two document suggestions have a similar title', () => {
    it('should open the right document suggestion when clicked', async () => {
      documentSuggestionListMock.state.documents = [
        {
          title: 'dewalt',
          uniqueId: 'dw745',
          fields: {
            uri: 'table saw',
          },
        },
        {
          title: 'dewalt',
          uniqueId: 'dw560',
          fields: {
            uri: 'router',
          },
        },
      ];

      const element = createTestComponent();
      await updateSuggestions();

      const sectionToClick = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      )[1];
      const accordion = element.shadowRoot.querySelector(selectors.accordion);
      accordion.activeSectionName = sectionToClick.name;
      sectionToClick.click();
      expect(sectionToClick.name).toBe(
        documentSuggestionListMock.state.documents[1].uniqueId
      );
      expect(functionsMocks.logDocumentSuggestionClick).toHaveBeenCalledTimes(
        1
      );
      expect(functionsMocks.logDocumentSuggestionClick).toHaveBeenCalledWith(
        sectionToClick.name
      );
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

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      checkElement(element, selectors.componentError, true);
    });
  });
});
