import * as CommonAssertions from '../e2e/common-assertions';
import {InsightPanelsSelectors} from './insight-panel-selectors';

const host = 'http://localhost:3333/examples/insights.html';
const insightSearchAlias = '@CoveoInsight';

const interceptInsightSearch = (alias = insightSearchAlias) =>
  cy
    .intercept('POST', '**/rest/organizations/*/insight/v1/configs/*/search')
    .as(alias.substring(1));

describe('Insight Panel test suites', () => {
  const setupPage = () => {
    interceptInsightSearch();
    cy.visit(host);
    cy.injectAxe();
    cy.wait(insightSearchAlias);
  };

  beforeEach(() => {
    interceptInsightSearch();
  });

  describe('when there is nothing written in the search box', () => {
    before(setupPage);

    it('should display placeholder while loading', () => {
      InsightPanelsSelectors.resultsPlaceholder()
        .should('exist')
        .should('have.length.at.least', 1);
    });

    it('should not add any unexpected style tags', () => {
      const numTopLevelStyleTags = 2;
      const numLayoutStyleTags = 1;

      cy.get('style').should(
        'have.length',
        numTopLevelStyleTags + numLayoutStyleTags
      );
      InsightPanelsSelectors.topLevelStyleTags().should(
        'have.length',
        numTopLevelStyleTags
      );
      InsightPanelsSelectors.layoutStyleTags().should(
        'have.length',
        numLayoutStyleTags
      );
    });

    it('should display results', () => {
      InsightPanelsSelectors.results()
        .should('exist')
        .should('have.length.at.least', 1)
        .first()
        .shadow()
        .find('atomic-result-link')
        .should('exist')
        .find('a')
        .should('have.attr', 'href');
    });

    it('should display pagination', () => {
      InsightPanelsSelectors.pager()
        .should('exist')
        .shadow()
        .find('input')
        .eq(1)
        .click();

      cy.wait(insightSearchAlias);

      InsightPanelsSelectors.pager()
        .shadow()
        .find('[part~="active-page-button"]')
        .should('have.attr', 'value', '2');
    });

    it('should display query summary', () => {
      InsightPanelsSelectors.querySummary()
        .should('exist')
        .shadow()
        .should('have.text', 'Insights related to this case');
    });

    it('should display a search box', () => {
      InsightPanelsSelectors.searchbox()
        .should('exist')
        .shadow()
        .find('input')
        .should('exist')
        .should('have.attr', 'placeholder', 'Search...');

      InsightPanelsSelectors.searchbox()
        .shadow()
        .find('atomic-icon')
        .should('have.attr', 'icon');
    });

    it('should display refine-toggle', () => {
      InsightPanelsSelectors.refineToggle()
        .should('exist')
        .shadow()
        .find('button')
        .should('exist')
        .should('have.attr', 'title', 'Filters');
    });

    it('should display refine-modal', () => {
      InsightPanelsSelectors.refineToggle().click();
      InsightPanelsSelectors.refineModal().should('exist');
      InsightPanelsSelectors.focusTrap().should('exist');

      InsightPanelsSelectors.filtersModal().should('have.attr', 'is-open');

      InsightPanelsSelectors.filtersModal()
        .find('[slot~="header"]')
        .should('have.text', 'Filters');

      InsightPanelsSelectors.filters()
        .find('atomic-insight-facet')
        .should('be.visible')
        .should('have.length.at.least', 1);

      InsightPanelsSelectors.filters()
        .find('atomic-insight-timeframe-facet')
        .should('be.visible')
        .should('have.length.at.least', 1);

      InsightPanelsSelectors.filters()
        .find('atomic-insight-numeric-facet')
        .should('be.visible')
        .should('have.length.at.least', 1);

      InsightPanelsSelectors.filtersModal().find('[slot="footer"]').click();

      InsightPanelsSelectors.filtersModal().should('not.have.attr', 'is-open');
    });

    it('should display edit toggle', () => {
      InsightPanelsSelectors.editToggle()
        .should('exist')
        .should('have.attr', 'tooltip');

      InsightPanelsSelectors.editToggle()
        .shadow()
        .find('button')
        .should('have.attr', 'title');
      InsightPanelsSelectors.editToggle()
        .shadow()
        .find('button')
        .find('atomic-icon')
        .should('exist');
    });

    it('should display history toggle', () => {
      InsightPanelsSelectors.historyToggle()
        .should('exist')
        .should('have.attr', 'tooltip');

      InsightPanelsSelectors.historyToggle()
        .shadow()
        .find('button')
        .should('have.attr', 'title');
      InsightPanelsSelectors.historyToggle()
        .shadow()
        .find('button')
        .find('atomic-icon')
        .should('exist');
    });

    it('should display full search button', () => {
      InsightPanelsSelectors.fullSearchButton()
        .should('exist')
        .should('have.attr', 'tooltip');

      InsightPanelsSelectors.fullSearchButton()
        .shadow()
        .find('button')
        .should('have.attr', 'title');
      InsightPanelsSelectors.fullSearchButton()
        .shadow()
        .find('button')
        .find('atomic-icon')
        .should('exist');
    });

    it('should display tabs', () => {
      InsightPanelsSelectors.tabs()
        .should('exist')
        .find('atomic-insight-tab')
        .should('have.length.at.least', 1)
        .eq(1)
        .click()
        .shadow()
        .find('button[aria-pressed="true"]')
        .should('have.text', 'Youtube');
    });

    CommonAssertions.assertAccessibility(InsightPanelsSelectors.searchbox);
  });

  describe('when there is something written in the search box', () => {
    before(() => {
      setupPage();
      InsightPanelsSelectors.results()
        .its('length')
        .should('be.greaterThan', 0);
      InsightPanelsSelectors.searchbox()
        .shadow()
        .find('input')
        .type('test{enter}');
    });

    it('displays a query summary', () => {
      InsightPanelsSelectors.querySummary()
        .should('exist')
        .shadow()
        .should('contain.text', 'Results 1-5')
        .should('contain.text', 'for test');
    });

    CommonAssertions.assertAccessibility(InsightPanelsSelectors.searchbox);
  });

  describe('when there is a custom salesforce result template', () => {
    beforeEach(setupPage);

    it('should display a salesforce result template for salesforce results', () => {
      const searchAlias = '@tabCausedSearch';
      interceptInsightSearch(searchAlias);

      InsightPanelsSelectors.tabPopoverButton().click();
      InsightPanelsSelectors.tabBar()
        .find('tab-popover')
        .find('[part="popover-tab"]')
        .eq(0)
        .should('have.text', 'Salesforce')
        .click();

      cy.wait(searchAlias);

      InsightPanelsSelectors.tabs()
        .should('exist')
        .find('atomic-insight-tab[label="Salesforce"]')
        .shadow()
        .find('button[aria-pressed="true"]')
        .should('have.text', 'Salesforce');
      InsightPanelsSelectors.results()
        .first()
        .shadow()
        .find('atomic-result-text[field="sfid"]')
        .should('exist');
    });

    describe('Full Search Button', () => {
      before(() => {
        Cypress.on('window:before:load', (win) => {
          cy.spy(win.console, 'log');
        });
      });
      it('should poperly handle being clicked', () => {
        InsightPanelsSelectors.fullSearchButton()
          .shadow()
          .find('[part="full-search-button"]')
          .click();
        cy.window().then((win) => {
          expect(win.console.log).to.have.callCount(1);
        });
      });
    });
  });
});
