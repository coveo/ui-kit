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
  preventFetchOnInit: boolean;
  hideQuickview: boolean;
  numberOfAutoOpenedDocuments: number;
}

describe('quantic-document-suggestion', () => {
  const pageUrl = 's/quantic-document-suggestion';

  const defaultMaxDocuments = 3;
  const defaultNumberAutoOpenedDocuments = 1;

  function visitDocumentSuggestion(
    options: Partial<DocumentSuggestionOptions> = {}
  ) {
    interceptCaseAssist();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the component and all parts', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion();

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
        for (
          let i = defaultNumberAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });

      scope('when clicking on a document suggestion', () => {
        const clickIndex = 1;

        Actions.clickSuggestion(clickIndex);
        Expect.logClickingSuggestion(clickIndex, allDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
        Expect.displayAccordionSectionContent(true, clickIndex);
        Expect.displayQuickviewButton(true, clickIndex);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex, allDocuments);
      });

      scope('when opening a quickview of a document suggestion', () => {
        const clickIndex = 0;

        Actions.openQuickview(clickIndex);
        Expect.logClickingSuggestion(clickIndex, allDocuments, true);
        Actions.closeQuickview();
      });
    });
  });

  describe('when preventFetchOnInit property is set to true', () => {
    it('should render the component and all parts', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({preventFetchOnInit: true});

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
        Expect.displayQuickviewButton(true, clickIndex);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex, allDocuments);
      });
    });
  });

  describe('when using a custom number maxDocuments', () => {
    const maxDocuments = 4;

    it('should render the component and all parts', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({
        maxDocuments,
      });

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(maxDocuments);
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
        Expect.displayQuickviewButton(true, clickIndex);
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
      mockDocumentSuggestion(allDocuments);
      const numberOfAutoOpenedDocuments = 2;

      visitDocumentSuggestion({
        numberOfAutoOpenedDocuments,
      });

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        for (let i = 0; i < numberOfAutoOpenedDocuments; i++) {
          Expect.displayAccordionSectionContent(true, i);
          Expect.displayQuickviewButton(true, i);
        }
        for (
          let i = numberOfAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });
    });

    it('should render the component and all parts when the number of automatically opened documents is set to 0', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({
        numberOfAutoOpenedDocuments: 0,
      });

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        for (let i = 0; i < defaultMaxDocuments; i++) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });
    });
  });

  describe('when using an invalid number of automatically opened documents', () => {
    it('should open the default number of automatically opened documents if the value given of this property is inferior to 0', () => {
      mockDocumentSuggestion(allDocuments);
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
        Expect.console.warning(true);
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
        for (
          let i = defaultNumberAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });
    });

    it('should open all the documents when the number of automatically opened documents is superior to 5', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({
        numberOfAutoOpenedDocuments: defaultMaxDocuments + 1,
      });

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        for (let i = 0; i < defaultMaxDocuments; i++) {
          Expect.displayAccordionSectionContent(true, i);
          Expect.displayQuickviewButton(true, i);
        }
      });
    });
  });

  describe('when using an invalid number maxDocuments', () => {
    it('should render the default number of max documents when the value of this property is equal to 0', () => {
      mockDocumentSuggestion(allDocuments);
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
        Expect.console.warning(true);
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
        for (
          let i = defaultNumberAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });
    });

    it('should render the default number of max documents when the value of this property is inferior to 0', () => {
      mockDocumentSuggestion(allDocuments);
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
        Expect.console.warning(true);
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
        for (
          let i = defaultNumberAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });
    });

    it('should render five document suggestions when maxDocuments is superior to 5', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({
        maxDocuments: 6,
      });

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(5);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviewButton(true, 0);
        for (
          let i = defaultNumberAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
      });
    });
  });

  describe('when there is no document suggestion', () => {
    it('should not render any document suggestion', () => {
      mockDocumentSuggestion([]);
      visitDocumentSuggestion();

      scope('when loading the page', () => {
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
        interceptSuggestionIndefinitely();
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayNoSuggestions(false);
        Expect.displayLoading(true);
      });
    });
  });

  describe('when hideQuickView is set to true', () => {
    it('should render the component and all parts', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion({
        hideQuickview: true,
      });

      scope('when loading the page', () => {
        Expect.displayNoSuggestions(false);
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(defaultMaxDocuments);
        Expect.displayAccordionSectionContent(true, 0);
        Expect.displayQuickviews(false);
        for (
          let i = defaultNumberAutoOpenedDocuments;
          i < defaultMaxDocuments;
          i++
        ) {
          Expect.displayAccordionSectionContent(false, i);
        }
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
});
