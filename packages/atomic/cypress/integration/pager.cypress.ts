import {getAnalyticsAt} from '../utils/network';
import {
  setUpPage,
  injectComponent,
  shouldRenderErrorComponent,
} from '../utils/setupComponent';
import {
  createAliasLi,
  createAliasNavigation,
  PagerSelectors,
} from '../selectors/pager-selectors';

describe('Pager Test Suites', () => {
  function setupPager(attributes = '') {
    setUpPage(`<atomic-pager ${attributes}></atomic-pager>`);
    cy.wait(1000);
  }

  function componentLoaded(numberOfPages: number) {
    const totalLi = numberOfPages + 2;
    cy.get('@pagerLi')
      .find('button')
      .contains(numberOfPages.toString())
      .should('be.visible');
    cy.get('@previousButton').should('be.visible');
    cy.get('@nextButton').should('be.visible');
    cy.get('@pagerLi').its('length').should('eq', totalLi);
    cy.checkA11y(PagerSelectors.pager);
  }

  function checkPagerSelected(pageNumber: string, selected: boolean) {
    const isContain = selected ? 'contain' : 'not.contain';
    cy.get('@pagerLi')
      .contains(pageNumber)
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
      createAliasNavigation();
    });

    it('should load and pass automated accessibility', () => {
      componentLoaded(5);
    });

    it('should go to next page and log UA on button next', async () => {
      cy.get('@nextButton').click();
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
      cy.get('@nextButton').click();
      cy.get('@previousButton').click();

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
      cy.get('@pagerLi').contains('3').click();
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
      cy.get('@pagerLi').contains('5').click();
      checkPagerSelected('5', true);
      checkPagerSelected('6', false);
    });
  });

  describe('Pager should load from url', () => {
    it('should activate correct page number', () => {
      cy.visit('http://localhost:3333/pages/test.html#firstResult=20');
      injectComponent('<atomic-pager></atomic-pager>');
      cy.wait(1000);
      createAliasNavigation();
      checkPagerSelected('3', true);
    });
  });

  describe('Option enableNavigationButton', () => {
    it('should load without navigation buttons when when prop is false_boolean', () => {
      setupPager('enable-navigation-buttons=false');
      createAliasLi();
      cy.get('@pagerLi').get(PagerSelectors.buttonNext).should('not.exist');
      cy.get('@pagerLi').get(PagerSelectors.buttonPrevious).should('not.exist');
    });

    it('should load without navigation buttons when prop is "false"_string', () => {
      setupPager('enable-navigation-buttons="false"');
      createAliasLi();
      cy.get('@pagerLi').get(PagerSelectors.buttonNext).should('not.exist');
      cy.get('@pagerLi').get(PagerSelectors.buttonPrevious).should('not.exist');
    });

    it('should fallback to default when prop is invalid', () => {
      setupPager('enable-navigation-buttons="dadaf"');
      createAliasNavigation();
      componentLoaded(5);
    });
  });

  describe('Option numberOfPages ', () => {
    it('should render when prop is a number', () => {
      setupPager('number-of-pages=10');
      createAliasNavigation();
      componentLoaded(10);
    });

    it('should render when prop is a number_string ', () => {
      setupPager('number-of-pages="8"');
      createAliasNavigation();
      componentLoaded(8);
    });

    it('should fallback to number when prop contains number&character', () => {
      setupPager('number-of-pages="9k3"');
      createAliasNavigation();
      componentLoaded(9);
    });

    it('should render an error when the prop is not in the list of numberOfPages', () => {
      setupPager('number-of-pages="-5"');
      shouldRenderErrorComponent(PagerSelectors.pager);
    });
  });
});
