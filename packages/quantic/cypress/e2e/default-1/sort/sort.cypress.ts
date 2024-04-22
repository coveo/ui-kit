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
import {SortActions as Actions} from './sort-actions';
import {SortExpectations as Expect} from './sort-expectations';

describe('quantic-sort', () => {
  const sortUrl = 's/quantic-sort';

  const defaultOptionValue = 'relevancy';
  const sortOptions = [
    {
      value: 'relevancy',
      label: 'Relevancy',
    },
    {
      value: 'date descending',
      label: 'Newest',
    },
    {
      value: 'date ascending',
      label: 'Oldest',
    },
  ];
  const sortOptionValues = sortOptions.map((option) => option.value);

  interface SortOptions {
    useCase: string;
  }

  function visitSort(options: Partial<SortOptions>, waitForSearch = true) {
    interceptSearch();
    cy.visit(sortUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(options.useCase));
    }
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();
    cy.visit(`${sortUrl}#${urlHash}`);
    configure();
  }

  function setupWithPauseBeforeSearch(useCase: string) {
    interceptSearchIndefinitely();
    cy.visit(sortUrl);
    configure({useCase: useCase});
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      it('should not render before results have returned', () => {
        setupWithPauseBeforeSearch(param.useCase);

        Expect.displaySortDropdown(false);
      });

      describe('when loading default sort', () => {
        it('should work as expected', () => {
          visitSort({useCase: param.useCase});

          Expect.displaySortDropdown(true);
          Expect.labelContains('Sort by');

          Actions.openDropdown();

          Expect.containsOptions(sortOptionValues);
          Expect.optionsEqual(sortOptions);
          Expect.selectedOption(defaultOptionValue);
        });
      });

      describe('when selecting a sort option', () => {
        sortOptionValues
          .filter((value) => value !== defaultOptionValue)
          .forEach((value) => {
            it(`should update the shown selected option to ${value}`, () => {
              visitSort({useCase: param.useCase});
              Actions.selectOption(value);

              Expect.selectedOption(value);
              Expect.completeSearchRequest(
                'resultsSort',
                param.useCase,
                (body) => Expect.sortCriteriaInSearchRequest(body, value)
              );
              Expect.logSortResults(value);
            });
          });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading sort selection from URL', () => {
          sortOptionValues
            .filter((value) => value !== defaultOptionValue)
            .forEach((value) => {
              it(`should sort by ${value}`, () => {
                loadFromUrlHash(`sortCriteria=${encodeURI(value)}`);

                Expect.completeSearchRequest(
                  'interfaceLoad',
                  param.useCase,
                  (body) => Expect.sortCriteriaInSearchRequest(body, value)
                );
                Actions.openDropdown();

                Expect.displaySortDropdown(true);
                Expect.selectedOption(value);
              });
            });
        });
      }
    });
  });
});
