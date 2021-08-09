import {
  buildTestUrl,
  injectComponent,
  setUpPage,
} from '../utils/setupComponent';
import {generateAliasForSearchBox} from './search-box-selectors';

describe('No Results Test Suites', () => {
  const tag = 'atomic-no-results-v1';
  const component = (attributes = '') => `<${tag} ${attributes}></${tag}>`;
  const searchBox = '<atomic-search-box></atomic-search-box>';
  const wait = 1000;

  it('should not be visible when there are results', () => {
    setUpPage(component());
    cy.get(tag).should('not.be.visible');
  });

  it('should be visible when there are no results', () => {
    cy.visit(buildTestUrl('q=gahaiusdhgaiuewjfsf'));
    injectComponent(component() + searchBox);
    cy.wait(wait);
    cy.get(tag).should('be.visible');
  });

  it('text content should match when there are no results', () => {
    cy.visit(buildTestUrl('q=dsmndkndjnj'));
    injectComponent(component() + searchBox);
    cy.wait(wait);
    cy.get(tag)
      .shadow()
      .find('div div[part="no-results"] .quotations')
      .should('contain.text', 'dsmndkndjnj');
  });

  it('cancel button should not be visible when there is no history', () => {
    cy.visit(buildTestUrl('q=gahaiusdhgaiuewjfsf'));
    injectComponent(component());
    cy.wait(wait);
    cy.get(tag).shadow().get('button').should('not.exist');
  });

  function submitNoResultsSearch() {
    setUpPage(component() + searchBox);
    generateAliasForSearchBox();
    cy.get('@searchBoxFirstDiv')
      .find('.search-input')
      .type('asiufasfgasiufhsaiufgsa');
    cy.get('@searchBoxFirstDiv').find('.submit-button').click();
    cy.wait(wait);
  }

  it('cancel button should be visible when there is history', () => {
    submitNoResultsSearch();
    cy.get(tag).shadow().find('button').should('be.visible');
  });

  it('clicking on cancel should go back in history and hide the atomic-no-results component', () => {
    submitNoResultsSearch();
    cy.get(tag).shadow().find('button').click();
    cy.wait(wait);
    cy.get(tag).should('not.be.visible');
  });
});
