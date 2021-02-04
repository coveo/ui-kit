import {getApiRequestBody} from '../utils/network';
import {setUpPage} from '../utils/setupComponent';

const sortDropdown = 'atomic-sort-dropdown';
const criteria = ['relevancy', 'date descending'];

describe('Sort Dropdown Component', () => {
  function setup(attributes = '') {
    setUpPage(`
      <atomic-sort-dropdown ${attributes}>
        <atomic-sort-criteria caption="relevance" criteria="${criteria[0]}"></atomic-sort-criteria>
        <atomic-sort-criteria caption="mostRecent" criteria="${criteria[1]}"></atomic-sort-criteria>
      </atomic-sort-dropdown>
    `);
    cy.wait(500);
  }

  function selectOption(value: string) {
    return cy.get(sortDropdown).shadow().find('select').select(value);
  }

  it('should load', () => {
    setup();
    cy.get(sortDropdown).should('be.visible');
  });

  it('should execute a query with a different sort order on selection', async () => {
    setup();
    selectOption(criteria[1]);

    const request = await getApiRequestBody('@coveoSearch');
    expect(request.sortCriteria).to.be.eq(criteria[1]);
  });
});
