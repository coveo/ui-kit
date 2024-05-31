import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {SearchBoxSelectors, SearchBoxSelector} from './search-box-selectors';

function searchBoxExpectations(selector: SearchBoxSelector) {
  return {
    displayClearRecentQueriesButton: (display: boolean) => {
      selector
        .clearRecentQueriesButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the 'clear recent queries' button`
        );
    },
    querySuggestionsEquals: (querySuggestions: String[]) => {
      querySuggestions.forEach((querySuggestion, index) => {
        selector
          .querySuggestion(index)
          .invoke('attr', 'data-rawvalue')
          .should('equal', querySuggestion)
          .logDetail(
            'should display the query suggestions properly and in the correct order'
          );
      });
    },
    searchWithQuery: (
      expectedQuery: string,
      expectedRecentQueriesInLocalStorage?: {LSkey: string; queries: string[]}
    ) => {
      cy.wait(InterceptAliases.Search)
        .then((interception) => {
          const requestBody = interception.request.body;
          expect(requestBody).to.have.property('q', expectedQuery);
          if (expectedRecentQueriesInLocalStorage) {
            const {LSkey, queries} = expectedRecentQueriesInLocalStorage;
            const recentQueries = window.localStorage.getItem(LSkey);
            expect(recentQueries).to.equal(JSON.stringify(queries));
          }
        })
        .logDetail(
          `should make a search request with the query ${expectedQuery}`
        );
    },
    logClearRecentQueries: () => {
      cy.wait(InterceptAliases.UA.ClearRecentQueries)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'recentQueries');
        })
        .logDetail("should log the 'clearRecentQueries' UA event");
    },
    displayInputSearchBox: (display: boolean, textarea = false) => {
      selector
        .input(textarea)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the input search box`);
    },

    displaySearchButton: (display: boolean) => {
      selector
        .searchButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the search button`);
    },

    displaySuggestionList: (display: boolean) => {
      selector
        .suggestionList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the suggestion list`);
    },
    numberOfQuerySuggestions: (value: number) => {
      selector
        .querySuggestions()
        .should('have.length', value)
        .logDetail(`should display ${value} query suggestions`);
    },
  };
}

export const SearchBoxExpectations = {
  ...searchBoxExpectations(SearchBoxSelectors),
};
