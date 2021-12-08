import {configure} from '../../page-objects/configurator';
import {
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {RecentResultsListExpectations as Expect} from './recent-results-list-expectations';
import {scope} from '../../reporters/detailed-collector';
import {selectResults} from '../../page-objects/actions/action-select-results';
import {RecentResultsListSelectors} from './recent-results-list-selectors';

interface RecentResultsListOptions {
  maxLength: number;
  target: string;
}

describe('quantic-recent-results-list', () => {
  const pageUrl = 's/quantic-recent-results-list';

  function visitRecentResultsList(
    options: Partial<RecentResultsListOptions> = {},
    clearStorage = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (clearStorage) {
      localStorage.setItem('_quantic-recent-results', '');
    }
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure();
  }

  it('should render a placeholder before results have returned', () => {
    setupWithPauseBeforeSearch();

    Expect.displayPlaceholder(true);
    Expect.displayResults(false);
  });

  describe('with default options', () => {
    it('should work as expected', () => {
      visitRecentResultsList({
        maxLength: 3,
      });

      scope('when loading the page', () => {
        Expect.displayResults(false);
        Expect.displayEmptyList(true);
      });

      scope('when selecting different results', () => {
        selectResults();
        Expect.displayEmptyList(false);
        Expect.displayResults(true);
        Expect.numberOfResults(1);
        selectResults();
        Expect.numberOfResults(2);
        selectResults();
        Expect.numberOfResults(3);
        selectResults();
        Expect.numberOfResults(3);
      });
    });
  });

  describe('with custom options', () => {
    it('should work as expected', () => {});
  });
});
