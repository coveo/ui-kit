import {configure} from '../../page-objects/configurator';
import {
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {RecentResultsListExpectations as Expect} from './recent-results-list-expectations';
import {scope} from '../../reporters/detailed-collector';
import {selectResults} from '../../page-objects/actions/action-select-results';
import {
  clearLocalStorage,
  setRecentResultsListLocalStorage,
} from '../../page-objects/actions/action-set-local-storage';

interface RecentResultsListOptions {
  maxLength: number;
  target: string;
  label: string;
  isCollapsed: boolean;
}

describe('quantic-recent-results-list', () => {
  const pageUrl = 's/quantic-recent-results-list';
  const defaultLabel = 'Recent Results';

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
    beforeEach(() => {
      clearLocalStorage();
    });
    it('should work as expected', () => {
      visitRecentResultsList({
        maxLength: 3,
      });

      scope('when loading the page', () => {
        Expect.displayResults(false);
        Expect.displayEmptyList(true);
        Expect.labelContains(defaultLabel);
      });

      scope('when selecting different results', () => {
        selectResults();
        Expect.displayEmptyList(false);
        Expect.displayResults(true);
        Expect.numberOfResults(1);
        Expect.logDocumentOpen('1');
        Expect.lastResultContains('1');
        Expect.hrefContainsAtResult('1');

        selectResults();
        Expect.numberOfResults(2);
        Expect.logDocumentOpen('2');
        Expect.lastResultContains('2');
        Expect.hrefContainsAtResult('2');

        selectResults();
        Expect.numberOfResults(3);
        Expect.logDocumentOpen('3');
        Expect.lastResultContains('3');
        Expect.hrefContainsAtResult('3');

        selectResults();
        Expect.numberOfResults(3);
        Expect.logDocumentOpen('4');
        Expect.lastResultContains('4');
        Expect.hrefContainsAtResult('4');

        Expect.displayResult('1', false);
        Expect.displayResult('2', true);
        Expect.displayResult('3', true);
        Expect.displayResult('4', true);
      });
    });

    it('should retrieve recent result list from localStorage', () => {
      setRecentResultsListLocalStorage();

      visitRecentResultsList({
        maxLength: 2,
      });

      Expect.displayResults(true);
      Expect.numberOfResults(2);
      Expect.displayResult('test1', true);
      Expect.displayResult('test2', true);
    });
  });

  describe('with custom options', () => {
    it('should work as expected', () => {
      scope('with custom #label', () => {
        const customLabel = 'Recent Click';
        visitRecentResultsList({
          label: customLabel,
        });

        Expect.displayPlaceholder(true);
        Expect.displayLabel(true);
        Expect.labelContains(customLabel);
      });

      scope('with custom #isCollapsed', () => {
        visitRecentResultsList({
          isCollapsed: true,
        });

        selectResults();
        Expect.displayResults(false);
      });

      scope('with custom #target', () => {
        const customTarget = '_blank';
        visitRecentResultsList({
          target: '_blank',
        });

        selectResults();
        Expect.targetContainsAtResult('1', customTarget);
      });
    });
  });
});
