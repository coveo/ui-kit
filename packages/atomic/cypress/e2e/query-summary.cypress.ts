import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {addQuerySummary} from './query-summary-actions';
import * as QuerySummaryAssertions from './query-summary-assertions';
import {QuerySummarySelectors} from './query-summary-selectors';
import {addSearchBox} from './search-box/search-box-actions';

const addResultsPerPage = (count: number) => (fixture: TestFixture) => {
  fixture.withElement(
    generateComponentHTML('atomic-results-per-page', {
      'choices-displayed': count.toString(),
      'initial-choice': count,
    })
  );
};

describe('Query Summary Test Suites', () => {

  describe('when search yields 27 results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary())
        .with(addResultsPerPage(27))
        .init();
    });

    CommonAssertions.assertAriaLiveMessage(
      QuerySummarySelectors.ariaLive,
      '27'
    );
  });

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
