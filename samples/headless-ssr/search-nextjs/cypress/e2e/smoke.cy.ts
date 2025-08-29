import 'cypress-web-vitals';
import {
  ConsoleAliases,
  getResultTitles,
  numResults,
  spyOnConsole,
  waitForHydration,
} from './utils';

const numResultsMsg = `Rendered page with ${numResults} results`;
const msgSelector = '#hydrated-msg';
const timestampSelector = '#timestamp';
const resultListSelector = '.result-list li';
const searchBoxSelector = '.search-box input';
const routes = ['generic', 'react'] as const;

// Note: Thresholds might need to be adjusted as the page tested changes (e.g. more components are added etc)
const vitals: Record<(typeof routes)[number], Cypress.ReportWebVitalsConfig> = {
  generic: {
    thresholds: {
      lcp: 3000,
      fid: 500,
      cls: 0.15,
      fcp: 2200,
      ttfb: 800,
      inp: 500,
    },
  },
  react: {
    thresholds: {
      lcp: 3000,
      fid: 900,
      cls: 0.15,
      fcp: 2200,
      ttfb: 800,
      inp: 900,
    },
  },
};

routes.forEach((route) => {
  describe(`${route} Headless SSR utils`, () => {
    it('renders page in SSR as expected', () => {
      cy.intercept(route, (req) => {
        req.continue((resp) => {
          const dom = new DOMParser().parseFromString(resp.body, 'text/html');
          expect(dom.querySelector(msgSelector)?.textContent).to.equal(
            numResultsMsg
          );
          expect(dom.querySelectorAll(resultListSelector).length).to.equal(
            numResults
          );
        });
      });
      cy.visit(route);
    });

    it('renders page in CSR as expected', () => {
      cy.visit(route);
      cy.get(msgSelector).should('have.text', numResultsMsg);
      cy.get(resultListSelector).should('have.length', numResults);
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
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(ssrTimestamp).to.not.be.undefined;
        cy.get(timestampSelector).should((timeStampElement) => {
          const hydratedTimestamp = Date.parse(timeStampElement.text());
          expect(hydratedTimestamp).to.be.greaterThan(ssrTimestamp);
        });
      });
    });

    it('should pass the web-vitals audits', () => {
      cy.vitals({
        ...vitals[route],
        url: route,
        firstInputSelector: '.facet-values > li:first-of-type > input',
      });
    });
  });

  describe(`${route} Headless SSR utils after hydration`, () => {
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
      getResultTitles().should('have.length', numResults).as('initial-results');
      waitForHydration();
      cy.get(searchBoxSelector).focus().type('abc{enter}');
      cy.wait(1000);
      cy.get<string>('@initial-results').then((initialResults) => {
        getResultTitles()
          .should('have.length', numResults)
          .and('not.deep.equal', initialResults);
      });
    });
  });
});
