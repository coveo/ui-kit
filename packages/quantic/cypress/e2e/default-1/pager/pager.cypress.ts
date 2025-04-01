import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {stubConsoleError} from '../../console-selectors';
import {PagerActions as Actions} from './pager-actions';
import {PagerExpectations as Expect} from './pager-expectations';

interface PagerOptions {
  useCase: string;
  numberOfPages: number;
}

describe('quantic-pager', () => {
  const pageUrl = 's/quantic-pager';

  function visitPager(options: Partial<PagerOptions>, waitForSearch = true) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(options.useCase));
    }
  }

  function loadFromUrlHash(
    options: Partial<PagerOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  function setupWithPauseBeforeSearch(useCase: string) {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure({
      numberOfPages: 5,
      useCase: useCase,
    });
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      it('should not render before results have returned', () => {
        setupWithPauseBeforeSearch(param.useCase);

        Expect.displayPrevious(false);
        Expect.displayNext(false);
        Expect.numberOfPages(0);
      });

      describe('with default options', () => {
        it('should work as expected', () => {
          visitPager({
            numberOfPages: 5,
            useCase: param.useCase,
          });

          scope('when loading the page', () => {
            Expect.displayPrevious(true);
            Expect.previousEnabled(false);
            Expect.displayNext(true);
            Expect.nextEnabled(true);
            Expect.numberOfPages(5);
            Expect.selectedPageContains(1);
          });

          scope('when clicking next page', () => {
            Actions.clickNext();
            Expect.logNextPage();
            Expect.selectedPageContains(2);
          });

          scope('when clicking previous page', () => {
            Actions.clickPrevious();
            Expect.logPreviousPage();
            Expect.selectedPageContains(1);
          });

          scope('when selecting a specific page', () => {
            Actions.selectPage(3);
            Expect.logPageNumber(3);
            Expect.selectedPageContains(3);
          });

          scope('when performing a new search query', () => {
            performSearch();
            cy.wait(getQueryAlias(param.useCase));
            Expect.selectedPageContains(1);
          });
        });
      });

      describe('with custom number of pages', () => {
        it('should display the right number of pages', () => {
          visitPager({
            numberOfPages: 10,
            useCase: param.useCase,
          });

          Expect.numberOfPages(10);
        });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading options from URL', () => {
          it('should select the right page', () => {
            loadFromUrlHash(
              {
                numberOfPages: 5,
              },
              'firstResult=30'
            );

            Expect.selectedPageContains(4);
          });
        });
      }

      describe('with invalid properties', () => {
        beforeEach(() => {
          // This error occasionally occurs with the Salesforce Lightning Modal component, although we don't know exactly why it occurs, we do know that it only occurs in this Cypress test environment and never in the production environment.
          cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include(
              "Cannot read properties of null (reading 'appendChild')"
            );
            return false;
          });
        });

        describe('with an invalid value of the number of pages property', () => {
          it('should not load the component', () => {
            interceptSearch();
            cy.visit(pageUrl, {
              onBeforeLoad(win) {
                stubConsoleError(win);
              },
            });
            configure({
              numberOfPages: -1,
              useCase: param.useCase,
            });

            Expect.displayPrevious(false);
            Expect.displayNext(false);
            Expect.numberOfPages(0);
            Expect.console.error(true);
            Expect.displayComponentError(true);
          });
        });

        describe('with an invalid type of the number of pages property', () => {
          it('should not load the component', () => {
            interceptSearch();
            cy.visit(pageUrl, {
              onBeforeLoad(win) {
                stubConsoleError(win);
              },
            });
            configure({
              numberOfPages: 'invalid type',
              useCase: param.useCase,
            });

            Expect.displayPrevious(false);
            Expect.displayNext(false);
            Expect.numberOfPages(0);
            Expect.console.error(true);
            Expect.displayComponentError(true);
          });
        });
      });
    });
  });
});
