import {AriaLabelGenerator} from '../../../../src/components/search/search-box-suggestions/atomic-search-box-instant-results/atomic-search-box-instant-results';
import {initializeBindings} from '../../../../src/utils/initialization-utils';
import {
  SafeStorage,
  StorageItems,
} from '../../../../src/utils/local-storage-utils';
import {
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {buildMockResult} from '../../../utils/mock-result';
import * as CommonAssertions from '../../common-assertions';
import {resultTextComponent} from '../../result-list/result-components/result-text-selectors';
import {buildTemplateWithoutSections} from '../../result-list/result-list-actions';
import {addSearchBox} from '../search-box-actions';
import * as SearchBoxAssertions from '../search-box-assertions';
import {searchBoxComponent, SearchBoxSelectors} from '../search-box-selectors';
import * as InstantResultsAssertions from './search-box-instant-results-assertions';
import {InstantResultsSelectors} from './search-box-instant-results-selectors';

const delay = (force = false) => ({delay: 200, force});
const downKeys = (count: number) => Array(count).fill('{downarrow}').join('');

const setInstantResults = (count: number) => (fixture: TestFixture) => {
  fixture.withCustomResponse((response) => {
    response.results = Array.from({length: count}, (_, i) =>
      buildMockResult({
        title: `Instant Result ${i}`,
        uniqueId: `instant_result_${i}`,
        uri: `https://example.com/${i}`,
        clickUri: `https://example.com/${i}`,
      })
    );
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
          instantResults: {},
          props: {
            'number-of-queries': numOfRecentQueries,
            'suggestion-timeout': 2000,
          },
        })
      )
      .init();
  }

  describe('with a custom aria label', () => {
    const customFieldName = 'custom';
    const customFieldValueForResult = (index: number) => `${index}!`;
    const ariaLabelGeneratorAlias = 'ariaLabelGenerator';
    beforeEach(() => {
      new TestFixture()
        .with(setInstantResults(numOfInstantResults))
        .with(setRecentQueries(numOfRecentQueries))
        .withCustomResponse((response) => {
          response.results.forEach(
            (result, i) =>
              (result.raw[customFieldName] = customFieldValueForResult(i))
          );
        })
        .with(
          addSearchBox({
            suggestions: {maxWithoutQuery: 8, maxWithQuery: 8},
            instantResults: {
              template: buildTemplateWithoutSections(
                generateComponentHTML(resultTextComponent, {field: 'title'})
              ),
              ariaLabelGenerator: cy
                .stub()
                .as(ariaLabelGeneratorAlias)
                .callsFake(
                  <AriaLabelGenerator>(
                    ((_, result) => result.raw[customFieldName] as string)
                  )
                ),
            },
          })
        )
        .init();
      SearchBoxSelectors.inputBox().type(`${downKeys(2)}`, delay());
      InstantResultsSelectors.results()
        .find(resultTextComponent, {includeShadowDom: true})
        .should(($els) => expect($els.text().trim().length).to.greaterThan(0));
    });

    CommonAssertions.assertAccessibility(searchBoxComponent);

    it('uses the generated labels', () => {
      InstantResultsSelectors.results().should(([...results]) =>
        results.forEach((result, i) =>
          expect(result.ariaLabel).to.contain(customFieldValueForResult(i))
        )
      );
    });

    it('passes the bindings to the generator', () => {
      cy.get<
        sinon.SinonStub<
          Parameters<AriaLabelGenerator>,
          ReturnType<AriaLabelGenerator>
        >
      >(`@${ariaLabelGeneratorAlias}`).then((stub) =>
        cy
          .get('atomic-search-interface')
          .then(([searchInterface]) => initializeBindings(searchInterface))
          .then((expectedBindings) => {
            expect(Object.keys(stub.firstCall.args[0])).to.contain.all.members(
              Object.keys(expectedBindings)
            );
          })
      );
    });
  });

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
        SearchBoxSelectors.searchBoxAriaLive,
        maxRecentQueriesWithoutQuery.toString()
      );
      InstantResultsAssertions.assertResultIsSelected(0);
      SearchBoxAssertions.assertSuggestionIsHighlighted(1);
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
          expect(win.location.href).to.equal('https://example.com/0');
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
      SearchBoxAssertions.assertSuggestionIsHighlighted(1);

      describe('when hovering over a different query', () => {
        before(() => {
          SearchBoxSelectors.querySuggestions().eq(1).trigger('mouseover');
        });
        InstantResultsAssertions.assertHasResultCount(4);
        InstantResultsAssertions.assertNoResultIsSelected();
        SearchBoxAssertions.assertSuggestionIsSelected(1);
      });
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
          expect(win.location.href).to.equal('https://example.com/1');
        });
      });
    });
  });
});
