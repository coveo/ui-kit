import 'cypress-web-vitals';

describe('headless ssr example', () => {
  const numResults = 10;
  const numResultsMsg = `Hydrated engine with ${numResults} results`;
  const msgSelector = '#hydrated-msg';
  const timestampSelector = '#timestamp';
  it('renders page in SSR as expected', () => {
    cy.intercept('/', (req) => {
      req.continue((resp) => {
        const dom = new DOMParser().parseFromString(resp.body, 'text/html');
        expect(dom.querySelector(msgSelector)?.textContent).to.equal(
          numResultsMsg
        );
        expect(dom.querySelectorAll('li').length).to.equal(numResults);
      });
    });
    cy.visit('/');
  });

  it('renders page in CSR as expected', () => {
    cy.visit('/');
    cy.get(msgSelector).should('have.text', numResultsMsg);
    cy.get('li').should('have.length', numResults);
  });

  it('renders result list in SSR and then in CSR', () => {
    const interceptAlias = 'searchResults';
    cy.intercept('/').as(interceptAlias);

    cy.visit('/');
    cy.wait(`@${interceptAlias}`).then((intercept) => {
      const dom = new DOMParser().parseFromString(
        intercept.response?.body,
        'text/html'
      );
      const ssrTimestamp = Date.parse(
        dom.querySelector(timestampSelector)!.innerHTML
      );
      expect(ssrTimestamp).to.not.be.undefined;
      cy.get(timestampSelector).should((timeStampElement) => {
        const csrTimestamp = Date.parse(timeStampElement.text());
        expect(csrTimestamp).to.be.greaterThan(ssrTimestamp);
      });
    });
  });

  it('should pass the web-vitals audits', () => {
    // TODO: Add input based vitals after interactive elements are added to test page (e.g. search box)
    // Note: Thresholds might need to be adjusted as the page tested changes (e.g. more components are added etc)
    const VITALS_THRESHOLD = {
      thresholds: {fcp: 100, lcp: 100, cls: 0, ttfb: 20},
    };
    cy.visit('/');
    cy.vitals(VITALS_THRESHOLD);
  });
});
