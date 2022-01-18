import {configure} from '../../page-objects/configurator';
import {interceptSearch} from '../../page-objects/search';
import {StandaloneSearchBoxExpectations as Expect} from './standalone-search-box-expectations';
import {StandaloneSearchBoxActions as Actions} from './standalone-search-box-actions';
import {
  clearLocalStorage,
  typeQueriesListLocalStorage,
} from '../../page-objects/actions/action-set-local-storage';
import {scope} from '../../reporters/detailed-collector';

interface StandaloneSearchBoxOptions {
  placeholder: string;
  withoutSubmitButton: boolean;
  numberOfSuggestions: number;
  redirectUrl: string;
}

describe('quantic-standalone-search-box', () => {
  const standaloneSearchBoxUrl = 's/quantic-standalone-search-box';

  function visitStandaloneSearchBox(
    options: Partial<StandaloneSearchBoxOptions> = {}
  ) {
    interceptSearch();
    cy.visit(standaloneSearchBoxUrl);
    configure(options);
  }

  describe('with default option', () => {
    it('should work as expected', () => {
      scope('when loading standalone search box', () => {
        visitStandaloneSearchBox();

        Expect.displayInputSearchBox(true);
        Expect.displaySearchButton(true);
      });

      scope('when setting queries in local storage', () => {
        typeQueriesListLocalStorage(
          '["query 1", "query 2", "query 3", "query 4", "query 5", "query 6"]'
        );
        visitStandaloneSearchBox();
        clearLocalStorage();
      });

      scope('when submitting a search', () => {
        visitStandaloneSearchBox();

        Actions.typeInSearchBox('some query');
        Expect.displaySuggestionList(true);
        Expect.displayCloseIcon(true);
      });
    });
  });

  describe('with custom option', () => {
    it('should work as expected', () => {
      visitStandaloneSearchBox();
    });
  });
});
