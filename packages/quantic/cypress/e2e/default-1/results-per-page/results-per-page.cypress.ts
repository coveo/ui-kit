import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {getAlias, interceptSearch} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {stubConsoleError} from '../../console-selectors';
import {ResultsPerPageActions as Actions} from './results-per-page-actions';
import {ResultsPerPageExpectations as Expect} from './results-per-page-expectations';

interface ResultsPerPageOptions {
  initialChoice: number;
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
      },
    });
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getAlias(options.useCase));
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
        describe('with initial choice not in choices displayed', () => {
          it('should not load component', () => {
            visitResultsPerPage(
              {
                initialChoice: 32,
                choicesDisplayed: [10, 15, 20].join(','),
                useCase: param.useCase,
              },
              false
            );

            Expect.displayChoices(false);
            Expect.console.error(true);
          });
        });

        describe('with invalid initial choice', () => {
          it('should not load component', () => {
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
          });
        });

        describe('with invalid choices displayed', () => {
          it('should not load component', () => {
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
          });
        });
      });
    });
  });
});
