import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {AriaLiveExpectations} from '../../default-1/aria-live/aria-live-expectations';
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
          .querySuggestionByIndex(index)
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
    displaySearchBoxInput: (display: boolean, textarea = false) => {
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
        .logDetail(`${should(display)} display the query suggestions list`);
    },
    numberOfQuerySuggestions: (value: number) => {
      selector
        .querySuggestions()
        .should('have.length', value)
        .logDetail(`should display ${value} query suggestions`);
    },
    searchInputHasAriaOwnsValue: (textarea = false) => {
      selector
        .input(textarea)
        .then((inputElement) => {
          selector.suggestionList().then((suggestionListElement) => {
            const actualValue = inputElement[0].getAttribute('aria-owns');
            expect(actualValue).to.equal(suggestionListElement[0].id);
          });
          return;
        })
        .logDetail(
          'The search input should have the id of the suggestion list as its value for the aria-owns attribute'
        );
    },
    searchInputHasAriaActiveDescendantValue: (
      textarea = false,
      index: number
    ) => {
      selector
        .input(textarea)
        .then((inputElement) => {
          selector
            .querySuggestionByIndex(index)
            .then((suggestionOptionElement) => {
              const actualValue = inputElement[0].getAttribute(
                'aria-activedescendant'
              );
              expect(actualValue).to.equal(suggestionOptionElement[0].id);
            });
          return;
        })
        .logDetail(
          `the aria-activedescendant attribute of the searchbox input should have the id of the ${index}-th suggestion as its value`
        );
    },
    searchInputHasNoAriaActiveDescendantValue: (textarea = false) => {
      selector
        .input(textarea)
        .should('not.have.attr', 'aria-activedescendant')
        .logDetail(
          'The search input should not have the aria-activedescendant attribute'
        );
    },
    logClearRecentQueries: () => {
      cy.wait(InterceptAliases.UA.RecentQueries.ClearRecentQueries)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'recentQueries');
        })
        .logDetail("should log the 'clearRecentQueries' UA event");
    },
    logClickRecentQueries: (queryText: string) => {
      cy.wait(InterceptAliases.UA.RecentQueries.ClickRecentQueries)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('queryText', queryText);
        })
        .logDetail(
          `should log the 'recentQueriesClick' UA event with the correct value: ${queryText}`
        );
    },
    logClickSuggestion: (queryText: string) => {
      cy.wait(InterceptAliases.UA.OmniboxAnalytics)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('queryText', queryText);
        })
        .logDetail("should log the 'omniboxAnalytics' UA event");
    },
  };
}

export const SearchBoxExpectations = {
  ...searchBoxExpectations(SearchBoxSelectors),
  ariaLive: {
    ...AriaLiveExpectations,
  },
};
