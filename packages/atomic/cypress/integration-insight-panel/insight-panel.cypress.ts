import * as CommonAssertions from '../e2e/common-assertions';
import {InsightPanelActions} from './insight-panel-actions';
import {InsightPanelsSelectors} from './insight-panel-selectors';
import {
  insightSearchAlias,
  interceptInsightSearch,
  mockSearchWithSmartSnippet,
  mockSearchWithSmartSnippetSuggestions,
  mockSearchWithoutSmartSnippet,
  mockSearchWithoutSmartSnippetSuggestions,
} from './route-mocks';

const host = 'http://localhost:3333/examples/insights.html';

describe('Insight Panel test suites', () => {
  const setupPage = () => {
    interceptInsightSearch();
    cy.visit(host);
    cy.wait(insightSearchAlias);
  };

  beforeEach(() => {
    interceptInsightSearch();
  });

  describe('when there is nothing written in the search box', () => {
    beforeEach(setupPage);

    it('should be accessible', () => {
      cy.injectAxe();
      CommonAssertions.assertAccessibility(InsightPanelsSelectors.searchbox);
    });

    it('should display placeholder while loading', () => {
      InsightPanelsSelectors.resultsPlaceholder()
        .should('exist')
        .should('have.length.at.least', 1);
    });

    it('should not add any unexpected style tags', () => {
      const numTopLevelStyleTags = 4;
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

    it('should display result action bar', () => {
      InsightPanelsSelectors.resultActionBar()
        .should('exist')
        .should('have.length.at.least', 1)
        .find('button')
        .find('atomic-icon')
        .should('exist');
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
        .find('textarea[part="textarea"]')
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
  });

  describe('when there is something written in the search box', () => {
    beforeEach(() => {
      setupPage();
      InsightPanelsSelectors.results()
        .its('length')
        .should('be.greaterThan', 0);
      InsightPanelActions.executeQuery('test');
    });

    it('should be accessible', () => {
      cy.injectAxe();
      CommonAssertions.assertAccessibility(InsightPanelsSelectors.searchbox);
    });

    it('displays a query summary', () => {
      InsightPanelsSelectors.querySummary()
        .should('exist')
        .shadow()
        .should('contain.text', 'Results 1-5')
        .should('contain.text', 'for test');
    });
  });


  describe('Smart Snippet Answer', () => {
    const visitPage = () => {
      cy.visit(host);
      cy.injectAxe();
      cy.wait(insightSearchAlias);
    };

    describe('when no smart snippet answer is returned', () => {
      beforeEach(() => {
        mockSearchWithoutSmartSnippet();
        visitPage();
      });

      it('should hide the smart snippets components', () => {
        InsightPanelsSelectors.smartSnippet().should(
          'have.class',
          'atomic-hidden'
        );
        InsightPanelsSelectors.smartSnippetExpandableAnswer().should(
          'not.exist'
        );
        InsightPanelsSelectors.smartSnippetSuggestions().should(
          'have.class',
          'atomic-hidden'
        );
      });
    });

    describe('when a smart snippet answer is returned', () => {
      beforeEach(() => {
        mockSearchWithSmartSnippet();
        visitPage();
      });

      it('should show the smart snippet component', () => {
        InsightPanelsSelectors.smartSnippetExpandableAnswer().should('exist');
      });

      describe('when giving explanatory feedback', () => {
        it('should show the feedback modal', () => {
          InsightPanelsSelectors.smartSnippetFeedbackModal().should(
            'not.exist'
          );

          InsightPanelsSelectors.smartSnippetFeedbackNoButton().click();
          InsightPanelsSelectors.smartSnippetsExplainWhyButton().click();

          InsightPanelsSelectors.smartSnippetFeedbackModal().should('exist');
        });
      });
    });
  });

  describe('Smart Snippet Suggestions', () => {
    const visitPage = () => {
      cy.visit(host);
      cy.injectAxe();
      cy.wait(insightSearchAlias);
    };

    describe('when no smart snippet suggestions are returned', () => {
      beforeEach(() => {
        mockSearchWithoutSmartSnippetSuggestions();
        visitPage();
      });

      it('should hide the suggestions components', () => {
        InsightPanelsSelectors.smartSnippetSuggestions().should(
          'have.class',
          'atomic-hidden'
        );
      });
    });

    describe('when smart snippet suggestions are returned', () => {
      beforeEach(() => {
        mockSearchWithSmartSnippetSuggestions();
        visitPage();
      });

      it('should show the smart snippets component', () => {
        InsightPanelsSelectors.smartSnippetSuggestions().should('be.visible');
      });
    });
  });
});
