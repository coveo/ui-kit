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
// import {Result} from '@coveo/headless';
import {InstantResultsSelectors} from './search-box-instant-results-selectors';

// type PartialResultList = Partial<Result>[];
const setInstantResults = (count: number) =>
  (fixture: TestFixture) => {
    fixture.withCustomResponse(response => {
      response.results = Array.from({length: count}, (_, i) => ({
        title: `Instant Result ${i}`,
        uniqueId: `instant_result_${i}`,
        uri: `about:blank?${i}`,
        clickUri: `about:blank?${i}`,
        raw: {
          urihash: `${i}`,
        },
      }));
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

  function setupWithSuggestionsAndRecentQueries() {
    new TestFixture()
      .with(setInstantResults(numOfInstantResults))
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
    before(() => {
      setupWithSuggestionsAndRecentQueries();
      SearchBoxSelectors.inputBox().type('{downarrow}{downarrow}{rightarrow}', {
        delay: 500,
        force: true,
      });
    });
    SearchBoxAssertions.assertHasSuggestionsCount(maxRecentQueriesWithoutQuery);
    InstantResultsAssertions.assertHasResultCount(numOfInstantResults);
    CommonAssertions.assertAriaLiveMessage(
      maxRecentQueriesWithoutQuery.toString()
    );
    describe('when navigating from query to results', () => {
      after(() => {
        SearchBoxSelectors.inputBox().clear({force: true});
      });
      InstantResultsAssertions.assertResultIsSelected(0);
    });
    describe('when navigating back from result to query', () => {
      before(() => {
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
          expect(win.location.href).to.equal('about:blank?0');
        });
      });
    });
  });

  describe('with mouse navigation', () => {
    before(() => {
      setupWithSuggestionsAndRecentQueries();
      SearchBoxSelectors.inputBox().click();
    });

    describe('when hovering over a query', () => {
      before(() => {
        SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');
      });
      SearchBoxAssertions.assertSuggestionIsSelected(0);
      SearchBoxAssertions.assertHasText('');

      describe('when hovering over an instant result', () => {
        before(() => {
          cy.wait(1000);
          InstantResultsSelectors.results().eq(1).trigger('mouseover');
        });
        InstantResultsAssertions.assertResultIsSelected(1);
        SearchBoxAssertions.assertNoSuggestionIsSelected();

        describe('when hovering over a different query', () => {
          before(() => {
            setInstantResults(numOfInstantResults - 1)();
            SearchBoxSelectors.querySuggestions().eq(1).trigger('mouseover');
            cy.wait(TestFixture.interceptAliases.Search);
          });
          InstantResultsAssertions.assertNoResultIsSelected();
          InstantResultsAssertions.assertHasResultCount(
            numOfInstantResults - 1
          );
          SearchBoxAssertions.assertSuggestionIsSelected(1);
        });
      });
    });

    describe('when clicking a result', () => {
      before(() => {
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
