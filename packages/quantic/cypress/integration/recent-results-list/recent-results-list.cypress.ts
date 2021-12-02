import {configure} from '../../page-objects/configurator';
import {
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {RecentResultsListExpectations as Expect} from './recent-results-list-expectations';
import {scope} from '../../reporters/detailed-collector';

interface RecentResultsListOptions {
  maxLength: number;
  target: string;
}

describe('quantic-recent-results-list', () => {
  const pageUrl = 's/quantic-recent-results-list';

  function visitRecentResultsList(
    options: Partial<RecentResultsListOptions> = {}
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
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
      visitRecentResultsList();

      scope('when loading the page', () => {
        Expect.displayResults(false);
        Expect.displayEmptyList(true);
      });

      scope('when selecting different results', () => {});
    });
  });

  describe('with custom options', () => {
    it('should work as expected', () => {});
  });
});
