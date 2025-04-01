import {TestFixture, generateComponentHTML} from '../fixtures/test-fixture';
import {getAnalyticsAt} from '../utils/network';
import * as CommonAssertions from './common-assertions';
import {noResultsComponent, NoResultsSelectors} from './no-results-selectors';
import {addSearchBox} from './search-box/search-box-actions';
import {SearchBoxSelectors} from './search-box/search-box-selectors';

// cSpell:ignore gahaiusdhgaiuewjfsf, asiufasfgasiufhsaiufgsa

describe('No Results Test Suites', () => {
  const wait = 1000;
  let env: TestFixture;

  beforeEach(() => {
    env = new TestFixture()
      .with(addSearchBox())
      .withElement(generateComponentHTML(noResultsComponent));
  });

  describe('when there are results', () => {
    beforeEach(() => {
      env.init();
    });

    it('should not be visible', () => {
      cy.get(noResultsComponent).should('not.be.visible');
    });
  });

  describe('when there are no results', () => {
    beforeEach(() => {
      env.withHash('q=gahaiusdhgaiuewjfsf').init();
    });

    CommonAssertions.assertAriaLiveMessage(
      NoResultsSelectors.ariaLive,
      "couldn't find anything"
    );

    it('should be visible', () => {
      cy.get(noResultsComponent).should('be.visible');
    });

    it('text content should match', () => {
      cy.get(noResultsComponent)
        .shadow()
        .find('[part="no-results"] [part="highlight"]')
        .should('contain.text', 'gahaiusdhgaiuewjfsf');
    });
  });

  describe('when it changes from no results to results', () => {
    beforeEach(() => {
      env.withHash('q=gahaiusdhgaiuewjfsf').init();
      cy.url().then((urlValue) => {
        cy.visit(urlValue.replace('q=gahaiusdhgaiuewjfsf', 'q=test'));
      });
    });

    CommonAssertions.assertAriaLiveMessage(NoResultsSelectors.ariaLive, '');
  });

  describe('when the query contains HTML characters', () => {
    beforeEach(() => {
      env.withHash('q=<div>$@#()-^!gahaiusdhgaiuewjfsf</div>').init();
    });

    it('text content should match', () => {
      cy.get(noResultsComponent)
        .shadow()
        .find('[part="no-results"] [part="highlight"]')
        .should('contain.text', '<div>$@#()-^!gahaiusdhgaiuewjfsf</div>');
    });
  });

  it('cancel button should not be visible when there is no history', () => {
    env.withHash('q=gahaiusdhgaiuewjfsf').init();
    cy.get(noResultsComponent).shadow().get('button').should('not.exist');
  });

  function submitNoResultsSearch() {
    SearchBoxSelectors.textArea().type('asiufasfgasiufhsaiufgsa');
    SearchBoxSelectors.submitButton().click();
    cy.wait(wait);
  }

  it('cancel button should be visible when there is history', () => {
    env.init();
    submitNoResultsSearch();
    cy.get(noResultsComponent).shadow().find('button').should('be.visible');
  });

  it('clicking on cancel should go back in history and hide the atomic-no-results component', () => {
    env.init();
    submitNoResultsSearch();
    cy.get(noResultsComponent).shadow().find('button').click();
    cy.wait(wait);
    cy.get(noResultsComponent).should('not.be.visible');
  });

  it('clicking on cancel should log proper analytics', async () => {
    env.init();
    submitNoResultsSearch();
    cy.get(noResultsComponent).shadow().find('button').click();
    const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 1)).request
      .body;
    expect(analyticsBody).to.have.property('actionCause', 'noResultsBack');
  });
});
