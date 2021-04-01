import {setupPage} from '../utils/setupComponent';

describe('Query Summary Test Suites', () => {
  const tag = 'atomic-query-summary';
  const component = (attributes = '') => `<${tag} ${attributes}></${tag}>`;

  function contentShouldMatch(content: RegExp | string) {
    cy.get(tag).shadow().find('div[part="container"]').contains(content);
  }

  function setupQuerySummary(urlHash = '') {
    setupPage({html: component(), urlHash});
  }

  it('should be visible', () => {
    setupPage({html: component()});
    cy.get(tag).should('be.visible');
  });

  describe('should match text content', () => {
    it('with a query yielding multiple results', () => {
      setupQuerySummary('q=test');
      contentShouldMatch(/^Results 1-10 of [\d,]+ for test in [\d.]+ seconds$/);
    });

    it('with a query yielding a single result', () => {
      setupQuerySummary(
        "q=Alice's%20Adventures%20in%20Wonderland%20by%20Lewis%20Carroll.pdf"
      );
      contentShouldMatch(
        /^Result 1 of [\d,]+ for Alice's Adventures in Wonderland by Lewis Carroll\.pdf in [\d.]+ seconds$/
      );
    });

    it('with a query yielding no results', () => {
      setupQuerySummary('q=gahaiusdhgaiuewjfsf');
      contentShouldMatch(/^No results for gahaiusdhgaiuewjfsf$/);
    });

    it('with no query yielding no results', () => {
      setupQuerySummary('cq=asihfdasifha');
      contentShouldMatch(/^No results$/);
    });

    it('with a query containing an XSS injection', () => {
      setupQuerySummary('q=<script>alert("hello");</script>');
      contentShouldMatch('No results for <script>alert("hello");</script>');
    });
  });

  it('when "enableDuration" is false, should show duration', () => {
    setupQuerySummary('q=test');
    contentShouldMatch(/Results 1-10 of [\d,]+ for test$/);
  });
});
