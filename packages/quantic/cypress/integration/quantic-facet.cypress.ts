import {configure} from '../page-objects/configurator';
import {selectors as facet} from '../page-objects/example-quantic-facet';

describe('quantic-facet', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('examplesUrl')}/s/quantic-facet`);
  });

  it('should display the right label and content', () => {
    cy.then(() => configure({field: 'language', label: 'Language'}))
      .get(facet.title)
      .should('contain', 'Language')
      .get(facet.value)
      .should('contain', 'English');
  });

  it('should display more values when clicking more button and reset when clicking less button', () => {
    cy.then(() => configure({}))
      .get(facet.value)
      .should('have.length', 8)
      .get(facet.more)
      .click()
      .get(facet.value)
      .should('have.length.greaterThan', 8)
      .get(facet.more)
      .should('exist')
      .get(facet.less)
      .click()
      .get(facet.value)
      .should('have.length', 8)
      .get(facet.less)
      .should('not.exist');
  });
});
