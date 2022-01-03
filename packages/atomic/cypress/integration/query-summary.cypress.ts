import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {addQuerySummary} from './query-summary-actions';
import {QuerySummarySelectors} from './query-summary-selectors';
import * as CommonAssertions from './common-assertions';
import {addSearchBox} from './search-box-actions';

const addResultsPerPage = (count: number) => (fixture: TestFixture) => {
  fixture.withElement(
    generateComponentHTML('atomic-results-per-page', {
      'choices-displayed': count.toString(),
      'initial-choice': count,
    })
  );
};

describe('Query Summary Test Suites', () => {
  function contentShouldMatch(content: RegExp | string) {
    QuerySummarySelectors.text().should('match', content);
  }

  describe('when search has not been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonAssertions.assertNoAriaLiveMessage(QuerySummarySelectors.liveRegion);

    it('placeholder should be displayed', () => {
      QuerySummarySelectors.placeholder().should('be.visible');
    });
  });

  describe('when search yields no results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .with(addSearchBox())
        .withHash(
          'q=nowaythisquerywillevereverevertreturnanythingitsimpossible'
        )
        .init();
    });

    CommonAssertions.assertNoAriaLiveMessage(QuerySummarySelectors.liveRegion);

    it('container should be empty', () => {
      QuerySummarySelectors.container().should('be.empty');
    });
  });

  describe('when search yields 27 results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary())
        .with(addResultsPerPage(27))
        .init();
    });

    CommonAssertions.assertAriaLiveMessage(
      QuerySummarySelectors.liveRegion,
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
