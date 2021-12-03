import {should} from '../common-selectors';
import {
  RecentQueriesListSelector,
  RecentQueriesListSelectors,
} from './recent-queries-list-selectors';

function recentQueriesListExpectations(selector: RecentQueriesListSelector) {
  return {
    displayPlaceholder: (display: boolean) => {
      selector
        .placeholder()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the placeholder`);
    },
    displayQueries: (display: boolean) => {
      selector
        .queries()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display queries list`);
    },
    displayEmptyList: (display: boolean) => {
      selector
        .emptyList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display empty list`);
    },
    lastQueryContains: (query: string) => {
      selector
        .lastQuery()
        .contains(query)
        .logDetail(`The last query added should contain "${query}"`);
    },
    numberOfQueries: (length: number) => {
      selector
        .queries()
        .should('have.length', length)
        .logDetail(`should display ${length} queries in the list`);
    },
    displayQuery: (value: string, display: boolean) => {
      selector
        .query(value)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display query with value: "${value}"`);
    },
    urlHashContains: (query: string) => {
      const urlHash = `#q=${query}`;
      cy.url()
        .should('include', urlHash)
        .logDetail(`URL hash should contain "${urlHash}"`);
    },
  };
}

export const RecentQueriesListExpectations = {
  ...recentQueriesListExpectations(RecentQueriesListSelectors),
};
