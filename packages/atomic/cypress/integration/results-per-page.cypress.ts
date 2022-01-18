import {getApiResponseBodyAt, getAnalyticsAt} from '../utils/network';
import {setUpPage, shouldRenderErrorComponent} from '../utils/setupComponent';
import {
  resultsPerPageComponent,
  ResultsPerPageSelectors,
} from './results-per-page-selectors';

describe('Result Per Page Component', () => {
  function setup(attributes = '') {
    setUpPage(
      `<atomic-results-per-page ${attributes}></atomic-results-per-page>`
    );
  }

  function clickButton(position: number) {
    return ResultsPerPageSelectors.buttons().eq(position).click();
  }

  it('should load', () => {
    setup();
    cy.get(resultsPerPageComponent).should('be.visible');
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
    cy.checkA11y(resultsPerPageComponent);
  });

  describe('choicesDisplayed option', () => {
    it(`when the prop is not of the right type/format
    should render an error`, () => {
      setup('choices-displayed="hello"');
      shouldRenderErrorComponent(resultsPerPageComponent);
    });

    it('should render the choices in the component', () => {
      setup('choices-displayed="10,13"');
      ResultsPerPageSelectors.buttons().eq(1).should('have.value', 13);
    });
  });

  describe('initialChoice option', () => {
    it(`when the prop is not valid
    should render an error`, () => {
      setup('initial-choice=-1');
      shouldRenderErrorComponent(resultsPerPageComponent);
    });

    it(`when the prop is not in the list of choicesDisplayed
    should render an error`, () => {
      setup('initial-choice=59');
      shouldRenderErrorComponent(resultsPerPageComponent);
    });

    it('should select the initialChoice correctly', () => {
      setup('initial-choice=25');
      ResultsPerPageSelectors.activeButton().should('have.value', 25);
    });
  });
});
