import {configure} from '../../page-objects/configurator';
import {DocumentSuggestionExpectations as Expect} from './document.suggestion.expectations';
import {DocumentSuggestionActions as Actions} from './document-suggestion-actions';
import {scope} from '../../reporters/detailed-collector';
import {
  interceptCaseAssist,
  mockDocumentSuggestion,
  interceptSuggestionIndefinitely,
} from '../../page-objects/case-assist';
import {sendRating} from '../../page-objects/actions/action-send-rating';
import allDocuments from '../../fixtures/documentSuggestions.json';
import {fetchSuggestions} from '../../page-objects/actions/action-get-suggestions';
import {stubConsoleWarning} from '../console-selectors';

interface DocumentSuggestionOptions {
  maxDocuments: number;
  fetchOnInit: boolean;
  showQuickview: boolean;
  numberOfAutoOpenedDocuments: number;
}

describe('quantic-document-suggestion', () => {
  const pageUrl = 's/quantic-document-suggestion';

  const defaultMaxDocuments = 5;

  function visitDocumentSuggestion(
    options: Partial<DocumentSuggestionOptions> = {}
  ) {
    interceptCaseAssist();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the component and all parts', () => {
      visitDocumentSuggestion();

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
      });

      scope('when clicking on a document suggestion', () => {
        const clickIndex = 1;

        Actions.clickSuggestion(clickIndex);
        Expect.logClickingSuggestion(clickIndex, allDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayAccordionSectionContent(true, clickIndex);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex, allDocuments);
      });
    });
  });

  describe('when fetchOnInit property is set to true', () => {
    it('should render the component and all parts', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({fetchOnInit: true});

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
      });

      scope('when clicking on a document suggestion', () => {
        const clickIndex = 1;

        Actions.clickSuggestion(clickIndex);
        Expect.logClickingSuggestion(clickIndex, allDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayAccordionSectionContent(true, clickIndex);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex, allDocuments);
      });
    });
  });

  describe('when using a custom number maxDocuments', () => {
    const maxDocuments = 3;

    it('should render the component and all parts', () => {
      visitDocumentSuggestion({
        maxDocuments,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(maxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviews(false);
      });

      scope('when clicking on a document suggestion', () => {
        const clickIndex = 1;

        Actions.clickSuggestion(clickIndex);
        Expect.logClickingSuggestion(clickIndex, allDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayAccordionSectionContent(true, clickIndex);
        Expect.displayQuickviews(false);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex, allDocuments);
      });
    });
  });

  describe('when using a custom number of automatically opened documents', () => {
    it('should render the component and all parts', () => {
      const numberOfAutoOpenedDocuments = 2;

      visitDocumentSuggestion({
        numberOfAutoOpenedDocuments,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        for (let i = 0; i < numberOfAutoOpenedDocuments; i++) {
          Expect.displayAccordionSectionContent(true, i);
        }
        Expect.displayQuickviews(false);
      });
    });

    it('should render the component and all parts when the number of automatically opened documents is set to 0', () => {
      visitDocumentSuggestion({
        numberOfAutoOpenedDocuments: 0,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(false, 0);

        Expect.displayQuickviews(false);
      });
    });
  });

  describe('when using an invalid number of automatically opened documents', () => {
    it('should not open any document when the number of automatically opened documents is inferior to 0', () => {
      interceptCaseAssist();
      cy.visit(pageUrl, {
        onBeforeLoad(win) {
          stubConsoleWarning(win);
        },
      });
      configure({
        numberOfAutoOpenedDocuments: -1,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
        Expect.console.warning(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(false, 0);
        Expect.displayQuickviews(false);
      });
    });

    it('should open all the documents when the number of automatically opened documents is superior to 5', () => {
      visitDocumentSuggestion({
        numberOfAutoOpenedDocuments: defaultMaxDocuments + 1,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        for (let i = 0; i < defaultMaxDocuments; i++) {
          Expect.displayAccordionSectionContent(true, i);
        }
        Expect.displayQuickviews(false);
      });
    });
  });

  describe('when using an invalid number maxDocuments', () => {
    it('should render one document suggestion when maxDocuments is equal to 0', () => {
      interceptCaseAssist();
      cy.visit(pageUrl, {
        onBeforeLoad(win) {
          stubConsoleWarning(win);
        },
      });
      configure({
        maxDocuments: 0,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
        Expect.console.warning(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(1);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviews(false);
      });
    });

    it('should render one document suggestion when maxDocuments is inferior to 0', () => {
      interceptCaseAssist();
      cy.visit(pageUrl, {
        onBeforeLoad(win) {
          stubConsoleWarning(win);
        },
      });
      configure({
        maxDocuments: -1,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
        Expect.console.warning(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(1);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviews(false);
      });
    });

    it('should render five document suggestions when maxDocuments is superior to 5', () => {
      visitDocumentSuggestion({
        maxDocuments: 6,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(5);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviews(false);
      });
    });
  });

  describe('when there is no document suggestion', () => {
    it('should not render any document suggestion', () => {
      visitDocumentSuggestion();

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion([]);
        fetchSuggestions();
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });
    });
  });

  describe('when the suggestions are loading', () => {
    it('should display the loading spinner', () => {
      visitDocumentSuggestion();

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        interceptSuggestionIndefinitely();
        fetchSuggestions();
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(false);
        Expect.displayLoading(true);
      });
    });
  });

  describe('when showQuickView is set to true', () => {
    it('should render the component and all parts', () => {
      visitDocumentSuggestion({
        showQuickview: true,
      });

      scope('when loading the page', () => {
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(true);
      });

      scope('when fetching suggestions', () => {
        mockDocumentSuggestion(allDocuments);
        fetchSuggestions();
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
      });

      scope('when clicking on a document suggestion', () => {
        const clickIndex = 1;

        Actions.clickSuggestion(clickIndex);
        Expect.logClickingSuggestion(clickIndex, allDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayAccordionSectionContent(true, clickIndex);
        Expect.displayQuickviewButton(true, 0);
        Expect.displayQuickviewButton(true, 1);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex, allDocuments);
      });
    });
  });
});
