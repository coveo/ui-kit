import {getApiResponseBodyAt, getAnalyticsAt} from '../utils/network';
import {setUpPage, shouldRenderErrorComponent} from '../utils/setupComponent';

const resultPerPage = 'atomic-results-per-page';

describe('Result Per Page Component', () => {
  function setup(attributes = '') {
    setUpPage(
      `<atomic-results-per-page ${attributes}></atomic-results-per-page>`
    );
    cy.wait(500);
  }

  function clickButton(position: number) {
    return cy.get(resultPerPage).shadow().find('button').eq(position).click();
  }

  it('should load', () => {
    setup();
    cy.get(resultPerPage).should('be.visible');
  });

  it('should execute a query with a different number of results on button click', async () => {
    setup();
    clickButton(1);
    const jsonResponse = await getApiResponseBodyAt('@coveoSearch', 1);
    expect(jsonResponse).to.have.property('results');
    expect(jsonResponse.results.length).to.be.eq(25);
  });

  it('should log the right analytics on button click', async () => {
    setup();
    clickButton(1);
    const analytics = await getAnalyticsAt('@coveoAnalytics', 1);

    expect(analytics.request.body).to.have.property(
      'eventValue',
      'pagerResize'
    );
  });

  it('passes automated accessibility', () => {
    setup();
    cy.checkA11y(resultPerPage);
  });

  describe('choicesDisplayed option', () => {
    it(`when the prop is not of the right type/format
    should render an error`, () => {
      setup('choices-displayed="hello"');
      shouldRenderErrorComponent(resultPerPage);
    });

    it('should render the choices in the component', () => {
      setup('choices-displayed="10,13"');
      cy.get(resultPerPage).shadow().find('button').eq(1).contains(13);
    });
  });

  describe('initialChoice option', () => {
    it(`when the prop is not valid
    should render an error`, () => {
      setup('initial-choice=-1');
      shouldRenderErrorComponent(resultPerPage);
    });

    it(`when the prop is not in the list of choicesDisplayed
    should render an error`, () => {
      setup('initial-choice=59');
      shouldRenderErrorComponent(resultPerPage);
    });

    it('should select the initialChoice correctly', () => {
      setup('initial-choice=25');
      cy.get(resultPerPage)
        .shadow()
        .find('button')
        .eq(1)
        .should('have.attr', 'aria-checked', 'true');
    });
  });
});
