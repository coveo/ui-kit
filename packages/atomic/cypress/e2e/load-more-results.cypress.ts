import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {
  addLoadMoreResults,
  pressLoadMoreResults,
} from './load-more-results-actions';
import {
  loadMoreResultsComponent,
  LoadMoreResultsSelectors,
} from './load-more-results-selectors';

describe('Load More Results Test Suites', () => {
  describe('when theres results', () => {
    beforeEach(() => {
      new TestFixture().with(addLoadMoreResults()).init();
    });
    CommonAssertions.assertAccessibility(loadMoreResultsComponent);
    CommonAssertions.assertContainsComponentError(
      LoadMoreResultsSelectors,
      false
    );
    it('should display a recap of the amount of results', () => {
      LoadMoreResultsSelectors.resultsRecap()
        .should('be.visible')
        .should('contain.text', 'Showing')
        .should('contain.text', 'results');
    });
    it('should display a progress bar', () => {
      LoadMoreResultsSelectors.progressBar()
        .should('be.visible')
        .children()
        .first()
        .should('have.css', 'width');
    });

    it('should display a load more button', () => {
      LoadMoreResultsSelectors.button()
        .should('be.visible')
        .should('contain.text', 'Load more results');
    });

    describe('when clicked', () => {
      beforeEach(() => {
        pressLoadMoreResults();
      });

      it('should include analytics in the v2 call', async () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
          expect(firstSearch.request.body).to.have.property('analytics');
          const analyticsBody = firstSearch.request.body.analytics;
          expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
          expect(analyticsBody).to.have.property(
            'eventValue',
            'pagerScrolling'
          );
        });
      });

      it('should load more results', () => {
        cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
          const analyticsBody = intercept.request.body;
          expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
          expect(analyticsBody).to.have.property(
            'eventValue',
            'pagerScrolling'
          );
        });
      });
    });
  });

  describe('when theres no results', () => {
    it('should be hidden', () => {
      new TestFixture().with(addLoadMoreResults()).withNoResults().init();
      LoadMoreResultsSelectors.shadow().should('not.be.visible');
    });
  });

  describe('when theres a query error', () => {
    it('should be hidden', () => {
      new TestFixture().with(addLoadMoreResults()).withError().init();
      LoadMoreResultsSelectors.shadow().should('not.be.visible');
    });
  });
});
