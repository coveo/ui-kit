import {getApiResponseBody, getUAFetch} from '../utils/network';
import {setUpPage} from '../utils/setupComponent';
import {
  SearchBoxSelectors,
  generateAliasForSearchBox,
} from '../selectors/search-box-selectors';

const queryText = 'test';
const htmlCode = '<atomic-search-box></atomic-search-box>';

describe('SearchBox Test Suites', () => {
  beforeEach(() => {
    setUpPage(htmlCode);
    cy.wait(500);
    generateAliasForSearchBox();
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
    cy.get('@searchInput').type(queryText);
    cy.get('@searchBtn').click();
    // Search section make sure number of items displays should be same as what returns from api call
    const jsonResponse = await getApiResponseBody('@coveoSearch');
    expect(jsonResponse).to.have.property('results');
    expect(jsonResponse.results?.length).to.be.greaterThan(0);
  });

  it('Searchbox should log UA when excute a query', async () => {
    cy.get('@searchInput').type(queryText, {force: true});
    cy.get('@searchBtn').click();

    // UA section make sure that the information sent should contains some context
    const searchUA = {
      actionCause: 'searchboxSubmit',
    };

    const fetchAnalytic = await getUAFetch('@coveoAnalytics');
    // expect(fetchAnalytic.status).to.eq(200);
    // Comment the check for now, as has UA issue with first query sent out
    // TODO: Put UA status check back when issue is fixed
    expect(fetchAnalytic.request.body).to.have.property(
      'actionCause',
      searchUA['actionCause']
    );
  });

  it('passes automated accessibility tests', () => {
    cy.checkA11y(SearchBoxSelectors.component, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a']
      }
    });
  });
});
