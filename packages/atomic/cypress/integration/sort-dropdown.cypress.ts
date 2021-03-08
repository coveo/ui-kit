import {getApiRequestBodyAt, getAnalyticsAt} from '../utils/network';
import {setUpPage, shouldRenderErrorComponent} from '../utils/setupComponent';

const sortDropdown = 'atomic-sort-dropdown';
const criteria = [
  'relevancy',
  'date descending',
  'size ascending, date descending',
  'qre',
];

function selectOption(value: string) {
  return cy.get(sortDropdown).shadow().find('select').select(value);
}

describe('Sort Dropdown Component', () => {
  function setup(attributes = '') {
    setUpPage(`
      <atomic-sort-dropdown ${attributes}>
        <atomic-sort-criteria caption="Relevance" criteria="${criteria[0]}"></atomic-sort-criteria>
        <atomic-sort-criteria caption="Most Recent" criteria="${criteria[1]}"></atomic-sort-criteria>
        <atomic-sort-criteria caption="Size Date" criteria="${criteria[2]}"></atomic-sort-criteria>
        <atomic-sort-criteria caption="QRE" criteria="${criteria[3]}"></atomic-sort-criteria>
      </atomic-sort-dropdown>
    `);
  }
  beforeEach(() => {
    setup();
  });
  it('should load', () => {
    cy.get(sortDropdown).should('be.visible');
  });

  it('passes automated accessibility', () => {
    cy.checkA11y(sortDropdown);
  });

  it('should display a label', () => {
    cy.get(sortDropdown).shadow().find('label').should('exist');
  });

  it('should display the localized string for the option innerHTML', () => {
    cy.get(sortDropdown)
      .shadow()
      .find('option[value="relevancy"]')
      .contains('Relevance');
  });

  it('should execute a query with the correct sort order on selection', async () => {
    selectOption(criteria[1]);

    const request = await getApiRequestBodyAt('@coveoSearch', 1);
    expect(request.sortCriteria).to.be.eq(criteria[1]);
  });

  it('should log the right analytics on selection', async () => {
    selectOption(criteria[1]);

    const analytics = await getAnalyticsAt('@coveoAnalytics', 1);
    expect(analytics.request.body).to.have.property(
      'actionCause',
      'resultsSort'
    );
    expect(analytics.request.body.customData).to.have.property(
      'resultsSortBy',
      criteria[1]
    );
  });

  it('Should reflect selected sort on URL', () => {
    selectOption(criteria[1]);
    const urlHash = `sortCriteria=${encodeURIComponent(criteria[1])}`;
    cy.url().should('include', urlHash);
  });
});

describe('When sort with invalid criteria option', () => {
  it('Should render an error when <atomic-sort-criteria> is invalid', () => {
    setUpPage(`
        <atomic-sort-dropdown>
          <atomic-sort-criteria</atomic-sort-criteria>
        </atomic-sort-dropdown>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });

  it('Should render an error when criteria is missing', () => {
    setUpPage(`
        <atomic-sort-dropdown>
          <atomic-sort-criteria label="Sort"></atomic-sort-criteria>
        </atomic-sort-dropdown>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });

  it('Should render an error when criteria contains invalid character', () => {
    setUpPage(`
        <atomic-sort-dropdown>
          <atomic-sort-criteria criteria="size ascending; date ascending"></atomic-sort-criteria>
        </atomic-sort-dropdown>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });
});

describe('When sort has no label', () => {
  it('Should display default label');
});
