import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {
  addPager,
  pressPagerNext,
  pressPagerNumber,
  pressPagerPrevious,
} from './pager-actions';
import * as PagerAssertions from './pager-assertions';
import {pagerComponent, PagerSelectors} from './pager-selectors';

describe('Pager Test Suites', () => {
  describe('Default Pager', () => {
    function setupDefaultPager() {
      new TestFixture().with(addPager()).init();
    }

    describe('without pressing on anything', () => {
      beforeEach(() => {
        setupDefaultPager();
      });
      PagerAssertions.assertRenderPager(5);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('on button next', () => {
      beforeEach(() => {
        setupDefaultPager();
        pressPagerNext();
      });

      PagerAssertions.assertLogPagerNext(2);
      PagerAssertions.assertPagerSelected('2', true);
      PagerAssertions.assertPagerSelected('1', false);
      PagerAssertions.assertPageInHash(2);

      it('should include analytics in the v2 call', async () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
          expect(firstSearch.request.body).to.have.property('analytics');
          expect(firstSearch.request.body.analytics).to.have.property(
            'actionCause',
            'pagerNext'
          );
          expect(
            firstSearch.request.body.analytics.customData
          ).to.have.property('pagerNumber', 2);
        });
      });
    });

    describe('on button previous', () => {
      beforeEach(() => {
        setupDefaultPager();
        pressPagerNext();
        pressPagerPrevious();
      });

      PagerAssertions.assertLogPagerPrevious(1);
      PagerAssertions.assertPagerSelected('1', true);
      PagerAssertions.assertPagerSelected('2', false);
      PagerAssertions.assertPageInHash(1);
    });

    describe('on button Pager', () => {
      beforeEach(() => {
        setupDefaultPager();
        pressPagerNumber(3);
      });

      PagerAssertions.assertLogPagerNumber(3);
      PagerAssertions.assertPagerSelected('3', true);
      PagerAssertions.assertPagerSelected('1', false);
      PagerAssertions.assertPageInHash(3);
    });

    describe('on click 5', () => {
      beforeEach(() => {
        setupDefaultPager();
        pressPagerNumber(5);
      });

      PagerAssertions.assertPagerSelected('6', false);
    });
  });

  describe('Pager should load from url', () => {
    beforeEach(() => {
      new TestFixture().with(addPager()).withHash('firstResult=20').init();
    });

    PagerAssertions.assertPagerSelected('3', true);
  });

  describe('Option numberOfPages', () => {
    describe('when prop is a number', () => {
      beforeEach(() => {
        new TestFixture().with(addPager({'number-of-pages': 10})).init();
      });

      PagerAssertions.assertRenderPager(10);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('when prop is a number_string ', () => {
      beforeEach(() => {
        new TestFixture().with(addPager({'number-of-pages': '8'})).init();
      });

      PagerAssertions.assertRenderPager(8);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('when prop contains number&character', () => {
      beforeEach(() => {
        new TestFixture().with(addPager({'number-of-pages': '9k3'})).init();
      });

      PagerAssertions.assertRenderPager(9);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('when the prop is not in the list of numberOfPages', () => {
      beforeEach(() => {
        new TestFixture().with(addPager({'number-of-pages': '-5'})).init();
      });

      CommonAssertions.assertContainsComponentError(PagerSelectors, true);
    });
  });

  describe('Should expose shadow parts for', () => {
    beforeEach(() => {
      new TestFixture().with(addPager()).init();
    });

    const buttonIcons: [string, number][] = [
      // Button selector, Expected page num after click
      ['buttonIconNext', 2],
      ['buttonIconPrevious', 1],
    ];

    for (const [buttonIconSelector, expectedPageNum] of buttonIcons) {
      it(`${buttonIconSelector}`, () => {
        PagerAssertions.assertPagerSelected(`${expectedPageNum}`, false);
        // @ts-expect-error expression of type 'string' can't be used to index type
        const selector = PagerSelectors[buttonIconSelector];
        selector().click();
        PagerAssertions.assertRenderPager(expectedPageNum);
      });
    }
  });

  describe('Should allow customization of', () => {
    const iconTypes = ['previous', 'next'];
    const testCustomIcon =
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg';

    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        url: testCustomIcon,
      }).as('custom-logo');
    });

    iconTypes.forEach((iconType) => {
      it(`${iconType} icon`, () => {
        const iconSelector = `${iconType}-button-icon`;

        new TestFixture()
          .with(addPager({[iconSelector]: testCustomIcon}))
          .init();

        cy.wait('@custom-logo')
          .get('atomic-pager')
          .shadow()
          .find(`[part="${iconSelector}"]`)
          .should('have.attr', 'icon')
          .should('equal', testCustomIcon);
      });
    });
  });
});
