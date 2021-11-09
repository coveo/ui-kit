import {
  selectors as search,
  searchFor,
  selectResultPage,
  setupAliases,
  sortByDateDescending,
  selectRegularFacetValue,
} from '../page-objects/example-search';
import {InterceptAliases} from '../page-objects/search';

describe('example-search', () => {
  const pageUrl = 's/full-search-example';

  beforeEach(() => {
    cy.visit(pageUrl)
      .then(setupAliases)
      .wait(InterceptAliases.Search, {timeout: 30000});
  });

  it('should load results automatically', () => {
    cy.get(search.searchbox)
      .should('exist')
      .get(search.summary)
      .should('exist')
      .get(search.result)
      .should('have.length.greaterThan', 1)
      .get(search.pager)
      .should('exist');
  });

  describe('when selecting a facet value', () => {
    it('should trigger query when selecting a facet value', () => {
      cy.visit(pageUrl)
        .then(setupAliases)
        .wait(InterceptAliases.Search)
        .then((interception) => {
          const firstFacetValue = interception.response?.body.facets.find(
            (f) => f.field === 'objecttype'
          ).values[0].value;

          selectRegularFacetValue(firstFacetValue).wait(
            InterceptAliases.Search
          );
        });
    });
  });

  describe('when typing a search query', () => {
    it('should trigger query when typing in searchbox', () => {
      searchFor('test')
        .wait(InterceptAliases.Search)
        .then((interception) =>
          assert.equal(interception.request.body.q, 'test')
        )
        .get(search.summary)
        .contains('test');
    });
  });

  describe('when changing the sorting', () => {
    it('should trigger query when changing the sorting', () => {
      cy.then(sortByDateDescending)
        .wait(InterceptAliases.Search)
        .then((interception) =>
          assert.equal(
            interception.request.body.sortCriteria,
            'date descending'
          )
        );
    });
  });

  describe('when changing result page', () => {
    it('should request new result page when clicking a specific page in the pager', () => {
      cy.get(search.summary)
        .should('contain.text', 'Results 1-10')
        .then(() => selectResultPage(2))
        .wait(InterceptAliases.Search)
        .then((interception) =>
          assert.equal(interception.request.body.firstResult, 10)
        )
        .get(search.summary)
        .should('contain.text', 'Results 11-20');
    });
  });
});
