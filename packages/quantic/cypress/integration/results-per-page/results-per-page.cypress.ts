import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {ResultsPerPageExpectations as Expect} from './results-per-page-expectations';
import {ResultsPerPageActions as Actions} from './results-per-page-actions';
import {stubConsoleError} from '../console-selectors';
import {performSearch} from '../../page-objects/actions/action-perform-search';

interface ResultsPerPageOptions {
  initialChoice: number;
  choicesDisplayed: string;
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
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
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

  describe('with default options', () => {
    it('should work as expected', () => {
      visitResultsPerPage(
        {
          initialChoice: defaultInitialChoice,
          choicesDisplayed: defaultChoices.join(','),
        },
        false
      );

      Expect.choicesEqual(defaultChoices);
      Expect.selectedChoiceEqual(defaultInitialChoice);
      Expect.search.numberOfResults(defaultInitialChoice);

      const nextChoice = 25;
      Actions.selectValue(nextChoice);
      Expect.selectedChoiceEqual(nextChoice);
      Expect.search.numberOfResults(nextChoice);
      Expect.logSelected(nextChoice);

      performSearch();
      Expect.search.numberOfResults(nextChoice);
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
        },
        false
      );

      Expect.choicesEqual(choices);
      Expect.selectedChoiceEqual(initialChoice);
      Expect.search.numberOfResults(initialChoice);

      const nextChoice = 20;
      Actions.selectValue(nextChoice);
      Expect.selectedChoiceEqual(nextChoice);
      Expect.search.numberOfResults(nextChoice);
      Expect.logSelected(nextChoice);
    });
  });

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
      Expect.search.numberOfResults(choice);
    });
  });

  describe('with invalid options', () => {
    describe('with initial choice not in choices displayed', () => {
      it('should not load component', () => {
        visitResultsPerPage(
          {
            initialChoice: 32,
            choicesDisplayed: [10, 15, 20].join(','),
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
          },
          false
        );

        Expect.displayChoices(false);
        Expect.console.error(true);
      });
    });
  });
});
