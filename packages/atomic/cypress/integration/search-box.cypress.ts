import {getApiResponseBody, getUAFetch} from '../utils/network';
import {setUpPage} from '../utils/setupComponent';
import {
  SearchBoxSelectors,
  generateAliasForSearchBox,
} from '../selectors/search-box-selectors';

const queryText = 'test';

describe('Search Box Test Suites', () => {
  function testLoad() {
    cy.get(SearchBoxSelectors.component).should('be.visible');
    cy.get('@searchBoxFirstDiv').find('.input').should('be.visible');
    cy.get('@searchBoxFirstDiv').find('.submit-button').should('be.visible');
    cy.get('@searchBoxFirstDiv').find('.clear-button').should('not.exist');
  }

  async function testQuerySuggestionsShown(numberOfSuggestions: number) {
    cy.get('@searchBoxFirstDiv').find('.input').type(queryText, {force: true});
    cy.wait(500);
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
    const htmlCode = '<atomic-search-box></atomic-search-box>';
    beforeEach(() => {
      setUpPage(htmlCode);
      cy.wait(500);
      generateAliasForSearchBox();
    });

    it('should load', () => {
      testLoad();
    });

    it('should show query suggestions', async () => {
      await testQuerySuggestionsShown(5);
    });

    it('should execute a query on button click', async () => {
      cy.get('@searchBoxFirstDiv').find('.input').type(queryText);
      cy.get('@searchBoxFirstDiv').find('.submit-button').click();

      const jsonResponse = await getApiResponseBody('@coveoSearch');
      expect(jsonResponse).to.have.property('results');
      expect(jsonResponse.results?.length).to.be.eq(10);
    });

    it('should execute a query on enter press', async () => {
      cy.get('@searchBoxFirstDiv')
        .find('.input')
        .type(queryText + '{enter}');

      const jsonResponse = await getApiResponseBody('@coveoSearch');
      expect(jsonResponse).to.have.property('results');
      expect(jsonResponse.results?.length).to.be.eq(10);
    });

    it('should clear query on clear button click', async () => {
      cy.get('@searchBoxFirstDiv').find('.input').type(queryText);
      cy.get('button').find('.clear').click();
      cy.get('@searchBoxFirstDiv').find('.input').should('be.empty');
    });

    it('should log UA when excute a query', async () => {
      cy.get('@searchBoxFirstDiv')
        .find('.input')
        .type(queryText, {force: true});
      cy.get('@searchBoxFirstDiv').find('.submit-button').click();

      const searchUA = {
        actionCause: 'searchboxSubmit',
      };

      const fetchAnalytic = await getUAFetch('@coveoAnalytics');
      console.log(fetchAnalytic);
      expect(fetchAnalytic.response.statusCode).to.eq(200);
      expect(fetchAnalytic.request.body).to.have.property(
        'actionCause',
        searchUA['actionCause']
      );
    });

    it('passes automated accessibility tests with no query', () => {
      cy.checkA11y(SearchBoxSelectors.component);
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });

  describe('search box with number of values set to 3', () => {
    const htmlCode =
      '<atomic-search-box number-of-suggestions="3"></atomic-search-box>';
    beforeEach(() => {
      setUpPage(htmlCode);
      cy.wait(500);
      generateAliasForSearchBox();
    });

    it('should load', () => {
      testLoad();
    });

    it('should show query suggestions', async () => {
      await testQuerySuggestionsShown(3);
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });

  describe('search box with number of values set to 0', () => {
    const htmlCode =
      '<atomic-search-box number-of-suggestions="0"></atomic-search-box>';
    beforeEach(() => {
      setUpPage(htmlCode);
      cy.wait(500);
      generateAliasForSearchBox();
    });

    it('should load', () => {
      testLoad();
    });

    it('passes automated accessibility tests with a query', () => {
      cy.get('@searchBoxFirstDiv')
        .find('.input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });

  describe('search box with leading submit button', () => {
    const htmlCode =
      '<atomic-search-box leading-submit-button></atomic-search-box>';
    beforeEach(() => {
      setUpPage(htmlCode);
      cy.wait(500);
      generateAliasForSearchBox();
    });

    it('should load', () => {
      testLoad();
    });

    it('should execute a query on button click', async () => {
      cy.get('@searchBoxFirstDiv').find('.input').type(queryText);
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
        .find('.input')
        .type(queryText, {force: true});
      cy.checkA11y(SearchBoxSelectors.component);
    });
  });
});
