import {
  InterceptAliases,
  interceptSearch,
} from '../../../../page-objects/search';
import {useCaseEnum} from '../../../../page-objects/use-case';
import {SearchActions as Actions} from '../actions';
import {SearchExpectations as Expect} from '../expectations';

describe('example search page', () => {
  const pageUrl = 's/full-search-example';

  function visitSearchPage(waitForFirstSearch = true) {
    interceptSearch();
    cy.visit(pageUrl);
    if (waitForFirstSearch) {
      Expect.sendNewSearchRequest('interfaceLoad');
    }
  }

  describe('when loading the search page', () => {
    it('should load results automatically', () => {
      visitSearchPage();

      Expect.displaySearchbox(true);
      Expect.displayFacets(true);
      Expect.displaySort(true);
      Expect.displaySummary(true);
      Expect.displayPager(true);
      Expect.displayResults();
    });
  });

  describe('when typing a search query', () => {
    it('should trigger query when typing in searchbox', () => {
      visitSearchPage();

      const exampleQuery = 'Hello world!';
      Actions.typeInSearchbox(exampleQuery);
      Actions.submitQuery();
      Expect.sendNewSearchRequest(
        'searchboxSubmit',
        useCaseEnum.search,
        (body) => {
          expect(body).to.have.property('q', exampleQuery);
        }
      );
      Expect.summaryContainsText(exampleQuery);
    });
  });

  describe('when selecting a facet value', () => {
    it('should trigger query when selecting a facet value', () => {
      visitSearchPage(false);

      cy.wait(InterceptAliases.Search).then((interception) => {
        const firstFacetValue = interception.response?.body.facets.find(
          (f: {field: string}) => f.field === 'objecttype'
        ).values[0].value;
        Actions.selectFacetValue(firstFacetValue);
      });

      Expect.sendNewSearchRequest('facetSelect');
    });
  });

  describe('when changing result page', () => {
    it('should request new result page when clicking a specific page in the pager', () => {
      visitSearchPage();
      Expect.summaryContainsText('Results 1-10');

      Actions.selectPagerButton(2);

      Expect.sendNewSearchRequest('pagerNumber', useCaseEnum.search, (body) => {
        expect(body).to.have.property('firstResult', 10);
      });
      Expect.summaryContainsText('Results 11-20');
    });
  });

  describe('when changing the sorting', () => {
    it('should trigger query when changing the sorting', () => {
      const expectedSortValue = 'date descending';
      visitSearchPage();

      Actions.openSortDropdown();
      Actions.selectSortOption(expectedSortValue);

      Expect.sendNewSearchRequest('resultsSort', useCaseEnum.search, (body) => {
        expect(body).to.have.property('sortCriteria', expectedSortValue);
      });
    });
  });

  describe('when narrowing the screen', () => {
    it('should hide the sort and facet components and display the refine toggle component', () => {
      visitSearchPage();

      Expect.displayFacets(true);
      Expect.displaySort(true);
      Expect.displayRefineToggle(false);

      cy.viewport(1000, 900);

      Expect.displayFacets(false);
      Expect.displaySort(false);
      Expect.displayRefineToggle(true);
    });
  });
});
