import {TestFixture, generateComponentHTML} from '../fixtures/test-fixture';
import {addSearchBox} from '../fixtures/test-fixture-search-box';
import {generateAliasForSearchBox} from './search-box-selectors';

describe('No Results Test Suites', () => {
  const tag = 'atomic-no-results-v1';
  const wait = 1000;
  let env: TestFixture;

  beforeEach(() => {
    env = new TestFixture()
      .with(addSearchBox())
      .withElement(generateComponentHTML(tag));
  });

  it('should not be visible when there are results', () => {
    env.init();
    cy.get(tag).should('not.be.visible');
  });

  it('should be visible when there are no results', () => {
    env.withHash('q=gahaiusdhgaiuewjfsf').init();
    cy.get(tag).should('be.visible');
  });

  it('text content should match when there are no results', () => {
    env.withHash('q=dsmndkndjnj').init();
    cy.get(tag)
      .shadow()
      .find('div div[part="no-results"] .quotations')
      .should('contain.text', 'dsmndkndjnj');
  });

  it('cancel button should not be visible when there is no history', () => {
    env.withHash('q=gahaiusdhgaiuewjfsf').init();
    cy.get(tag).shadow().get('button').should('not.exist');
  });

  function submitNoResultsSearch() {
    generateAliasForSearchBox();
    cy.get('@searchBoxFirstDiv')
      .find('.search-input')
      .type('asiufasfgasiufhsaiufgsa');
    cy.get('@searchBoxFirstDiv').find('.submit-button').click();
    cy.wait(wait);
  }

  it('cancel button should be visible when there is history', () => {
    env.init();
    submitNoResultsSearch();
    cy.get(tag).shadow().find('button').should('be.visible');
  });

  it('clicking on cancel should go back in history and hide the atomic-no-results component', () => {
    env.init();
    submitNoResultsSearch();
    cy.get(tag).shadow().find('button').click();
    cy.wait(wait);
    cy.get(tag).should('not.be.visible');
  });
});
