import {getAnalyticsAt} from '../utils/network';
import {
  setUpPage,
  injectComponent,
  shouldRenderErrorComponent,
  buildTestUrl,
} from '../utils/setupComponent';
import {pagerComponent, PagerSelectors} from './pager-selectors';
import * as PagerAssertions from './pager-assertions';
import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';

describe('Pager Test Suites', () => {
  function setupPager(attributes = '') {
    setUpPage(`<atomic-pager ${attributes}></atomic-pager>`);
  }

  function componentLoaded(numberOfPages: number) {
    PagerSelectors.pager().should('be.visible');
    PagerSelectors.pageButton(numberOfPages).should('be.visible');
    PagerSelectors.buttonPrevious().should('be.visible');
    PagerSelectors.buttonNext().should('be.visible');
    PagerSelectors.pageButtons().its('length').should('eq', numberOfPages);
    cy.checkA11y(pagerComponent);
  }

  function checkPagerSelected(pageNumber: string, selected: boolean) {
    const isContain = selected ? 'contain' : 'not.contain';
    PagerSelectors.pageButton(pageNumber)
      .should('have.attr', 'part')
      .and(isContain, 'active-page-button');
  }

  function validateUrlhash(page: number) {
    const firstResult = (page - 1) * 10;
    const urlHash =
      firstResult === 0
        ? cy.url().should('not.include', '#firstResult')
        : cy.url().should('include', `#firstResult=${firstResult}`);
    return urlHash;
  }

  describe('Default Pager', () => {
    beforeEach(() => {
      setupPager();
    });

    it('should load and pass automated accessibility', () => {
      componentLoaded(5);
    });

    it('should go to next page and log UA on button next', async () => {
      PagerSelectors.buttonNext().click();
      checkPagerSelected('2', true);
      checkPagerSelected('1', false);
      validateUrlhash(2);

      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 1)).request
        .body;
      expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
      expect(analyticsBody).to.have.property('eventValue', 'pagerNext');
      expect(analyticsBody.customData).to.have.property('pagerNumber', 2);
    });

    it('should go to previous page and log UA on button previous', async () => {
      PagerSelectors.buttonNext().click();
      PagerSelectors.buttonPrevious().click();

      checkPagerSelected('1', true);
      checkPagerSelected('2', false);
      validateUrlhash(1);

      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 2)).request
        .body;
      expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
      expect(analyticsBody).to.have.property('eventValue', 'pagerPrevious');
      expect(analyticsBody.customData).to.have.property('pagerNumber', 1);
    });

    it('should go to page 3 and log UA on button Pager', async () => {
      PagerSelectors.pageButton(3).click();
      checkPagerSelected('3', true);
      checkPagerSelected('1', false);
      validateUrlhash(3);

      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 1)).request
        .body;
      expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
      expect(analyticsBody).to.have.property('eventValue', 'pagerNumber');
      expect(analyticsBody.customData).to.have.property('pagerNumber', 3);
    });

    it('should load more numbers when click 5', () => {
      PagerSelectors.pageButton(5).click();
      checkPagerSelected('5', true);
      checkPagerSelected('6', false);
    });
  });

  describe('when selecting page 5', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(pagerComponent))
        .init();
      PagerSelectors.pageButton(5).click();
      cy.wait(TestFixture.interceptAliases.Search);
    });

    PagerAssertions.assertFocusActivePage();
  });

  describe('Pager should load from url', () => {
    it('should activate correct page number', async () => {
      cy.visit(buildTestUrl('firstResult=20'));
      injectComponent('<atomic-pager></atomic-pager>');
      cy.wait(1000);
      PagerSelectors.pager().should('be.visible');
      checkPagerSelected('3', true);
    });
  });

  describe('Option numberOfPages ', () => {
    it('should render when prop is a number', () => {
      setupPager('number-of-pages=10');
      componentLoaded(10);
    });

    it('should render when prop is a number_string ', () => {
      setupPager('number-of-pages="8"');
      componentLoaded(8);
    });

    it('should fallback to number when prop contains number&character', () => {
      setupPager('number-of-pages="9k3"');
      componentLoaded(9);
    });

    it('should render an error when the prop is not in the list of numberOfPages', () => {
      setupPager('number-of-pages="-5"');
      shouldRenderErrorComponent(pagerComponent);
    });
  });
});
