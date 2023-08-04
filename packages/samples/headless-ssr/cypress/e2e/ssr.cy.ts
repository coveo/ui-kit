import 'cypress-web-vitals';

describe('headless ssr smoke tests', () => {
  const numResults = 10;
  const numResultsMsg = `Hydrated engine with ${numResults} results`;
  const msgSelector = '#hydrated-msg';
  it('renders page in SSR as expected', () => {
    cy.intercept('/', (req) => {
      req.continue((resp) => {
        const dom = new DOMParser().parseFromString(resp.body, 'text/html');
        expect(dom.body).to.contain(numResultsMsg);
        expect(dom.querySelectorAll('li').length).to.equal(numResults);
      });
    });
    cy.visit('/');
  });

  it('renders page in CSR as expected', () => {
    cy.visit('/');
    cy.get(msgSelector).should('contain.text', numResultsMsg);
    cy.get('li').should('have.length', numResults);
  });

  it('should pass the web-vitals audits', () => {
    //
    const VITALS_THRESHOLD = {thresholds: {fcp: 30, lcp: 30, cls: 0, ttfb: 10}};
    cy.vitals(VITALS_THRESHOLD);
  });
});
