import {InsightPanelsSelectors} from './insight-panel-selectors';

const host = 'http://localhost:3333/examples/insights.html';

describe('Insights panel test suites', () => {
  describe('when there is nothing written in the search box', () => {
    before(() => {
      cy.visit(host);
    });

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
  });
});
