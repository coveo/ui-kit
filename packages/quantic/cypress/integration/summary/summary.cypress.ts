import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {SummaryExpectations as Expect} from './summary-expectations';
import {
  setPageSizeValue,
  setResultsPerPage,
} from '../../page-objects/actions/action-set-results-per-page';

describe('quantic-summary', () => {
  const summaryUrl = 's/quantic-summary';

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
        Expect.rangeContains(`1-${interception.response?.body.results.length}`);
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

      setPageSizeValue(45);
      setResultsPerPage();

      cy.wait(InterceptAliases.Search).then((interception) => {
        Expect.displaySummary(true);
        Expect.displayQuery(false);
        Expect.displayRange(true);
        Expect.rangeContains(`1-${interception.response?.body.results.length}`);
        Expect.displayTotal(true);
        Expect.totalContains(interception.response?.body.totalCount);
      });
    });
  });
});
