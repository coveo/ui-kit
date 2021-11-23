import {configure, reset} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {scope} from '../../reporters/detailed-collector';
import {SummaryExpectations as Expect} from './summary-expectations';
import {ResultsPerPageActions} from '../results-per-page/results-per-page-actions';

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
        console.log(interception);
      });
      Expect.displaySummary(true);
      Expect.displayQuery(false);
      Expect.displayRange(true);
      Expect.rangeContains('1-25');
      Expect.displayTotal(true);
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
      Expect.totalContains('1');
      Expect.displayQuery(true);
      Expect.queryContains(query);
    });
  });

  describe('when selecting result per page', () => {
    it('should work as expected', () => {
      visitSummary();
      ResultsPerPageActions.selectValue(2);
      cy.wait(InterceptAliases.Search);

      Expect.displaySummary(true);
      Expect.displayRange(true);
      Expect.rangeContains('1-25');
      Expect.displayTotal(true);
    });
  });
});
