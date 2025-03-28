import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {getQueryAlias, interceptSearch} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {stubConsoleError, stubConsoleWarning} from '../../console-selectors';
import {ResultsPerPageActions as Actions} from './results-per-page-actions';
import {ResultsPerPageExpectations as Expect} from './results-per-page-expectations';

interface ResultsPerPageOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialChoice: number | any;
  choicesDisplayed: string;
  useCase: string;
}

describe('quantic-result-per-page', () => {
  const pageUrl = 's/quantic-results-per-page';

  const defaultInitialChoice = 10;
  const defaultChoices = [10, 25, 50, 100];

  function visitResultsPerPage(
    options: Partial<ResultsPerPageOptions>,
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl, {
      onBeforeLoad(win) {
        stubConsoleError(win);
        stubConsoleWarning(win);
      },
    });
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
    options: Partial<ResultsPerPageOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('with default options', () => {
        it('should work as expected', () => {
          visitResultsPerPage(
            {
              initialChoice: defaultInitialChoice,
              choicesDisplayed: defaultChoices.join(','),
              useCase: param.useCase,
            },
            false
          );

          Expect.choicesEqual(defaultChoices);
          Expect.selectedChoiceEqual(defaultInitialChoice);
          Expect.search.numberOfResults(defaultInitialChoice, param.useCase);

          const nextChoice = 25;
          Actions.selectValue(nextChoice);
          Expect.selectedChoiceEqual(nextChoice);
          Expect.search.numberOfResults(nextChoice, param.useCase);
          Expect.logSelected(nextChoice);

          performSearch();
          Expect.search.numberOfResults(nextChoice, param.useCase);
        });
      });

      describe('with custom options', () => {
        it('should work as expected', () => {
          const initialChoice = 40;
          const choices = [20, 40, 80];

          visitResultsPerPage(
            {
              initialChoice,
              choicesDisplayed: choices.join(','),
              useCase: param.useCase,
            },
            false
          );

          Expect.choicesEqual(choices);
          Expect.selectedChoiceEqual(initialChoice);
          Expect.search.numberOfResults(initialChoice, param.useCase);

          const nextChoice = 20;
          Actions.selectValue(nextChoice);
          Expect.selectedChoiceEqual(nextChoice);
          Expect.search.numberOfResults(nextChoice, param.useCase);
          Expect.logSelected(nextChoice);
        });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading options from URL', () => {
          it('should load the right number of results per page', () => {
            const choice = 50;

            loadFromUrlHash(
              {
                initialChoice: defaultInitialChoice,
                choicesDisplayed: defaultChoices.join(','),
              },
              `numberOfResults=${choice}`
            );

            Expect.selectedChoiceEqual(choice);
            Expect.search.numberOfResults(choice, param.useCase);
          });
        });
      }

      describe('with invalid options', () => {
        beforeEach(() => {
          // This error occasionally occurs with the Salesforce Lightning Modal component, although we don't know exactly why it occurs, we do know that it only occurs in this Cypress test environment and never in the production environment.
          cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include(
              "Cannot read properties of null (reading 'appendChild')"
            );
            return false;
          });
        });

        describe('with initial choice not in choices displayed', () => {
          it('should still load the component and default on the first choice', () => {
            const choicesDisplayed = [10, 15, 20];
            const expectedChoice = choicesDisplayed[0];
            visitResultsPerPage(
              {
                initialChoice: 32,
                choicesDisplayed: [10, 15, 20].join(','),
                useCase: param.useCase,
              },
              false
            );

            Expect.displayChoices(true);
            Expect.choicesEqual(choicesDisplayed);
            Expect.selectedChoiceEqual(expectedChoice);
            Expect.console.warning(true);
            Expect.displayComponentError(false);
            Expect.search.numberOfResults(expectedChoice, param.useCase);
          });
        });

        describe('with invalid initial choice', () => {
          it('should not load the component and display the component error with a negative initialChoice', () => {
            visitResultsPerPage(
              {
                initialChoice: -1,
                choicesDisplayed: defaultChoices.join(','),
                useCase: param.useCase,
              },
              false
            );

            Expect.displayChoices(false);
            Expect.console.error(true);
            Expect.displayComponentError(true);
          });

          it('should not load the component and display the component error with a non-number initialChoice', () => {
            visitResultsPerPage(
              {
                initialChoice: 'foo',
                choicesDisplayed: defaultChoices.join(','),
                useCase: param.useCase,
              },
              false
            );

            Expect.displayChoices(false);
            Expect.console.error(true);
            Expect.displayComponentError(true);
          });
        });

        describe('with invalid choices displayed', () => {
          it('should not load component and display the component error', () => {
            visitResultsPerPage(
              {
                initialChoice: defaultInitialChoice,
                choicesDisplayed: 'this is not valid',
                useCase: param.useCase,
              },
              false
            );

            Expect.displayChoices(false);
            Expect.console.error(true);
            Expect.displayComponentError(true);
          });
        });
      });
    });
  });
});
