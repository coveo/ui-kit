import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {SummaryExpectations as Expect} from './summary-expectations';
import {getNextResults} from '../../page-objects/actions/action-get-next-results';
import {
  setPageSizeValue,
  setResultsPerPage,
} from '../../page-objects/actions/action-set-results-per-page';

describe('quantic-summary', () => {
  const summaryUrl = 's/quantic-summary';
  const defaultNumberOfResults = 10;

  function visitSummary(waitForSearch = true) {
    interceptSearch();
    cy.visit(summaryUrl);
    configure();
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(summaryUrl);
    configure();
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();

    cy.visit(`${summaryUrl}#${urlHash}`);
    configure();
  }

  it('should not render before results have returned', () => {
    setupWithPauseBeforeSearch();

    Expect.displaySummary(false);
  });

  describe('when loading default summary', () => {
    it('should work as expected', () => {
      visitSummary(false);

      cy.wait(InterceptAliases.Search).then((interception) => {
        Expect.displaySummary(true);
        Expect.displayQuery(false);
        Expect.displayRange(true);
        Expect.rangeContains(`1-${defaultNumberOfResults}`);
        Expect.displayTotal(true);
        Expect.totalContains(interception.response?.body.totalCount);
      });
    });
  });

  describe('when a query yields no results', () => {
    it('should work as expected', () => {
      const url =
        'q=nowaythisquerywillevereverevertreturnanythingitsimpossible';
      loadFromUrlHash(url);

      Expect.displaySummary(false);
    });
  });

  describe('when a query yields one result', () => {
    it('should work as expected', () => {
      const query = "Queen's Gambit sparks world of online chess celebrities";
      const url = `q=${query}`;
      loadFromUrlHash(url);

      Expect.displaySummary(true);
      Expect.displayRange(true);
      Expect.rangeContains('1-1');
      Expect.displayTotal(true);
      Expect.totalContains(1);
      Expect.displayQuery(true);
      Expect.queryContains(query);
    });
  });

  describe('when selecting result per page', () => {
    it('should work as expected', () => {
      visitSummary();
      const customResultsPerPage = 45;
      setPageSizeValue(customResultsPerPage);
      setResultsPerPage();

      cy.wait(InterceptAliases.Search).then((interception) => {
        Expect.displaySummary(true);
        Expect.displayQuery(false);
        Expect.displayRange(true);
        Expect.rangeContains(`1-${customResultsPerPage}`);
        Expect.displayTotal(true);
        Expect.totalContains(interception.response?.body.totalCount);
      });
    });
  });

  describe('when selecting next page', () => {
    it('should work as expected', () => {
      visitSummary();

      getNextResults();

      cy.wait(InterceptAliases.Search).then((interception) => {
        Expect.displaySummary(true);
        Expect.displayQuery(false);
        Expect.displayRange(true);
        Expect.rangeContains(
          `${defaultNumberOfResults + 1}-${defaultNumberOfResults * 2}`
        );
        Expect.displayTotal(true);
        Expect.totalContains(interception.response?.body.totalCount);
      });
    });
  });
});
