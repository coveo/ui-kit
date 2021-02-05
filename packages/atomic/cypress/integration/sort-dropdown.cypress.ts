import {getApiRequestBody, getAnalytics} from '../utils/network';
import {setUpPage} from '../utils/setupComponent';

const sortDropdown = 'atomic-sort-dropdown';
const criteria = ['relevancy', 'date descending'];

describe('Sort Dropdown Component', () => {
  function setup(attributes = '') {
    setUpPage(`
      <atomic-sort-dropdown ${attributes}>
        <atomic-sort-criteria caption="relevance" criteria="${criteria[0]}"></atomic-sort-criteria>
        <atomic-sort-criteria caption="mostRecent" criteria="${criteria[1]}"></atomic-sort-criteria>
        <atomic-sort-criteria caption="mostRecent" criteria="size ascending, date descending"></atomic-sort-criteria>
      </atomic-sort-dropdown>
    `);
    cy.wait(500);
  }

  function selectOption(value: string) {
    return cy.get(sortDropdown).shadow().find('select').select(value);
  }

  function shouldRenderErrorComponent() {
    cy.get(sortDropdown)
      .shadow()
      .find('atomic-component-error')
      .should('exist');
  }

  it('should load', () => {
    setup();
    cy.get(sortDropdown).should('be.visible');
  });

  it('passes automated accessibility', () => {
    setup();
    cy.checkA11y(sortDropdown);
  });

  it('should display a label', () => {
    setup();
    cy.get(sortDropdown).shadow().find('label').should('exist');
  });

  it('should display the localized string for the option innerHTML', () => {
    setup();
    cy.get(sortDropdown)
      .shadow()
      .find('option[value="relevancy"]')
      .contains('Relevance');
  });

  it('should execute a query with the correct sort order on selection', async () => {
    setup();
    selectOption(criteria[1]);

    const request = await getApiRequestBody('@coveoSearch');
    expect(request.sortCriteria).to.be.eq(criteria[1]);
  });

  it('should log the right analytics on selection', async () => {
    setup();
    selectOption(criteria[1]);

    const analytics = await getAnalytics('@coveoAnalytics');
    expect(analytics.request.body).to.have.property(
      'actionCause',
      'resultsSort'
    );
    expect(analytics.request.body.customData).to.have.property(
      'resultsSortBy',
      criteria[1]
    );
  });

  it(`when a criteria is not valid
    should render an error`, () => {
    setUpPage(`
      <atomic-sort-dropdown>
        <atomic-sort-criteria</atomic-sort-criteria>
      </atomic-sort-dropdown>
    `);
    cy.wait(500);
    shouldRenderErrorComponent();
  });
});
