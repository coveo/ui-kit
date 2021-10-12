import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {PagerExpectations as Expect} from './pager-expectations';
import {PagerActions as Actions} from './pager-actions';
import {stubConsoleError} from '../console-selectors';

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

  function performSearchQuery() {
    cy.get('.configurator__perform-search').click();
    cy.wait(InterceptAliases.Search);
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure({
      numberOfPages: 5,
    });
  }

  describe('with default options', () => {
    it('should not render before results have returned', () => {
      setupWithPauseBeforeSearch();

      Expect.displayPrevious(false);
      Expect.displayNext(false);
      Expect.numberOfPages(0);
    });

    it('should work as expected', () => {
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

      performSearchQuery();
      Expect.selectedPageContains(1);
    });
  });

  describe('with custom number of pages', () => {
    it('should display the right number of pages', () => {
      visitPager({
        numberOfPages: 10,
      });

      Expect.numberOfPages(10);
    });
  });

  describe('when loading options from URL', () => {
    it('should select the right page', () => {
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
      interceptSearch();
      cy.visit(pageUrl, {
        onBeforeLoad(win) {
          stubConsoleError(win);
        },
      });
      configure({
        numberOfPages: -1,
      });

      Expect.displayPrevious(false);
      Expect.displayNext(false);
      Expect.numberOfPages(0);
      Expect.console.error(true);
    });
  });
});
