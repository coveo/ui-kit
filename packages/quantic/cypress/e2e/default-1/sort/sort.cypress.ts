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
          .forEach((option) => {
            it(`should update the shown selected option to ${option}`, () => {
              visitSort({useCase: param.useCase});
              Actions.selectOption(option);

              Expect.selectedOption(option);
              Expect.sendNewSearchRequest(
                'resultsSort',
                param.useCase,
                (body) => {
                  expect(body.sortCriteria).to.equal(option);
                }
              );
              Expect.logSortResults(option);
            });
          });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading sort selection from URL', () => {
          sortOptions
            .filter((option) => option.value !== defaultOptionValue)
            .forEach((option) => {
              it(`should sort by ${option.value}`, () => {
                loadFromUrlHash(`sortCriteria=${encodeURI(option.value)}`);

                Expect.sendNewSearchRequest(
                  'interfaceLoad',
                  param.useCase,
                  (body) => {
                    expect(body.sortCriteria).to.equal(option.value);
                  }
                );
                Actions.openDropdown();

                Expect.displaySortDropdown(true);
                Expect.selectedOption(option.value);
              });
            });
        });
      }
    });
  });
});
