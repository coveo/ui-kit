import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {
  addPager,
  pressPagerNext,
} from './pager-actions';
import * as PagerAssertions from './pager-assertions';
import {pagerComponent} from './pager-selectors';

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
  });

  describe('Pager should load from url', () => {
    beforeEach(() => {
      new TestFixture().with(addPager()).withHash('firstResult=20').init();
    });

    PagerAssertions.assertPagerSelected('3', true);
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