import {
  searchFor,
  selectResultPage,
  setupAliases,
  sortByDateDescending,
} from '../page-objects/full-search';

describe('example-search', () => {
  it('should load results automatically', () => {
    cy.visit('c/exampleSearch')
      .then(setupAliases)
      .wait('@search')
      .get('@searchbox')
      .should('exist')
      .get('@summary')
      .should('exist')
      .get('@result')
      .should('exist')
      .get('@pager')
      .should('exist');
  });

  it('should trigger query when clicking a facet', () => {
    cy.visit('c/exampleSearch')
      .then(setupAliases)
      .wait('@search')
      .get('@facet-type-item-checkbox')
      .check()
      .wait('@search');
  });

  it('should show more facet values when clicking the more link', () => {
    cy.visit('c/exampleSearch')
      .then(setupAliases)
      .wait('@search')
      .get('@facet-type-values')
      .then((values) => {
        cy.get('@facet-type-more')
          .click()
          .wait('@search')
          .then((interception) => {
            assert.isAtLeast(
              interception.request.body.facets[0].numberOfValues,
              values.length + 1
            );
          });
      });
  });

  it('should trigger query when typing in searchbox', () => {
    cy.visit('c/exampleSearch')
      .then(setupAliases)
      .wait('@search')
      .then(() => searchFor('test'))
      .wait('@search')
      .then((interception) => {
        assert.equal(interception.request.body.q, 'test');
      })
      .get('@summary')
      .contains('test');
  });

  it('should trigger query when changing the sorting', () => {
    cy.visit('c/exampleSearch')
      .then(setupAliases)
      .wait('@search')
      .then(sortByDateDescending)
      .wait('@search')
      .then((interception) => {
        assert.equal(interception.request.body.sortCriteria, 'date descending');
      });
  });

  it('should request new result page when clicking a specific page in the pager', () => {
    cy.visit('c/exampleSearch')
      .then(setupAliases)
      .wait('@search')
      .get('@summary')
      .should('contain.text', 'Results 1 - 10')
      .then(() => selectResultPage(2))
      .wait('@search')
      .then((interception) => {
        assert.equal(interception.request.body.firstResult, 10);
      })
      .get('@summary')
      .should('contain.text', 'Results 11 - 20');
  });
});
