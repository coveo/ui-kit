import 'cypress-web-vitals';
import {ConsoleAliases, spyOnConsole, waitForHydration} from './ssr-e2e-utils';

const getResultTitles = () =>
  (
    cy.get('.result-list li').invoke('map', function (this: HTMLElement) {
      return this.innerText;
    }) as Cypress.Chainable<JQuery<string>>
  ).invoke('toArray');

describe('headless ssr example', () => {
  const route = '/generic';
  const numResults = 10;
  const numResultsMsg = `Rendered page with ${numResults} results`;
  const msgSelector = '#hydrated-msg';
  const timestampSelector = '#timestamp';
  it('renders page in SSR as expected', () => {
    cy.intercept(route, (req) => {
      req.continue((resp) => {
        const dom = new DOMParser().parseFromString(resp.body, 'text/html');
        expect(dom.querySelector(msgSelector)?.textContent).to.equal(
          numResultsMsg
        );
        expect(dom.querySelectorAll('.result-list li').length).to.equal(
          numResults
        );
      });
    });
    cy.visit(route);
  });

  it('renders page in CSR as expected', () => {
    cy.visit(route);
    cy.get(msgSelector).should('have.text', numResultsMsg);
    cy.get('.result-list li').should('have.length', numResults);
  });

  it('renders result list in SSR and then in CSR', () => {
    const interceptAlias = 'searchResults';
    cy.intercept(route).as(interceptAlias);

    cy.visit(route);
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
    // Note: Thresholds might need to be adjusted as the page tested changes (e.g. more components are added etc)
    const VITALS_THRESHOLD: Cypress.ReportWebVitalsConfig = {
      thresholds: {
        fcp: 200,
        lcp: 200,
        cls: 0,
        ttfb: 40,
        fid: 200, // TODO: Make sure that the time for re-rendering after the interactions below is properly counted.
        inp: 200,
      },
    };
    cy.startVitalsCapture({url: route});
    getResultTitles()
      .should('have.length.greaterThan', 0)
      .as('initial-results');
    waitForHydration();
    cy.get('.search-box input').focus().type('abc{enter}');
    cy.get<string>('@initial-results').then((initialResults) =>
      getResultTitles().should('not.deep.equal', initialResults)
    );
    cy.reportVitals(VITALS_THRESHOLD);
  });

  describe('after hydration', () => {
    beforeEach(() => {
      spyOnConsole();
      cy.visit(route);
      waitForHydration();
    });

    it('should not log any error nor warning', () => {
      cy.wait(1000);
      cy.get(ConsoleAliases.error).should('not.be.called');
      cy.get(ConsoleAliases.warn).should('not.be.called');
    });

    it('after submitting a query, should change search results', () => {
      getResultTitles()
        .should('have.length.greaterThan', 0)
        .as('initial-results');
      cy.get('.search-box input').focus().type('abc{enter}');
      cy.get<string>('@initial-results').then((initialResults) => {
        getResultTitles()
          .should('not.deep.equal', initialResults)
          .and('have.length', 10);
      });
    });
  });
});
