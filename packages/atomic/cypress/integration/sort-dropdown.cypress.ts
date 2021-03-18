import {getApiRequestBodyAt, getAnalyticsAt} from '../utils/network';
import {setUpPage, shouldRenderErrorComponent} from '../utils/setupComponent';

const sortDropdown = 'atomic-sort-dropdown';
const expressions = [
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
        <atomic-sort-expression caption="Relevance" expression="${expressions[0]}"></atomic-sort-expression>
        <atomic-sort-expression caption="Most Recent" expression="${expressions[1]}"></atomic-sort-expression>
        <atomic-sort-expression caption="Size Date" expression="${expressions[2]}"></atomic-sort-expression>
        <atomic-sort-expression caption="QRE" expression="${expressions[3]}"></atomic-sort-expression>
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
    selectOption(expressions[1]);

    const request = await getApiRequestBodyAt('@coveoSearch', 1);
    expect(request.sortCriteria).to.be.eq(expressions[1]);
  });

  it('should log the right analytics on selection', async () => {
    selectOption(expressions[1]);

    const analytics = await getAnalyticsAt('@coveoAnalytics', 1);
    expect(analytics.request.body).to.have.property(
      'actionCause',
      'resultsSort'
    );
    expect(analytics.request.body.customData).to.have.property(
      'resultsSortBy',
      expressions[1]
    );
  });

  it('Should reflect selected sort on URL', () => {
    selectOption(expressions[1]);
    const urlHash = `sortCriteria=${encodeURIComponent(expressions[1])}`;
    cy.url().should('include', urlHash);
  });
});

describe('When sort with invalid criteria option', () => {
  it('Should render an error when <atomic-sort-dropdown> has no child', () => {
    setUpPage(`
        <atomic-sort-dropdown>
        </atomic-sort-dropdown>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });

  it.skip('Should render an error when "<atomic-sort-dropdown" is missing', () => {
    setUpPage(`
    <atomic-sort-expression caption="Relevance" criteria="${expressions[0]}"></atomic-sort-expression>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });

  it('Should render an error when expression is missing', () => {
    setUpPage(`
        <atomic-sort-dropdown>
          <atomic-sort-expression label="Sort"></atomic-sort-expression>
        </atomic-sort-dropdown>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });

  it('Should render an error when expression contains invalid characters', () => {
    setUpPage(`
        <atomic-sort-dropdown>
          <atomic-sort-expression expression="size ascending; date ascending"></atomic-sort-expression>
        </atomic-sort-dropdown>
      `);
    shouldRenderErrorComponent(sortDropdown);
  });
});

describe('When sort has no label', () => {
  it('Should display default label');
});
