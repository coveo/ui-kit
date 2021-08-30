import {
  selectors as search,
  searchFor,
  selectResultPage,
  setupAliases,
  sortByDateDescending,
  selectRegularFacetValue,
} from '../page-objects/example-search';

describe('example-search', () => {
  const pageUrl = `${Cypress.env('examplesUrl')}/s/full-search-example`;

  before(() => {
    cy.stub(navigator, 'sendBeacon');
  });

  beforeEach(() => {
    cy.visit(pageUrl).then(setupAliases).wait('@search');
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
        .wait('@search')
        .then((interception) => {
          const firstFacetValue = interception.response?.body.facets.find(
            (f) => f.field === 'objecttype'
          ).values[0].value;

          selectRegularFacetValue(firstFacetValue).wait('@search');
        });
    });
  });

  describe('when typing a search query', () => {
    it('should trigger query when typing in searchbox', () => {
      searchFor('test')
        .wait('@search')
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
        .wait('@search')
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
        .wait('@search')
        .then((interception) =>
          assert.equal(interception.request.body.firstResult, 10)
        )
        .get(search.summary)
        .should('contain.text', 'Results 11-20');
    });
  });
});
