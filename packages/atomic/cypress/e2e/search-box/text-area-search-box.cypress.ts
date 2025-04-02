import {
  SafeStorage,
  StorageItems,
} from '../../../src/utils/local-storage-utils';
import {RouteAlias} from '../../fixtures/fixture-common';
import {TestFixture} from '../../fixtures/test-fixture';
import * as CommonAssertions from '../common-assertions';
import {selectIdleCheckboxValueAt} from '../facets/facet-common-actions';
import * as FacetCommonAssertions from '../facets/facet-common-assertions';
import {addFacet, field} from '../facets/facet/facet-actions';
import {FacetSelectors} from '../facets/facet/facet-selectors';
import {addQuerySummary} from '../query-summary-actions';
import * as QuerySummaryAssertions from '../query-summary-assertions';
import {
  addSearchBox,
  AddSearchBoxOptions,
  typeSearchTextArea,
} from './search-box-actions';
import * as SearchBoxAssertions from './search-box-assertions';
import {searchBoxComponent, SearchBoxSelectors} from './search-box-selectors';

const setSuggestions = (count: number) => () => {
  cy.intercept(
    {method: 'POST', path: '**/rest/search/v2/querySuggest?*'},
    (request) => {
      request.reply((response) => {
        const newResponse = response.body;
        newResponse.completions = Array.from({length: count}, (_, i) => ({
          expression: `query-suggestion-${i}`,
          executableConfidence: 0,
          highlighted: `Suggestion ${i}`,
          score: 0,
        }));
        response.send(200, newResponse);
      });
    }
  ).as(TestFixture.interceptAliases.QuerySuggestions.substring(1));
};

const setRecentQueries = (count: number) => () => {
  new SafeStorage().setJSON(
    StorageItems.RECENT_QUERIES,
    Array.from({length: count}, (_, i) => `recent query ${i}`)
  );
};

const addTextAreaSearchBox = (options: AddSearchBoxOptions = {}) => {
  const textAreaProp = {textarea: 'true'};
  const props = options?.props
    ? {...options.props, ...textAreaProp}
    : textAreaProp;
  return addSearchBox(options ? {...options, props} : {props});
};

describe('TextArea Search Box Test Suites', () => {
  describe('with no suggestions nor recentQueries', () => {
    beforeEach(() => {
      new TestFixture()
        .with(setSuggestions(0))
        .with(setRecentQueries(0))
        .with(addTextAreaSearchBox())
        .init();
    });

    it('should be accessible', () => {
      SearchBoxSelectors.textArea().click();
      CommonAssertions.assertAriaLiveMessage(
        SearchBoxSelectors.searchBoxAriaLive,
        ' no '
      );
      CommonAssertions.assertAccessibility(searchBoxComponent);
    });
  });

  describe('with default textarea search box', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addTextAreaSearchBox())
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
      SearchBoxSelectors.textArea().click();
      SearchBoxSelectors.textArea().type('test{enter}', {force: true});
      cy.wait(RouteAlias.UA);
    });

    it('search button is enabled to start with', () => {
      SearchBoxSelectors.textArea().should('be.empty');
      SearchBoxSelectors.submitButton().should('be.enabled');
    });

    it('should enter a line break when {shift} is held alongside {enter}', () => {
      SearchBoxSelectors.textArea().click();
      SearchBoxSelectors.textArea().type('{shift}{enter}', {
        force: true,
        release: false,
      });
      SearchBoxSelectors.textArea().type('12', {force: true});

      SearchBoxAssertions.assertHasTextWithoutIt(
        'test\n12',
        SearchBoxSelectors.textArea
      );
    });

    CommonAssertions.assertConsoleError(false);
  });

  describe('with disableSearch set to true', () => {
    const testQuery = 'test';
    beforeEach(() => {
      new TestFixture()
        .with(
          addTextAreaSearchBox({
            props: {
              'disable-search': 'true',
              'minimum-query-length': 1, // disable-search should override this setting
            },
          })
        )
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(searchBoxComponent);
    });

    it('there are no search suggestions or errors on query input', () => {
      typeSearchTextArea(testQuery);
      SearchBoxSelectors.submitButton().should('be.disabled');
      SearchBoxAssertions.assertNoSuggestionGenerated();
      QuerySummaryAssertions.assertHasPlaceholder();
      CommonAssertions.assertConsoleError(false);
    });

    it('clear button should appear or disappear depending on the content of the input', () => {
      typeSearchTextArea(testQuery);
      SearchBoxSelectors.clearButton().should('exist');
      typeSearchTextArea(
        Array.from({length: testQuery.length})
          .map(() => '{backspace}')
          .join('')
      );
      SearchBoxSelectors.clearButton().should('not.exist');
    });
  });

  describe('with a facet & clear-filters set to false', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addTextAreaSearchBox({props: {'clear-filters': 'false'}}))
        .with(addFacet({field}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      cy.wait(TestFixture.interceptAliases.Search);
      SearchBoxSelectors.submitButton().click({force: true});
      cy.wait(TestFixture.interceptAliases.Search);
    });

    FacetCommonAssertions.assertNumberOfSelectedCheckboxValues(
      FacetSelectors,
      1
    );
  });

  describe('with a facet & clear-filters set to true', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addTextAreaSearchBox({props: {'clear-filters': 'true'}}))
        .with(addFacet({field}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      cy.wait(TestFixture.interceptAliases.Search);
      SearchBoxSelectors.submitButton().click({force: true});
      cy.wait(TestFixture.interceptAliases.Search);
    });

    FacetCommonAssertions.assertNumberOfSelectedCheckboxValues(
      FacetSelectors,
      0
    );
  });
});
