import * as CommonAssertions from '../integration/common-assertions';
import {InsightPanelsSelectors} from './insight-panel-selectors';

const host = 'http://localhost:3333/examples/insights.html';

describe('Insights panel test suites', () => {
  function setupPage() {
    cy.visit(host);
    cy.injectAxe();
  }

  describe('when there is nothing written in the search box', () => {
    before(setupPage);

    it('should display placeholder while loading', () => {
      InsightPanelsSelectors.resultsPlaceholder()
        .should('exist')
        .should('have.length.at.least', 1);
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
        .should('have.attr', 'placeholder', 'Search');

      InsightPanelsSelectors.searchbox()
        .shadow()
        .find('button')
        .should('exist')
        .find('atomic-icon')
        .should('have.attr', 'icon');
    });

    it('should display refine-toggle', () => {
      InsightPanelsSelectors.refineToggle()
        .should('exist')
        .shadow()
        .find('atomic-icon-button')
        .shadow()
        .find('button')
        .should('exist')
        .should('have.attr', 'title', 'Filters');
    });

    it('should display refine-modal', () => {
      InsightPanelsSelectors.refineToggle().click();
      InsightPanelsSelectors.refineModal().should('exist');

      InsightPanelsSelectors.filtersModal().should('have.attr', 'is-open');

      InsightPanelsSelectors.filtersModal()
        .find('[slot~="header"]')
        .should('have.text', 'Filters');

      InsightPanelsSelectors.filters()
        .find('atomic-insight-facet')
        .should('exist')
        .should('have.length.at.least', 1);

      InsightPanelsSelectors.filters()
        .find('atomic-insight-timeframe-facet')
        .should('exist')
        .should('have.length.at.least', 1);

      InsightPanelsSelectors.filters()
        .find('atomic-insight-numeric-facet')
        .should('exist')
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
        .find('atomic-icon-button')
        .shadow()
        .find('button')
        .should('have.attr', 'title');
      InsightPanelsSelectors.editToggle()
        .shadow()
        .find('atomic-icon-button')
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
        .find('atomic-icon-button')
        .shadow()
        .find('button')
        .should('have.attr', 'title');
      InsightPanelsSelectors.historyToggle()
        .shadow()
        .find('atomic-icon-button')
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
        .click();

      InsightPanelsSelectors.tabs()
        .find('button[aria-pressed="true"]')
        .should('have.text', 'PDF');
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
      cy.wait(200);
    });

    it('display query summary', () => {
      InsightPanelsSelectors.querySummary()
        .should('exist')
        .shadow()
        .should('contain.text', 'Results 1-5')
        .should('contain.text', 'for test');
    });

    CommonAssertions.assertAccessibility(InsightPanelsSelectors.searchbox);
  });
});
