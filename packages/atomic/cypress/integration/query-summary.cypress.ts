import {TestFixture} from '../fixtures/test-fixture';
import {addSearchBox} from '../fixtures/test-fixture-search-box';
import {addQuerySummary} from './query-summary-actions';
import {QuerySummarySelectors} from './query-summary-selectors';

describe('Query Summary Test Suites', () => {
  function contentShouldMatch(content: RegExp | string) {
    QuerySummarySelectors.text().should('match', content);
  }

  it('when search has not been executed, placeholder should be displayed', () => {
    new TestFixture()
      .with(addQuerySummary())
      .withoutFirstAutomaticSearch()
      .init();
    QuerySummarySelectors.placeholder().should('be.visible');
  });

  it('when search yields no results, container should be empty', () => {
    new TestFixture()
      .with(addQuerySummary({'enable-duration': 'true'}))
      .with(addSearchBox())
      .withHash('q=nowaythisquerywillevereverevertreturnanythingitsimpossible')
      .init();

    QuerySummarySelectors.container().should('be.empty');
  });

  describe('should match text content', () => {
    it('with a query yielding multiple results', () => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .with(addSearchBox())
        .withHash('q=test')
        .init();
      contentShouldMatch(/^Results 1-10 of [\d,]+ for test in [\d.]+ seconds$/);
    });

    it('with a query yielding a single result', () => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .with(addSearchBox())
        .withHash(
          "q=Queen's%20Gambit%20sparks%20world%20of%20online%20chess%20celebrities"
        )
        .init();
      contentShouldMatch(
        /^Result 1 of [\d,]+ for Queen's Gambit sparks world of online chess celebrities in [\d.]+ seconds$/
      );
    });
  });

  it('when "enableDuration" is false, should not show duration', () => {
    new TestFixture()
      .with(addQuerySummary())
      .with(addSearchBox())
      .withHash('q=test')
      .init();
    contentShouldMatch(/Results 1-10 of [\d,]+ for test$/);
  });
});
