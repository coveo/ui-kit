import {injectComponent, setUpPage} from '../utils/setupComponent';
import {generateAliasForSearchBox} from './search-box-selectors';

describe('No Results Test Suites', () => {
  const tag = 'atomic-no-results';
  const component = (attributes = '') => `<${tag} ${attributes}></${tag}>`;
  const searchBox = '<atomic-search-box></atomic-search-box>';
  const wait = 1000;

  it('should not be visible when there are results', () => {
    setUpPage(component());
    cy.get('atomic-no-results').should('not.be.visible');
  });

  it('should be visible when there are no results', () => {
    cy.visit('http://localhost:3333/pages/test.html#q=gahaiusdhgaiuewjfsf');
    injectComponent(component());
    cy.wait(wait);
    cy.get('atomic-no-results').should('be.visible');
  });

  it('cancel button should not be visible when there is no history', () => {
    cy.visit('http://localhost:3333/pages/test.html#q=gahaiusdhgaiuewjfsf');
    injectComponent(component());
    cy.wait(wait);
    cy.get('atomic-no-results').shadow().get('button').should('not.exist');
  });

  it('cancel button should be visible when there is history', () => {
    setUpPage(component() + searchBox);
    generateAliasForSearchBox();
    cy.get('@searchBoxFirstDiv').find('.input').type('asiufasfgasiufhsaiufgsa');
    cy.get('@searchBoxFirstDiv').find('.submit-button').click();
    cy.wait(wait);
    cy.get('atomic-no-results').shadow().find('button').should('be.visible');
  });

  // describe('should match text content', () => {
  //   it('with a query yielding multiple results', () => {
  //     cy.visit('http://localhost:3333/pages/test.html#q=test');
  //     injectComponent(component());
  //     cy.wait(wait);
  //     contentShouldMatch(/^Results 1-10 of [\d,]+ for test in [\d.]+ seconds$/);
  //   });

  //   it('with a query yielding a single result', () => {
  //     cy.visit(
  //       "http://localhost:3333/pages/test.html#q=Alice's%20Adventures%20in%20Wonderland%20by%20Lewis%20Carroll.pdf"
  //     );
  //     injectComponent(component());
  //     cy.wait(wait);
  //     contentShouldMatch(
  //       /^Result 1 of [\d,]+ for Alice's Adventures in Wonderland by Lewis Carroll\.pdf in [\d.]+ seconds$/
  //     );
  //   });

  //   it('with a query yielding no results', () => {
  //     cy.visit('http://localhost:3333/pages/test.html#q=gahaiusdhgaiuewjfsf');
  //     injectComponent(component());
  //     cy.wait(wait);
  //     contentShouldMatch(/^No results for gahaiusdhgaiuewjfsf$/);
  //   });

  //   it('with no query yielding no results', () => {
  //     cy.visit('http://localhost:3333/pages/test.html#cq=asihfdasifha');
  //     injectComponent(component());
  //     cy.wait(wait);
  //     contentShouldMatch(/^No results$/);
  //   });

  //   it('with a query containing an XSS injection', () => {
  //     cy.visit(
  //       'http://localhost:3333/pages/test.html#q=<script>alert("hello");</script>'
  //     );
  //     injectComponent(component());
  //     cy.wait(wait);
  //     contentShouldMatch('No results for <script>alert("hello");</script>');
  //   });
  // });

  // it('when "enableDuration" is false, should show duration', () => {
  //   cy.visit('http://localhost:3333/pages/test.html#q=test');
  //   injectComponent(component('enable-duration="false"'));
  //   cy.wait(wait);
  //   contentShouldMatch(/Results 1-10 of [\d,]+ for test$/);
  // });
});
