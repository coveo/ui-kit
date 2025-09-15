import {TestFixture} from '../fixtures/test-fixture';
import {addQuerySummary} from './query-summary-actions';
import * as QuerySummaryAssertions from './query-summary-assertions';
import {addSearchBox} from './search-box/search-box-actions';

describe('Query Summary Test Suites', () => {
  describe('should match text content', () => {
    it('with a query yielding multiple results', () => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .with(addSearchBox())
        .withHash('q=test')
        .init();
      QuerySummaryAssertions.assertContentShouldMatch(
        /^Results 1-10 of [\d,]+ for test in [\d.]+ seconds$/
      );
    });

    it('with a query yielding a single result', () => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .with(addSearchBox())
        .withHash(
          "q=Queen's%20Gambit%20sparks%20world%20of%20online%20chess%20celebrities"
        )
        .init();
      QuerySummaryAssertions.assertContentShouldMatch(
        /^Result 1 of [\d,]+ for Queen's Gambit sparks world of online chess celebrities in [\d.]+ seconds$/
      );
    });
  });
});
