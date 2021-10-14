import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {SortExpectations as Expect} from './sort-expectations';
import {SortActions as Actions} from './sort-actions';
import {SearchExpectations} from '../search-expectations';

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

  function visitSort(waitForSearch = true) {
    interceptSearch();
    cy.visit(sortUrl);
    configure();
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();
    cy.visit(`${sortUrl}#${urlHash}`);
    configure();
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(sortUrl);
    configure();
  }

  it('should not render before results have returned', () => {
    setupWithPauseBeforeSearch();

    Expect.displaySortDropdown(false);
  });

  describe('when loading default sort', () => {
    it('should work as expected', () => {
      visitSort();

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
          visitSort();
          Actions.selectOption(option);

          Expect.selectedOption(option);
          SearchExpectations.sortedBy(option);
          Expect.logSortResults(option);
        });
      });
  });

  describe('when loading sort selection from URL', () => {
    sortOptions
      .filter((option) => option.value !== defaultOptionValue)
      .forEach((option) => {
        it(`should sort by ${option.value}`, () => {
          loadFromUrlHash(`sortCriteria=${encodeURI(option.value)}`);

          SearchExpectations.sortedBy(option.value);

          Actions.openDropdown();

          Expect.displaySortDropdown(true);
          Expect.selectedOption(option.value);
        });
      });
  });
});
