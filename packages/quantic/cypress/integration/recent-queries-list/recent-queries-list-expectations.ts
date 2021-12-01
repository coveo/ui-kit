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
  };
}

export const RecentQueriesListExpectations = {
  ...recentQueriesListExpectations(RecentQueriesListSelectors),
};
