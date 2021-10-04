import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {PagerExpectations as Expect} from './pager-expectations';
import {PagerActions as Actions} from './pager-actions';

interface PagerOptions {
  numberOfPages: number;
}

describe('quantic-pager', () => {
  const pageUrl = 's/quantic-pager';

  function visitPager(options: Partial<PagerOptions>, waitForSearch = true) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
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

  describe('with default options', () => {
    it('should render properly', () => {
      visitPager({
        numberOfPages: 5,
      });

      Expect.displayPrevious(true);
      Expect.previousEnabled(false);
      Expect.displayNext(true);
      Expect.nextEnabled(true);
      Expect.numberOfPages(5);
      Expect.selectedPageContains(1);

      Actions.clickNext();
      Expect.logNextPage();
      Expect.selectedPageContains(2);

      Actions.clickPrevious();
      Expect.logPreviousPage();
      Expect.selectedPageContains(1);

      Actions.selectPage(3);
      Expect.logPageNumber(3);
      Expect.selectedPageContains(3);

      // Scenario 5
      // Perform a new search query. Pager should return to page 1
      // TODO: See if we can trigger a new search directly from headless.
    });
  });

  describe('with custom number of pages', () => {
    it('should render properly', () => {
      visitPager({
        numberOfPages: 10,
      });

      Expect.numberOfPages(10);
    });
  });

  describe('when loading options from URL', () => {
    it('should load the options', () => {
      loadFromUrlHash(
        {
          numberOfPages: 5,
        },
        'firstResult=30'
      );

      Expect.selectedPageContains(4);
    });
  });

  describe('with invalid number of pages', () => {
    it('should not load the component', () => {
      visitPager(
        {
          numberOfPages: -1,
        },
        false
      );

      // Validate that:
      // Scenario 7
      // - does not load the component
      // - report the error in browser console

      Expect.displayPrevious(false);
      Expect.displayNext(false);
      Expect.numberOfPages(0);
    });
  });
});
