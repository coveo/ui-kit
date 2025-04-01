import {getNextResults} from '../../../page-objects/actions/action-get-next-results';
import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {
  setPageSizeValue,
  setResultsPerPage,
} from '../../../page-objects/actions/action-set-results-per-page';
import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  interceptSearch,
  interceptSearchIndefinitely,
  mockSearchNoResults,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {SummaryExpectations as Expect} from './summary-expectations';

describe('quantic-summary', () => {
  const summaryUrl = 's/quantic-summary';
  const defaultNumberOfResults = 10;

  function visitSummary(useCase: string, waitForSearch = true) {
    interceptSearch();
    cy.visit(summaryUrl);
    configure({useCase: useCase});
    if (useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(useCase));
    }
  }

  function setupWithPauseBeforeSearch(useCase: string) {
    interceptSearchIndefinitely();
    cy.visit(summaryUrl);
    configure({useCase: useCase});
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();

    cy.visit(`${summaryUrl}#${urlHash}`);
    configure();
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      it('should not render before results have returned', () => {
        setupWithPauseBeforeSearch(param.useCase);

        Expect.displaySummary(false);
      });

      describe('when loading default summary', () => {
        it('should work as expected', () => {
          visitSummary(param.useCase, false);

          cy.wait(getQueryAlias(param.useCase)).then((interception) => {
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
          mockSearchNoResults(param.useCase);
          visitSummary(param.useCase);

          Expect.displaySummary(false);
        });
      });

      if (param.useCase === useCaseEnum.search) {
        // TODO: SFINT-5204
        describe.skip('when a query yields one result', () => {
          it('should work as expected', () => {
            const query =
              "Queen's Gambit sparks world of online chess celebrities";
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
      }

      describe('when selecting result per page', () => {
        it('should work as expected', () => {
          visitSummary(param.useCase);
          const customResultsPerPage = 45;
          setPageSizeValue(customResultsPerPage);
          setResultsPerPage();

          cy.wait(getQueryAlias(param.useCase)).then((interception) => {
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
          visitSummary(param.useCase);

          getNextResults();

          cy.wait(getQueryAlias(param.useCase)).then((interception) => {
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
  });
});
