import {TestFixture} from '../../../fixtures/test-fixture';
import {
  SafeStorage,
  StorageItems,
} from '../../../../src/utils/local-storage-utils';
import {SearchBoxSelectors} from '../search-box-selectors';
import {addSearchBox} from '../search-box-actions';
import * as CommonAssertions from '../../common-assertions';
import * as SearchBoxAssertions from '../search-box-assertions';
import * as InstantResultsAssertions from './search-box-instant-results-assertions';
import {InstantResultsSelectors} from './search-box-instant-results-selectors';

const delay = (force = false) => ({delay: 200, force});
const downKeys = (count: number) => Array(count).fill('{downarrow}').join('');

const setInstantResults = (count: number) => (fixture: TestFixture) => {
  fixture.withCustomResponse((response) => {
    for (let i = 0; i < count; i++) {
      response.results[i].title = `Instant Result ${i}`;
      response.results[i].uniqueId = `instant_result_${i}`;
      response.results[i].uri = `about:blank?${i}`;
      response.results[i].clickUri = `about:blank?${i}`;
    }
    response.results = response.results.splice(0, count);
  });
};

const setRecentQueries = (count: number) => () => {
  new SafeStorage().setJSON(
    StorageItems.RECENT_QUERIES,
    Array.from({length: count}, (_, i) => `Recent query ${i}`)
  );
};

describe('Instant Results Test Suites', () => {
  const numOfRecentQueries = 4;
  const numOfInstantResults = 4;
  const maxRecentQueriesWithoutQuery = numOfRecentQueries - 1;

  function setupWithSuggestionsAndRecentQueries(
    resultsCount = numOfInstantResults
  ) {
    return new TestFixture()
      .with(setInstantResults(resultsCount))
      .with(setRecentQueries(numOfRecentQueries))
      .with(
        addSearchBox({
          recentQueries: {
            maxWithoutQuery: maxRecentQueriesWithoutQuery,
            maxWithQuery: numOfRecentQueries,
          },
          instantResults: true,
          props: {
            'number-of-queries': numOfRecentQueries,
            'suggestion-timeout': 2000,
          },
        })
      )
      .init();
  }

  describe('with keyboard navigation', () => {
    describe('when navigating from query to results', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(
          `${downKeys(2)}{rightarrow}`,
          delay()
        );
      });
      after(() => {
        SearchBoxSelectors.inputBox().clear({force: true});
      });
      SearchBoxAssertions.assertHasSuggestionsCount(
        maxRecentQueriesWithoutQuery
      );
      InstantResultsAssertions.assertHasResultCount(numOfInstantResults);
      CommonAssertions.assertAriaLiveMessage(
        maxRecentQueriesWithoutQuery.toString()
      );
      InstantResultsAssertions.assertResultIsSelected(0);
    });
    describe('when navigating back from result to query', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(
          `${downKeys(2)}{rightarrow}{leftarrow}`,
          delay()
        );
      });
      after(() => {
        SearchBoxSelectors.inputBox().clear({force: true});
      });
      InstantResultsAssertions.assertNoResultIsSelected();
      SearchBoxAssertions.assertSuggestionIsSelected(0);
      SearchBoxAssertions.assertHasText('Recent query 0');
    });

    describe('when navigating back from result to query', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(
          `${downKeys(2)}{rightarrow}{leftarrow}`,
          delay()
        );
      });
      after(() => {
        SearchBoxSelectors.inputBox().clear({force: true});
      });
      InstantResultsAssertions.assertNoResultIsSelected();
      SearchBoxAssertions.assertSuggestionIsSelected(0);
      SearchBoxAssertions.assertHasText('Recent query 0');
    });

    describe('when pressing enter on a result', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(
          `${downKeys(2)}{rightarrow}{enter}`,
          delay()
        );
      });
      it('redirects to new page', () => {
        cy.window().then((win) => {
          expect(win.location.href).to.equal('about:blank?0');
        });
      });
    });
    describe('when navigating to first suggestion and back with up arrow', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(
          'Rec{downarrow}{uparrow}{leftarrow}{del}',
          delay()
        );
      });

      SearchBoxAssertions.assertNoSuggestionIsSelected();
      SearchBoxAssertions.assertHasText('Re');
    });

    describe('when navigating with the down arrow only', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(downKeys(6), delay());
      });

      SearchBoxAssertions.assertSuggestionIsSelected(0);
    });

    describe('when navigating up from results', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type('{moveToStart}');
        InstantResultsSelectors.results();
        SearchBoxSelectors.inputBox().type(
          '{rightarrow}{uparrow}',
          delay(true)
        );
      });

      SearchBoxAssertions.assertNoSuggestionIsSelected();
      InstantResultsAssertions.assertNoResultIsSelected();
    });

    describe('when navigating up from input', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type('{moveToStart}{uparrow}', delay());
      });

      SearchBoxAssertions.assertSuggestionIsSelected(2);
    });

    describe('when typing when a query is selected', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().type(
          `${downKeys(2)}{backspace}`,
          delay()
        );
      });

      SearchBoxAssertions.assertNoSuggestionIsSelected();
      SearchBoxAssertions.assertHasText('Recent query ');
    });
  });

  describe('with mouse navigation', () => {
    describe('when hovering over a query', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().click();
        SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');
      });
      SearchBoxAssertions.assertSuggestionIsSelected(0);
      SearchBoxAssertions.assertHasText('');
    });

    describe('when hovering over an instant result', () => {
      before(() => {
        setupWithSuggestionsAndRecentQueries(2);
        SearchBoxSelectors.inputBox().click();
        InstantResultsSelectors.results().eq(1).trigger('mouseover');
      });
      InstantResultsAssertions.assertHasResultCount(2);
      InstantResultsAssertions.assertResultIsSelected(1);
      SearchBoxAssertions.assertNoSuggestionIsSelected();

      describe('when hovering over a different query', () => {
        before(() => {
          SearchBoxSelectors.querySuggestions().eq(1).trigger('mouseover');
        });
        InstantResultsAssertions.assertHasResultCount(4);
        InstantResultsAssertions.assertNoResultIsSelected();
        SearchBoxAssertions.assertSuggestionIsSelected(1);
      });
      describe('when clicking a result', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();
          SearchBoxSelectors.inputBox().click();
          InstantResultsSelectors.results().eq(1).click();
        });
        it('redirects to new page', () => {
          cy.window().then((win) => {
            expect(win.location.href).to.equal('about:blank?1');
          });
        });
      });
    });
  });
});
