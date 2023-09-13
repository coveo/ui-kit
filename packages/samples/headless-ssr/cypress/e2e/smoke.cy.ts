import 'cypress-web-vitals';
import {
  ConsoleAliases,
  compareWithInitialResults,
  numResults,
  spyOnConsole,
  waitForHydration,
} from './utils';

const numResultsMsg = `Rendered page with ${numResults} results`;
const msgSelector = '#hydrated-msg';
const timestampSelector = '#timestamp';
const resultListSelector = '.result-list li';
const routes = ['generic', 'react'] as const;
const vitals: Record<typeof routes[number], Cypress.ReportWebVitalsConfig> = {
  generic: {
    thresholds: {
      fcp: 200,
      lcp: 200,
      cls: 0,
      ttfb: 60,
      // TODO: Ensure validity of following input based vitals with interactive elements
      fid: 400,
      inp: 400,
    },
  },
  react: {
    thresholds: {
      fcp: 400,
      lcp: 400,
      cls: 0,
      ttfb: 120,
      // TODO: Ensure validity of following input based vitals with interactive elements
      fid: 800,
      inp: 800,
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
        expect(ssrTimestamp).to.not.be.undefined;
        cy.get(timestampSelector).should((timeStampElement) => {
          const hydratedTimestamp = Date.parse(timeStampElement.text());
          expect(hydratedTimestamp).to.be.greaterThan(ssrTimestamp);
        });
      });
    });

    it('should pass the web-vitals audits', () => {
      // Note: Thresholds might need to be adjusted as the page tested changes (e.g. more components are added etc)
      cy.startVitalsCapture({url: route});
      compareWithInitialResults();
      cy.reportVitals(vitals[route]);
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
      compareWithInitialResults();
    });
  });
});
