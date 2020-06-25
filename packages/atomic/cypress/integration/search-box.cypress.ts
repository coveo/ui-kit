import {SearchBoxSelectors, ButtonText} from '../selectors/searchboxSelectors';
import {ResultListSelectors} from '../selectors/resultListSelectors';
import {getApiResponseBody, getUAFetch} from '../utils/network';
import {setUpPage} from '../utils/setupComponent';

const queryText = 'test';
const htmlCode =
  '<atomic-search-box></atomic-search-box><atomic-result-list></atomic-result-list>';

describe('SearchBox Test Suites', () => {
  let polyfill: {};
  beforeEach(() => {
    setUpPage(htmlCode, polyfill);
    cy.wait(500);
    cy.get(SearchBoxSelectors.component)
      .shadow()
      .find('div')
      .first()
      .as('searchBoxFirstDiv');
    cy.get('@searchBoxFirstDiv')
      .find(SearchBoxSelectors.inputBox)
      .as('searchInput');
    cy.get('@searchBoxFirstDiv').contains(ButtonText.search).as('searchBtn');
    cy.get('@searchBoxFirstDiv')
      .find(SearchBoxSelectors.querySuggestionList)
      .as('querySuggestList');
    cy.get(ResultListSelectors.component).shadow().as('resultList');
  });

  it('Searchbox should load', () => {
    cy.get(SearchBoxSelectors.component).should('be.visible');
  });

  it('Searchbox should show query suggestions', async () => {
    cy.get('@searchInput').type(queryText, {force: true});
    cy.wait(500);
    for (let i = 1; i < queryText.length - 1; i++) {
      cy.wait('@coveoQuerySuggest');
    }

    const search = await getApiResponseBody('@coveoQuerySuggest');

    cy.get('@querySuggestList')
      .children()
      .should('have.length', search.completions.length);
  });

  it('Searchbox should execute a query on button click', async () => {
    cy.get('@searchInput').type(queryText, {force: true});
    cy.get('@searchBtn').click();
    cy.get(ResultListSelectors.component).should('be.visible');

    // Search section make sure number of items displays should be same as what returns from api call
    const jsonResponse = await getApiResponseBody('@coveoSearch');

    cy.get('@resultList')
      .children()
      .should('have.length', jsonResponse.results.length);
  });

  it('Searchbox should log UA', async () => {
    cy.get('@searchInput').type(queryText, {force: true});
    cy.get('@searchBtn').click();
    cy.get(ResultListSelectors.component).should('be.visible');

    // UA section make sure that the information sent should contains some context
    const searchUA = {
      actionCause: 'searchboxSubmit',
    };

    const fetchAnalytic = await getUAFetch('@coveoAnalytics');
    expect(fetchAnalytic.status).to.eq(200);
    expect(fetchAnalytic.request.body).to.have.property(
      'actionCause',
      searchUA['actionCause']
    );
  });
});
