import {injectComponent, setUpPage} from '../utils/setupComponent';

describe('Query Summary Test Suites', () => {
  const tag = 'atomic-query-summary';
  const searchBox = '<atomic-search-box></atomic-search-box>';
  const component = (attributes = '') => `<${tag} ${attributes}></${tag}>`;
  const wait = 1000;

  function contentShouldMatch(content: RegExp | string) {
    cy.get(tag).shadow().find('div[part="container"]').contains(content);
  }

  it('should be visible', () => {
    setUpPage(component());
    cy.get(tag).should('be.visible');
  });

  describe('should match text content', () => {
    it('with a query yielding multiple results', () => {
      cy.visit('http://localhost:3333/pages/test.html#q=test');
      injectComponent(component() + searchBox);
      cy.wait(wait);
      contentShouldMatch(/^Results 1-10 of [\d,]+ for test in [\d.]+ seconds$/);
    });

    it('with a query yielding a single result', () => {
      cy.visit(
        "http://localhost:3333/pages/test.html#q=Alice's%20Adventures%20in%20Wonderland%20by%20Lewis%20Carroll.pdf"
      );
      injectComponent(component() + searchBox);
      cy.wait(wait);
      contentShouldMatch(
        /^Result 1 of [\d,]+ for Alice's Adventures in Wonderland by Lewis Carroll\.pdf in [\d.]+ seconds$/
      );
    });

    it('with a query yielding no results', () => {
      cy.visit('http://localhost:3333/pages/test.html#q=gahaiusdhgaiuewjfsf');
      injectComponent(component() + searchBox);
      cy.wait(wait);
      contentShouldMatch(/^No results for gahaiusdhgaiuewjfsf$/);
    });

    it('with no query yielding no results', () => {
      cy.visit('http://localhost:3333/pages/test.html#numberOfResults=0');
      injectComponent(component());
      cy.wait(wait);
      contentShouldMatch(/^No results$/);
    });

    it('with a query containing an XSS injection', () => {
      cy.visit(
        'http://localhost:3333/pages/test.html#q=<script>alert("hello");</script>'
      );
      injectComponent(component() + searchBox);
      cy.wait(wait);
      contentShouldMatch('No results for <script>alert("hello");</script>');
    });
  });

  it('when "enableDuration" is false, should not show duration', () => {
    cy.visit('http://localhost:3333/pages/test.html#q=test');
    injectComponent(component('enable-duration="false"') + searchBox);
    cy.wait(wait);
    contentShouldMatch(/Results 1-10 of [\d,]+ for test$/);
  });
});
