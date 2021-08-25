import {
  searchFor,
  selectResultPage,
  setupAliases,
  sortByDateDescending,
} from '../page-objects/example-search';

describe('example-search', () => {
  const exampleSearchUrl = 'http://localhost:3334/preview/c/exampleSearch';

  beforeEach(() => {
    cy.visit(exampleSearchUrl).then(setupAliases).wait('@search');
  });

  it('should load results automatically', () => {
    cy.get('@searchbox')
      .should('exist')
      .get('@summary')
      .should('exist')
      .get('@result')
      .should('have.length.greaterThan', 1)
      .get('@pager')
      .should('exist');
  });

  describe('when clicking a facet', () => {
    it('should trigger query when clicking a facet', () => {
      cy.get('@facet-type-item-checkbox').lwcDevCheck().wait('@search');
    });
  });

  describe('when typing a search query', () => {
    it('should trigger query when typing in searchbox', () => {
      cy.then(() => searchFor('test'))
        .wait('@search')
        .then((interception) =>
          assert.equal(interception.request.body.q, 'test')
        )
        .get('@summary')
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
      cy.get('@summary')
        .should('contain.text', 'Results 1-10')
        .then(() => selectResultPage(2))
        .wait('@search')
        .then((interception) =>
          assert.equal(interception.request.body.firstResult, 10)
        )
        .get('@summary')
        .should('contain.text', 'Results 11-20');
    });
  });
});
