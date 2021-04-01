import {getAnalyticsAt} from '../utils/network';
import {setupPage, shouldRenderErrorComponent} from '../utils/setupComponent';

const resultPerPage = 'atomic-results-per-page';

describe('Result Per Page Component', () => {
  function setupResultPerPage(attributes = '') {
    setupPage({
      html: `<atomic-results-per-page ${attributes}></atomic-results-per-page>`,
    });
  }

  function clickButton(position: number) {
    return cy.get(resultPerPage).shadow().find('button').eq(position).click();
  }

  it('should load', () => {
    setupResultPerPage();
    cy.get(resultPerPage).should('be.visible');
  });

  it('should execute a query with a different number of results on button click', () => {
    setupResultPerPage();
    clickButton(1);
    cy.wait('@coveoSearch')
      .its('response.body.results')
      .should('have.length', 25);
  });

  it('should log the right analytics on button click', async () => {
    setupResultPerPage();
    clickButton(1);
    const analytics = await getAnalyticsAt('@coveoAnalytics', 1);

    expect(analytics.request.body).to.have.property(
      'eventValue',
      'pagerResize'
    );
  });

  it('passes automated accessibility', () => {
    setupResultPerPage();
    cy.checkA11y(resultPerPage);
  });

  describe('choicesDisplayed option', () => {
    it(`when the prop is not of the right type/format
    should render an error`, () => {
      setupResultPerPage('choices-displayed="hello"');
      shouldRenderErrorComponent(resultPerPage);
    });

    it('should render the choices in the component', () => {
      setupResultPerPage('choices-displayed="10,13"');
      cy.get(resultPerPage).shadow().find('button').eq(1).contains(13);
    });
  });

  describe('initialChoice option', () => {
    it(`when the prop is not valid
    should render an error`, () => {
      setupResultPerPage('initial-choice=-1');
      shouldRenderErrorComponent(resultPerPage);
    });

    it(`when the prop is not in the list of choicesDisplayed
    should render an error`, () => {
      setupResultPerPage('initial-choice=59');
      shouldRenderErrorComponent(resultPerPage);
    });

    it('should select the initialChoice correctly', () => {
      setupResultPerPage('initial-choice=25');
      cy.get(resultPerPage)
        .shadow()
        .find('button')
        .eq(1)
        .should('have.attr', 'aria-checked', 'true');
    });
  });
});
