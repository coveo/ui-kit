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
  const invalidSortConfigurationError =
    'Custom sort options configuration is invalid.';
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

  const defaultCustomSort = {
    label: 'Date ascending',
    value: 'date ascending',
    criterion: {
      by: 'date',
      order: 'ascending',
    },
  };

  const customSortOptions = [
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

  const customSortOptionsValues = [...customSortOptions].map(
    (option) => option.value
  );
  interface SortOptions {
    useCase: string;
  }

  interface SortActionsOptions {
    withCustomSortOptions?: boolean;
    withInvalidCustomSortOptions?: boolean;
  }

  function visitSort(
    options: Partial<SortOptions>,
    actionsOptions: Partial<SortActionsOptions> = {},
    waitForSearch = true
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
        it('should display sort options correctly and allow selection of options', () => {
          visitSort({useCase: param.useCase});

          Expect.displaySortDropdown(true);
          Expect.labelContains('Sort by');

          Actions.openDropdown();

          Expect.sortOptionsEqual(sortOptions);
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

      describe('when passing custom options as slots to the component', () => {
        it('should display the custom options properly', () => {
          visitSort({useCase: param.useCase}, {withCustomSortOptions: true});

          Expect.sortCriteriaInInitialSearchRequest(
            defaultCustomSort.value,
            param.useCase
          );
          Expect.displaySortDropdown(true);
          Expect.labelContains('Sort by');

          Actions.openDropdown();

          Expect.sortOptionsEqual(customSortOptions);
        });

        customSortOptionsValues.forEach((value) => {
          describe('when selecting a custom option', () => {
            it(`should update the shown selected option to ${value}`, () => {
              visitSort(
                {useCase: param.useCase},
                {withCustomSortOptions: true}
              );
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
          it('should display an error message instead of the quanticSort component', () => {
            visitSort(
              {useCase: param.useCase},
              {withInvalidCustomSortOptions: true}
            );

            Expect.displayComponentError(true);
            Expect.displayComponentErrorMessage(invalidSortConfigurationError);
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
