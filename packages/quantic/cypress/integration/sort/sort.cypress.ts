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

  const sortOptions = ['relevancy', 'date descending', 'date ascending'];
  const sortOptionLabels = ['Relevancy', 'Newest', 'Oldest'];

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
      Expect.displayLocalizedLabel('Sort by');

      Actions.openDropdown();

      Expect.containsOptions(sortOptions);
      Expect.displayLocalizedOptionLabels(sortOptions, sortOptionLabels);
      Expect.selectedOption(sortOptions[0], true);
    });
  });

  describe('when selecting a sort option', () => {
    sortOptions.slice(1).forEach((option) => {
      it(`should update the shown selected option to ${option}`, () => {
        visitSort();
        Actions.selectOption(option);

        Expect.selectedOption(option, true);
      });

      it(`should execute a query with the ${option} sort order on selection`, () => {
        visitSort();
        Actions.selectOption(option);

        SearchExpectations.sortedBy(option);
      });

      it(`should log ${option} analytics on selection`, () => {
        visitSort();
        Actions.selectOption(option);

        Expect.logSortResults(option);
      });
    });
  });

  describe('when loading sort selection from URL', () => {
    it('should sort by date descending', () => {
      loadFromUrlHash('sortCriteria=date%20descending');

      const option = sortOptions[1];

      SearchExpectations.sortedBy(option);

      Actions.openDropdown();

      Expect.displaySortDropdown(true);
      Expect.selectedOption(option, true);
    });

    it('should sort by date ascending', () => {
      loadFromUrlHash('sortCriteria=date%20ascending');

      const option = sortOptions[2];

      SearchExpectations.sortedBy(option);

      Actions.openDropdown();

      Expect.displaySortDropdown(true);
      Expect.selectedOption(option, true);
    });
  });
});
