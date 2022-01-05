import {configure} from '../../page-objects/configurator';
import {DocumentSuggestionExpectations as Expect} from './document.suggestiom.expectations';
import {scope} from '../../reporters/detailed-collector';

describe('quantic-document-suggestion', () => {
  const pageUrl = 's/quantic-document-suggestion';

  function visitDocumentSuggestion(options: Partial<{}>) {
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the component and all parts', () => {
      visitDocumentSuggestion({});

      scope('when loading the page', () => {
        Expect.displayAccordion(true);
      });
    });
  });
});
