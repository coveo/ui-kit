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
  Promise.resolve(engineMock.id)
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
  buildQuickview: jest.fn().mockReturnValue(documentSuggestionListMock),
  loadCaseAssistAnalyticsActions: jest.fn().mockReturnValue({
    logDocumentSuggestionClick: functionsMocks.logDocumentSuggestionClick,
    logDocumentSuggestionRating: functionsMocks.logDocumentSuggestionRating,
  }),
  loadDocumentSuggestionActions: jest.fn().mockReturnValue({
    fetchDocumentSuggestions: functionsMocks.fetchDocumentSuggestions,
  }),
};

// @ts-ignore
global.CoveoHeadlessCaseAssist = headlessCaseAssistMock;
headlessLoaderMock.getHeadlessBundle.mockReturnValue(headlessCaseAssistMock);

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

      const spinner = element.shadowRoot.querySelector(selectors.spinner);
      const container = element.shadowRoot.querySelector(selectors.container);
      const noSuggestions = element.shadowRoot.querySelector(
        selectors.noSuggestions
      );
      expect(spinner).toBeTruthy();
      expect(container).toBeFalsy();
      expect(noSuggestions).toBeFalsy();
    });
  });

  describe('when there are no suggestions', () => {
    it('should render the no-suggestions message', async () => {
      const element = createTestComponent();
      await updateSuggestions();

      const accordion = element.shadowRoot.querySelector(selectors.accordion);
      const noSuggestions = element.shadowRoot.querySelector(
        selectors.noSuggestions
      );
      expect(accordion).toBeFalsy();
      expect(noSuggestions).toBeTruthy();
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

      const accordion = element.shadowRoot.querySelector(selectors.accordion);
      const noSuggestions = element.shadowRoot.querySelector(
        selectors.noSuggestions
      );
      const componentError = element.shadowRoot.querySelector(
        selectors.componentError
      );

      expect(accordion).toBeFalsy();
      expect(noSuggestions).toBeTruthy();
      expect(componentError).toBeFalsy();

      await updateSuggestions();

      const updatedNoSuggestions = element.shadowRoot.querySelector(
        selectors.noSuggestions
      );
      const container = element.shadowRoot.querySelector(selectors.container);
      const updatedAccordion = element.shadowRoot.querySelector(
        selectors.accordion
      );

      expect(updatedNoSuggestions).toBeFalsy();
      expect(container).toBeTruthy();
      expect(updatedAccordion).toBeTruthy();

      const sections = element.shadowRoot.querySelectorAll(
        selectors.accordionSection
      );
      expect(sections.length).toBe(
        documentSuggestionListMock.state.documents.length
      );

      sections.forEach((section, index) => {
        const {uniqueId, title} =
          documentSuggestionListMock.state.documents[index];
        expect(section.label).toBe(title);
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

    it('should not render quickview button when withoutQuickview is set to true', async () => {
      const element = createTestComponent({
        withoutQuickview: true,
      });
      await updateSuggestions();

      expect(element.shadowRoot.querySelector(selectors.quickview)).toBeFalsy();
    });

    it('should log a suggestion click if the suggestion is not opened', async () => {
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

    it('should log analytics when rating a document', async () => {
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

      const element = createTestComponent({
        numberOfAutoOpenedDocuments: 0,
      });
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

      const componentError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(componentError).toBeTruthy();
    });
    it('should set an error message if numberOfAutoOpenedDocuments is invalid', async () => {
      const element = createTestComponent({
        numberOfAutoOpenedDocuments: -1,
      });
      await flushPromises();

      const componentError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(componentError).toBeTruthy();
    });
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const componentError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(componentError).toBeTruthy();
    });
  });
});
