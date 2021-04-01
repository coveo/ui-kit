import {setupPage} from '../utils/setupComponent';
import {generateAliasForSearchBox} from './search-box-selectors';

describe('No Results Test Suites', () => {
  const tag = 'atomic-no-results';
  const component = (attributes = '') => `<${tag} ${attributes}></${tag}>`;
  const searchBox = '<atomic-search-box></atomic-search-box>';

  it('should not be visible when there are results', () => {
    setupPage({html: component()});
    cy.get('atomic-no-results').should('not.be.visible');
  });

  it('should be visible when there are no results', () => {
    setupPage({html: component(), urlHash: 'q=gahaiusdhgaiuewjfsf'});
    cy.get('atomic-no-results').should('be.visible');
  });

  it('cancel button should not be visible when there is no history', () => {
    setupPage({html: component(), urlHash: 'q=gahaiusdhgaiuewjfsf'});
    cy.get('atomic-no-results').shadow().get('button').should('not.exist');
  });

  function submitNoResultsSearch() {
    setupPage({html: component() + searchBox});
    generateAliasForSearchBox();
    cy.get('@searchBoxFirstDiv')
      .find('.search-input')
      .type('asiufasfgasiufhsaiufgsa');
    cy.get('@searchBoxFirstDiv').find('.submit-button').click();
  }

  it('cancel button should be visible when there is history', () => {
    submitNoResultsSearch();
    cy.get('atomic-no-results').shadow().find('button').should('be.visible');
  });

  it('clicking on cancel should go back in history and hide the atomic-no-results component', () => {
    submitNoResultsSearch();
    cy.get('atomic-no-results').shadow().find('button').click();
    cy.get('atomic-no-results').should('not.be.visible');
  });
});
