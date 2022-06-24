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

const setInstantResults = (count: number) => (fixture: TestFixture) => {
  fixture.withCustomResponse((response) => {
    for (let i = 0; i < count; i++) {
      response.results[i].title = `Instant Result ${i}`;
      response.results[i].uniqueId = `instant_result_${i}`;
      response.results[i].uri = `/${i}`;
      response.results[i].clickUri = `/${i}`;
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
          '{downarrow}{downarrow}{rightarrow}',
          {
            delay: 500,
            force: true,
          }
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
          '{downarrow}{downarrow}{rightarrow}{leftarrow}',
          {
            delay: 200,
            force: true,
          }
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
          '{downarrow}{downarrow}{rightarrow}{leftarrow}',
          {
            delay: 200,
            force: true,
          }
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
          '{downarrow}{downarrow}{rightarrow}{enter}',
          {
            delay: 200,
            force: true,
          }
        );
      });
      it('redirects to new page', () => {
        cy.window().then((win) => {
          expect(win.location.href).to.equal(`${win.location.origin}/0`);
        });
      });
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
          SearchBoxSelectors.inputBox().type('{downarrow}', {
            delay: 200,
            force: true,
          });
          cy.wait(TestFixture.interceptAliases.Search);
          InstantResultsSelectors.results().eq(1).click();
        });
        it('redirects to new page', () => {
          cy.window().then((win) => {
            expect(win.location.href).to.equal(`${win.location.origin}/1`);
          });
        });
      });
    });
  });
});
