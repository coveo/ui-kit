import {InterceptAliases} from '../../page-objects/search';
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
  };
}

export const RecentResultsListExpectations = {
  ...recentResultsListExpectations(RecentResultsListSelectors),
};
