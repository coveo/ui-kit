import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {SummaryExpectations as Expect} from './summary-expectations';

describe('quantic-summary', () => {
  const summarytUrl = 's/quantic-summary';

  function visitSummary(waitForSearch = true) {
    interceptSearch();
    cy.visit(summarytUrl);
    configure();
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(summarytUrl);
    configure();
  }

  it('should not render before results have returned', () => {
    setupWithPauseBeforeSearch();

    Expect.displaySummary(false);
  });

  describe('when loading default summary', () => {
    it('should work as expected', () => {
      visitSummary();

      Expect.displaySummary(true);
      Expect.displayRange(true);
      Expect.displayTotal(true);
    });
  });
});
