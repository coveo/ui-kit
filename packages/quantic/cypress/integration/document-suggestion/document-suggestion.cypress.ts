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

describe('quantic-document-suggestion', () => {
  const pageUrl = 's/quantic-document-suggestion';

  const allDocuments = [
    {
      uniqueId: '1',
      title: 'Document 1',
      excerpt: 'The excerpt of the first document suggestion.',
      hasHtmlVersion: true,
      fields: {
        uri: 'test',
      },
    },
    {
      uniqueId: '2',
      title: 'Document 2',
      excerpt: 'The excerpt of the second document suggestion.',
      hasHtmlVersion: true,
      fields: {
        uri: 'test',
      },
    },
    {
      uniqueId: '3',
      title: 'Document 3',
      excerpt: 'The excerpt of the third document suggestion.',
      hasHtmlVersion: true,
      fields: {
        uri: 'test',
      },
    },
    {
      uniqueId: '4',
      title: 'Document 4',
      excerpt: 'The excerpt of the fourth document suggestion.',
      hasHtmlVersion: true,
      fields: {
        uri: 'test',
      },
    },
    {
      uniqueId: '5',
      title: 'Document 5',
      excerpt: 'The excerpt of the fifth document suggestion.',
      hasHtmlVersion: true,
      fields: {
        uri: 'test',
      },
    },
  ];

  function visitDocumentSuggestion(options: Partial<{}> = {}) {
    interceptCaseAssist();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the component and all parts', () => {
      mockDocumentSuggestion(allDocuments);
      visitDocumentSuggestion();

      scope('when loading the page', () => {
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(allDocuments.length);
      });

      scope('when clicking on a document suggestion', () => {
        const clickIndex = 1;

        Actions.clickSuggestion(clickIndex);
        Expect.logClickingSuggestion(clickIndex);
      });

      scope('when rating a document suggestion', () => {
        const clickIndex = 1;

        sendRating(clickIndex);
        Expect.logRatingSuggestion(clickIndex);
      });
    });
  });

  describe('when there is no document suggestion', () => {
    it('should not render any document suggestion', () => {
      mockDocumentSuggestion([]);
      visitDocumentSuggestion();

      scope('when loading the page', () => {
        Expect.displayAccordion(true);
        Expect.numberOfSuggestions(0);
      });
    });
  });

  describe('when the suggestions are loading', () => {
    it('should display the loading spinner', () => {
      visitDocumentSuggestion();

      scope('when fetching suggestions', () => {
        interceptSuggestionIndefinitely();
        Expect.displayAccordion(false);
        Expect.numberOfSuggestions(0);
        Expect.displayLoading(true);
      });
    });
  });
});
