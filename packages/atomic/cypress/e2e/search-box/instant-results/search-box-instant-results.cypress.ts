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

    SearchBoxSelectors.inputBox().type(`${downKeys(2)}`, delay());
    InstantResultsSelectors.results()
      .find(resultTextComponent, {includeShadowDom: true})
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
        .then(([searchInterface]) => initializeBindings(searchInterface))
        .then((expectedBindings) => {
          expect(Object.keys(stub.firstCall.args[0])).to.contain.all.members(
            Object.keys(expectedBindings)
          );
        })
    );
  });

  it('with keyboard navigation, it should function correctly', () => {
    setupWithSuggestionsAndRecentQueries();
    interceptRedirectionToExampleDotCom();
    SearchBoxSelectors.inputBox().type(`${downKeys(1)}{rightArrow}`, delay());

    SearchBoxAssertions.assertHasSuggestionsCountWithoutIt(
      maxRecentQueriesWithoutQuery
    );
    InstantResultsAssertions.assertHasResultCount(numOfInstantResults);

    /*CommonAssertions.assertAriaLiveMessageWithoutIt(
      SearchBoxSelectors.searchBoxAriaLive,
      maxRecentQueriesWithoutQuery.toString()
    );*/
    InstantResultsAssertions.assertResultIsSelected(0);

    SearchBoxSelectors.activeQuerySuggestion().should('have.length', 0);

    cy.log('when navigating back from result to query');
    SearchBoxSelectors.inputBox().type(
      `${downKeys(2)}{leftArrow}{downArrow}`,
      delay()
    );

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);
    SearchBoxAssertions.assertHasTextWithoutIt('Recent query 0');

    cy.log('when navigating to first suggestion and back with up arrow');
    SearchBoxSelectors.inputBox().type(`${downKeys(3)}{upArrow}`, delay());
    SearchBoxSelectors.inputBox().clear({force: true});

    SearchBoxSelectors.inputBox().type(
      'Rec{downArrow}{upArrow}{leftArrow}{del}',
      delay()
    );

    SearchBoxAssertions.assertNoSuggestionIsSelected();
    SearchBoxAssertions.assertHasTextWithoutIt('Re');

    cy.log('when navigating with the down arrow only');
    SearchBoxSelectors.inputBox().clear({force: true});
    SearchBoxSelectors.inputBox().type(downKeys(6), delay());
    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);

    cy.log('when navigating up from results');
    SearchBoxSelectors.inputBox().type(`${downKeys(2)}{upArrow}`, delay());
    SearchBoxSelectors.inputBox().clear({force: true});

    SearchBoxSelectors.inputBox().type('{moveToStart}');

    cy.log('when navigating up from input');
    SearchBoxSelectors.inputBox().type('{moveToStart}{upArrow}', delay());

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(2);

    cy.log('when typing when a query is selected');
    SearchBoxSelectors.inputBox().type(`${downKeys(1)}{downArrow}`, delay());

    SearchBoxSelectors.inputBox().type(`${downKeys(2)}{backspace}`, delay());

    SearchBoxAssertions.assertNoSuggestionIsSelected();

    SearchBoxAssertions.assertHasTextWithoutIt('Recent query ');

    cy.wait(1000);
    SearchBoxSelectors.inputBox().type(
      `${downKeys(2)}{rightArrow}{enter}`,
      delay()
    );

    cy.wait('@redirectToExampleDotCom');
  });

  it('with mouse navigation, it should function correctly', () => {
    setupWithSuggestionsAndRecentQueries();
    interceptRedirectionToExampleDotCom();

    cy.log('when hovering over a query');
    SearchBoxSelectors.inputBox().click();
    SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);
    SearchBoxAssertions.assertHasTextWithoutIt('');

    cy.log('when hovering over an instant result');
    SearchBoxSelectors.inputBox().click();
    InstantResultsSelectors.results().eq(1).trigger('mouseover');

    InstantResultsAssertions.assertHasResultCount(4);

    SearchBoxSelectors.activeQuerySuggestion().should('have.length', 0);

    SearchBoxSelectors.inputBox().click();
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
    SearchBoxSelectors.inputBox().click();
    SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');

    SearchBoxAssertions.assertSuggestionIsSelectedWithoutIt(0);
    SearchBoxAssertions.assertHasTextWithoutIt('');

    cy.log('when hovering over an instant result');
    SearchBoxSelectors.inputBox().click();
    InstantResultsSelectors.results().eq(1).trigger('mouseover');

    InstantResultsAssertions.assertHasResultCount(4);

    SearchBoxSelectors.inputBox().click();
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
