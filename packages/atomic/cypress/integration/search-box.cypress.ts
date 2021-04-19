import {getApiResponseBody, getAnalyticsAt} from '../utils/network';
import {TestFixture} from '../fixtures/test-fixture';
import {addSearchBox, searchBoxAlias} from '../fixtures/test-fixture-searchbox';
import {SearchBoxSelectors} from './search-box-selectors';

const queryText = 't';

describe('Search Box Test Suites', () => {
  function testLoad() {
    cy.get(SearchBoxSelectors.component).should('be.visible');
    cy.get('@searchBoxFirstDiv').find('.search-input').should('be.visible');
    cy.get('@searchBoxFirstDiv').find('.submit-button').should('be.visible');
    cy.get('@searchBoxFirstDiv').find('.clear-button').should('not.exist');
  }

  async function testQuerySuggestionsShown(numberOfSuggestions: number) {
    cy.get('@searchBoxFirstDiv')
      .find('.search-input')
      .type(queryText, {force: true});
    for (let i = 1; i < queryText.length - 1; i++) {
      cy.wait('@coveoQuerySuggest');
    }

    await getApiResponseBody('@coveoQuerySuggest');

    cy.get('@searchBoxFirstDiv')
      .find(SearchBoxSelectors.querySuggestionList)
      .children()
      .should('have.length', numberOfSuggestions);
  }

  describe('default search box', () => {
    beforeEach(() => {
      new TestFixture().with(addSearchBox()).withAlias(searchBoxAlias()).init();
    });

    it('should load', () => {
      testLoad();
    });

    it('should show query suggestions', () => {
      testQuerySuggestionsShown(5);
    });

    it('should execute a query on button click', async () => {
      cy.get('@searchBoxFirstDiv').find('.search-input').type(queryText);
      cy.get('@searchBoxFirstDiv').find('.submit-button').click();

      const jsonResponse = await getApiResponseBody('@coveoSearch');
      expect(jsonResponse).to.have.property('results');
      expect(jsonResponse.results?.length).to.be.eq(10);
    });

    it('should execute a query on enter press', async () => {
      cy.get('@searchBoxFirstDiv')
        .find('.search-input')
        .type(queryText + '{enter}');

      const jsonResponse = await getApiResponseBody('@coveoSearch');
      expect(jsonResponse).to.have.property('results');
      expect(jsonResponse.results?.length).to.be.eq(10);
    });

    it('should clear query on clear button click', async () => {
      cy.get('@searchBoxFirstDiv').find('.search-input').type(queryText);
      cy.get('button').find('.clear').click();
      cy.get('@searchBoxFirstDiv').find('.search-input').should('be.empty');
    });

    it('should log UA when excute a query', async () => {
      cy.get('@searchBoxFirstDiv')
        .find('.search-input')
        .type(queryText, {force: true});
      cy.get('@searchBoxFirstDiv').find('.submit-button').click();

      const searchUA = {
        actionCause: 'searchboxSubmit',
      };

      const analytics = await getAnalyticsAt('@coveoAnalytics', 1);
      expect(analytics.response.statusCode).to.eq(200);
      expect(analytics.request.body).to.have.property(
        'actionCause',
        searchUA['actionCause']
      );
    });

    it('passes automated accessibility tests with no query', () => {
      cy.checkA11y(SearchBoxSelectors.component);
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.search-input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });

  describe('search box with number of values set to 3', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({'number-of-suggestions': '3'}))
        .withAlias(searchBoxAlias())
        .init();
    });

    it('should load', () => {
      testLoad();
    });

    it('should show query suggestions', async () => {
      await testQuerySuggestionsShown(3);
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.search-input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });

  describe('search box with number of values set to 0', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({'number-of-suggestions': '0'}))
        .withAlias(searchBoxAlias())
        .init();
    });

    it('should load', () => {
      testLoad();
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.search-input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });

  describe('search box with leading submit button', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({'leading-submit-button': 'true'}))
        .withAlias(searchBoxAlias())
        .init();
    });

    it('should load', () => {
      testLoad();
    });

    it('should execute a query on button click', async () => {
      cy.get('@searchBoxFirstDiv').find('.search-input').type(queryText);
      cy.get('@searchBoxFirstDiv').find('.submit-button').click();

      const jsonResponse = await getApiResponseBody('@coveoSearch');
      expect(jsonResponse).to.have.property('results');
      expect(jsonResponse.results?.length).to.be.eq(10);
    });

    it('passes automated accessibility tests with no query', () => {
      cy.checkA11y(SearchBoxSelectors.component);
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.search-input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });
});
