import {should} from '../common-selectors';
import {
  RecentResultsListSelectors,
  RecentResultsListSelector,
} from './recent-results-list-selectors';

function recentResultsListExpectations(selector: RecentResultsListSelector) {
  return {
    displayPlaceholder: (display: boolean) => {
      selector
        .placeholder()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the placeholder`);
    },
    displayResults: (display: boolean) => {
      selector
        .results()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display results`);
    },
    displayEmptyList: (display: boolean) => {
      selector
        .emptyList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display empty list`);
    },
    numberOfResults: (length: number) => {
      selector
        .results()
        .should('have.length', length)
        .logDetail(`should display ${length} results in the list`);
    },
  };
}

export const RecentResultsListExpectations = {
  ...recentResultsListExpectations(RecentResultsListSelectors),
};
