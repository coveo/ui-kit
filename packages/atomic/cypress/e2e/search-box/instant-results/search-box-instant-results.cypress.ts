import {AriaLabelGenerator} from '../../../../src/components/search/atomic-search-box-instant-results/atomic-search-box-instant-results';
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

const delay = (force = false) => ({delay: 400, force});
const downKeys = (count: number) => Array(count).fill('{downArrow}').join('');

const interceptRedirectionToExampleDotCom = () => {
  cy.intercept('https://example.com/**', (req) => {
    req.reply('<html>Success</html>');
  }).as('redirectToExampleDotCom');
};

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
    Array.from({length: count}, (_, i) => `recent query ${i}`)
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

  it('with a custom aria label, it should render correctly', () => {
    const customFieldName = 'custom';
    const customFieldValueForResult = (index: number) => `${index}!`;
    const ariaLabelGeneratorAlias = 'ariaLabelGenerator';
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
    cy.get(`@${ariaLabelGeneratorAlias}`).then((stub) => {
      cy.get('atomic-search-interface').then(($interface) => {
        const instantEl = ($interface[0] as HTMLElement).querySelector('atomic-search-box-instant-results') as any;
        instantEl.ariaLabelGenerator = stub;
      });
    });

    SearchBoxSelectors.textArea().type(`${downKeys(2)}`, delay());
    InstantResultsSelectors.results()
      .find(resultTextComponent, {includeShadowDom: true}).find('atomic-text').shadow()
      .should(($els) => expect($els.text().trim().length).to.greaterThan(0));

    CommonAssertions.assertAccessibility(searchBoxComponent);
    InstantResultsAssertions.assertLogSearchboxAsYouType();

    cy.log('uses the generated label');
    InstantResultsSelectors.results().should(([...results]) =>
      results.forEach((result, i) =>
        expect(result.ariaLabel).to.contain(customFieldValueForResult(i))
      )
    );

    cy.log('passes the bindings to the generator');
    cy.get<
      sinon.SinonStub<
        Parameters<AriaLabelGenerator>,
        ReturnType<AriaLabelGenerator>
      >
    >(`@${ariaLabelGeneratorAlias}`).then((stub) =>
      cy
        .get('atomic-search-interface')
        .then(([searchInterface]) => {
          return new Promise((resolve) => {
            const event = new CustomEvent('atomic/initializeComponent', {
              detail: (bindings: unknown) => resolve(bindings),
            });
            searchInterface.dispatchEvent(event);
          });
        })
        .then((expectedBindings) => {
          expect(Object.keys(stub.firstCall.args[0])).to.contain.all.members(
            Object.keys(expectedBindings as object)
          );
        })
    );
  });

  it('with keyboard navigation, it should function correctly', () => {
    setupWithSuggestionsAndRecentQueries();
    interceptRedirectionToExampleDotCom();
    SearchBoxSelectors.textArea().type(`${downKeys(1)}{rightArrow}`, delay());

    SearchBoxAssertions.assertHasSuggestionsCountWithoutIt(
      maxRecentQueriesWithoutQuery
    );
    InstantResultsAssertions.assertHasResultCount(numOfInstantResults);

    CommonAssertions.assertAriaLiveMessageWithoutIt(
      SearchBoxSelectors.searchBoxAriaLive,
      maxRecentQueriesWithoutQuery.toString()
    );
    InstantResultsAssertions.assertResultIsSelected(0);

    SearchBoxSelectors.activeQuerySuggestion().should('have.length', 0);

    cy.log('when navigating back from result to query');
    SearchBoxSelectors.textArea().type(
      `${downKeys(2)}{leftArrow}{downArrow}`,
      delay()
    );

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);
    SearchBoxAssertions.assertHasTextWithoutIt('recent query 0');

    cy.log('when navigating to first suggestion and back with up arrow');
    SearchBoxSelectors.textArea().type(`${downKeys(3)}{upArrow}`, delay());
    SearchBoxSelectors.textArea().clear({force: true});

    SearchBoxSelectors.textArea().type(
      'Re{downArrow}{upArrow}{leftArrow}{del}',
      delay()
    );

    SearchBoxAssertions.assertNoSuggestionIsSelected();
    SearchBoxAssertions.assertHasTextWithoutIt('Re');

    cy.log('when navigating with the down arrow only');
    SearchBoxSelectors.textArea().clear({force: true});
    SearchBoxSelectors.textArea().type(downKeys(6), delay());
    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);

    cy.log('when navigating up from results');
    SearchBoxSelectors.textArea().type(`${downKeys(2)}{upArrow}`, delay());
    SearchBoxSelectors.textArea().clear({force: true});

    SearchBoxSelectors.textArea().type('{moveToStart}');

    cy.log('when navigating up from input');
    SearchBoxSelectors.textArea().type('{moveToStart}{upArrow}', delay());

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(2);

    cy.log('when typing when a query is selected');
    SearchBoxSelectors.textArea().type(`${downKeys(1)}{downArrow}`, delay());

    SearchBoxSelectors.textArea().type(`${downKeys(2)}{backspace}`, delay());

    SearchBoxAssertions.assertNoSuggestionIsSelected();

    SearchBoxAssertions.assertHasTextWithoutIt('recent query ');

    cy.wait(1000);
    SearchBoxSelectors.textArea().type(
      `${downKeys(2)}{rightArrow}{enter}`,
      delay()
    );

    cy.wait('@redirectToExampleDotCom');
  });

  it('with mouse navigation, it should function correctly', () => {
    setupWithSuggestionsAndRecentQueries();
    interceptRedirectionToExampleDotCom();

    cy.log('when hovering over a query');
    SearchBoxSelectors.textArea().click();
    SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);
    SearchBoxAssertions.assertHasTextWithoutIt('');

    cy.log('when hovering over an instant result');
    SearchBoxSelectors.textArea().click();
    InstantResultsSelectors.results().eq(1).trigger('mouseover');

    InstantResultsAssertions.assertHasResultCount(4);

    SearchBoxSelectors.activeQuerySuggestion().should('have.length', 0);

    SearchBoxSelectors.textArea().click();
    InstantResultsSelectors.results().eq(1).trigger('mouseover');
    SearchBoxSelectors.querySuggestions().eq(1).trigger('mouseover');

    InstantResultsAssertions.assertHasResultCount(4);
    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(1);

    cy.log('when clicking a result');
    cy.wait(1000);

    InstantResultsSelectors.results().eq(1).trigger('mouseover').click();

    cy.wait('@redirectToExampleDotCom');
  });

  it('should be clickable anywhere on the atomic-result component', () => {
    setupWithSuggestionsAndRecentQueries();
    interceptRedirectionToExampleDotCom();

    cy.log('when hovering over a query');
    SearchBoxSelectors.textArea().click();
    SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);
    SearchBoxAssertions.assertHasTextWithoutIt('');

    cy.log('when hovering over an instant result');
    SearchBoxSelectors.textArea().click();
    InstantResultsSelectors.results().eq(1).trigger('mouseover');

    InstantResultsAssertions.assertHasResultCount(4);

    SearchBoxSelectors.textArea().click();
    InstantResultsSelectors.results().eq(1).trigger('mouseover');
    SearchBoxSelectors.querySuggestions().eq(1).trigger('mouseover');

    InstantResultsAssertions.assertHasResultCount(4);
    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(1);

    cy.log('when clicking a result');
    cy.wait(1000);

    InstantResultsSelectors.results()
      .eq(1)
      .find('atomic-result')
      .trigger('mouseover')
      .click();

    cy.wait('@redirectToExampleDotCom');
  });
});
