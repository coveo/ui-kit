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
      before(() => {
        setupDefaultPager();
      });
      PagerAssertions.assertRenderPager(5);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('on button next', () => {
      before(() => {
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
      before(() => {
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
      before(() => {
        setupDefaultPager();
        pressPagerNumber(3);
      });

      PagerAssertions.assertLogPagerNumber(3);
      PagerAssertions.assertPagerSelected('3', true);
      PagerAssertions.assertPagerSelected('1', false);
      PagerAssertions.assertPageInHash(3);
    });

    describe('on click 5', () => {
      before(() => {
        setupDefaultPager();
        pressPagerNumber(5);
      });

      PagerAssertions.assertPagerSelected('6', false);
    });
  });

  describe('Pager should load from url', () => {
    before(() => {
      new TestFixture().with(addPager()).withHash('firstResult=20').init();
    });

    PagerAssertions.assertPagerSelected('3', true);
  });

  describe('Option numberOfPages', () => {
    describe('when prop is a number', () => {
      before(() => {
        new TestFixture().with(addPager({'number-of-pages': 10})).init();
      });

      PagerAssertions.assertRenderPager(10);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('when prop is a number_string ', () => {
      before(() => {
        new TestFixture().with(addPager({'number-of-pages': '8'})).init();
      });

      PagerAssertions.assertRenderPager(8);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('when prop contains number&character', () => {
      before(() => {
        new TestFixture().with(addPager({'number-of-pages': '9k3'})).init();
      });

      PagerAssertions.assertRenderPager(9);
      CommonAssertions.assertAccessibility(pagerComponent);
    });

    describe('when the prop is not in the list of numberOfPages', () => {
      before(() => {
        new TestFixture().with(addPager({'number-of-pages': '-5'})).init();
      });

      CommonAssertions.assertContainsComponentError(PagerSelectors, true);
    });
  });

  describe('Options for previous next button icons', () => {
    before(() => {
      new TestFixture().with(addPager()).init();
    });

    it('should expose shadow part for next icon', () => {
      cy.get('atomic-pager').shadow().find('[part="next-button-icon"]').click();
      PagerAssertions.assertRenderPager(2);
    });

    it('should expose shadow part for previous icon', () => {
      cy.get('atomic-pager')
        .shadow()
        .find('[part="previous-button-icon"]')
        .click();
      PagerAssertions.assertRenderPager(1);
    });

    describe('pager arrow button icon props', () => {
      const iconTypes = ['previous', 'next'];
      iconTypes.forEach((iconType) => {
        it(`should allow ${iconType} icon to be customized`, () => {
          const iconSelector = `${iconType}-button-icon`;
          const testCustomIcon =
            'https://raw.githubusercontent.com/coveo/ui-kit/master/packages/atomic/src/images/arrow-top-rounded.svg';

          new TestFixture()
            // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names
            .with(addPager({[iconSelector]: testCustomIcon}))
            .init();

          cy.get('atomic-pager')
            .shadow()
            .find(`[part="${iconSelector}"]`)
            .should('have.attr', 'icon')
            .should('equal', testCustomIcon);
        });
      });
    });
  });
});
