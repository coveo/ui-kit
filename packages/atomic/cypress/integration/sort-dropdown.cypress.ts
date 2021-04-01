import {getAnalyticsAt} from '../utils/network';
import {setupPage, shouldRenderErrorComponent} from '../utils/setupComponent';

const sortDropdown = 'atomic-sort-dropdown';
const expressions = [
  'relevancy',
  'date descending',
  'size ascending, date descending',
  'qre',
];

const validDropdownExpressions = `<atomic-sort-expression caption="Relevance" expression="${expressions[0]}"></atomic-sort-expression>
<atomic-sort-expression caption="Most Recent" expression="${expressions[1]}"></atomic-sort-expression>
<atomic-sort-expression caption="Size Date" expression="${expressions[2]}"></atomic-sort-expression>
<atomic-sort-expression caption="QRE" expression="${expressions[3]}"></atomic-sort-expression>`;

describe('Sort Dropdown Component', () => {
  function selectOption(value: string) {
    return cy.get(sortDropdown).shadow().find('select').select(value);
  }

  function setupSortDropdown(slot = validDropdownExpressions) {
    setupPage({
      html: `<atomic-sort-dropdown>${slot}</atomic-sort-dropdown>`,
    });
  }

  it('should load', () => {
    setupSortDropdown();
    cy.get(sortDropdown).should('be.visible');
  });

  it('passes automated accessibility', () => {
    setupSortDropdown();
    cy.checkA11y(sortDropdown);
  });

  it('should display a label', () => {
    setupSortDropdown();
    cy.get(sortDropdown).shadow().find('label').should('exist');
  });

  it('should display the localized string for the option innerHTML', () => {
    setupSortDropdown();
    cy.get(sortDropdown)
      .shadow()
      .find('option[value="relevancy"]')
      .contains('Relevance');
  });

  it('should execute a query with the correct sort order on selection', () => {
    setupPage({
      html: `<atomic-sort-dropdown>${validDropdownExpressions}</atomic-sort-dropdown>`,
    });
    selectOption(expressions[3]);
    cy.wait('@coveoSearch')
      .its('request.body.sortCriteria')
      .should('eq', expressions[3]);
  });

  it('should log the right analytics on selection', async () => {
    setupSortDropdown();
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

  it('should reflect selected sort on URL', () => {
    setupSortDropdown();
    selectOption(expressions[1]);
    const urlHash = `sortCriteria=${encodeURIComponent(expressions[1])}`;
    cy.url().should('include', urlHash);
  });

  describe('when <atomic-sort-dropdown> has no child', () => {
    it('should render an error', () => {
      setupSortDropdown('');
      shouldRenderErrorComponent(sortDropdown);
    });
  });

  describe('when <atomic-sort-expression> is not a child of <atomic-sort-dropdown>', () => {
    it.skip('should render an error', () => {
      setupPage({
        html: `
      <atomic-sort-expression caption="Relevance" criteria="${expressions[0]}"></atomic-sort-expression>
        `,
      });
      shouldRenderErrorComponent(sortDropdown);
    });
  });

  describe('when expression is missing', () => {
    it('should render an error', () => {
      setupSortDropdown(
        '<atomic-sort-expression label="Sort"></atomic-sort-expression>'
      );
      shouldRenderErrorComponent(sortDropdown);
    });
  });

  describe('when expression contains invalid characters', () => {
    it('should render an error', () => {
      setupSortDropdown(
        '<atomic-sort-expression expression="size ascending; date ascending"></atomic-sort-expression>'
      );
      shouldRenderErrorComponent(sortDropdown);
    });
  });

  describe('when sort has no label', () => {
    it.skip('Should display default label when sort has no label');
  });
});
