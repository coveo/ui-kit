import 'cypress-web-vitals';
import {ConsoleAliases, spyOnConsole, waitForHydration} from './ssr-e2e-utils';

describe('headless ssr example', () => {
  const numResults = 10;
  const numResultsMsg = `Rendered page with ${numResults} results`;
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

  describe('after hydration', () => {
    beforeEach(() => {
      spyOnConsole();
      cy.visit('/');
      waitForHydration();
    });

    it('should not log any error nor warning', () => {
      cy.wait(1000);
      cy.get(ConsoleAliases.error).should('not.be.called');
      cy.get(ConsoleAliases.warn).should('not.be.called');
    });

    it('after submitting a query, should change search results', () => {
      const getResultTitles = () =>
        cy
          .get('.result-list li')
          .invoke('map', function (this: HTMLElement) {
            return this.innerText;
          })
          .invoke('toArray');

      getResultTitles().as('initial-results');
      cy.get('.search-box input').focus().type('abc{enter}');
      cy.get<string>('@initial-results').then((initialResults) =>
        getResultTitles().should((currentResults) => {
          expect(currentResults).not.to.deep.equal(initialResults);
          expect(currentResults).to.have.length(numResults);
        })
      );
    });
  });
});
