import {
  addCustomSortOptions,
  addInvalidCustomSortOptions,
} from '../../../page-objects/actions/action-add-custom-sort-options';
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

  const customSortOptions = [
    {
      label: 'Date ascending',
      value: 'date ascending',
      criterion: {
        by: 'date',
        order: 'ascending',
      },
    },
    {
      label: 'Views Descending',
      value: '@ytviewcount descending',
      criterion: {
        by: 'field',
        field: 'ytviewcount',
        order: 'descending',
      },
    },
    {
      label: 'No Sort',
      value: 'nosort',
    },
  ];

  const defaultCustomOptionValue = 'date ascending';

  const customSortOptionsValues = customSortOptions.map(
    (option) => option.value
  );
  interface SortOptions {
    useCase: string;
    withCustomSortOptions?: boolean;
    withInvalidCustomSortOptions?: boolean;
  }

  interface SortActionsOptions {
    withCustomSortOptions?: boolean;
    withInvalidCustomSortOptions?: boolean;
  }

  function visitSort(
    options: Partial<SortOptions>,
    waitForSearch = true,
    actionsOptions: Partial<SortActionsOptions>
  ) {
    interceptSearch();
    cy.visit(sortUrl);
    configure(options);
    if (actionsOptions.withCustomSortOptions) {
      addCustomSortOptions();
    }
    if (actionsOptions.withInvalidCustomSortOptions) {
      addInvalidCustomSortOptions();
    }
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
          visitSort({useCase: param.useCase}, true, {});

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
              visitSort({useCase: param.useCase}, true, {});
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

      describe('when passing custom options as slots to the component', () => {
        it('should display the custom options properly', () => {
          visitSort({useCase: param.useCase}, true, {
            withCustomSortOptions: true,
          });

          Expect.displaySortDropdown(true);
          Expect.labelContains('Sort by');

          Actions.openDropdown();

          Expect.containsOptions(customSortOptionsValues);
          Expect.optionsEqual(customSortOptions);
        });

        customSortOptionsValues
          .filter((value) => value !== defaultCustomOptionValue)
          .forEach((value) => {
            describe('when selecting a custom option', () => {
              it(`should update the shown selected option to ${value}`, () => {
                visitSort({useCase: param.useCase}, true, {
                  withCustomSortOptions: true,
                });
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

        describe('when the custom option passed has an invalid property', () => {
          it.skip('should display an error message instead of the quanticSort component', () => {
            visitSort({useCase: param.useCase}, true, {
              withInvalidCustomSortOptions: true,
            });

            Expect.displayComponentError(true);
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
