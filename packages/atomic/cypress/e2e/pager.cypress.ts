import {TestFixture} from '../fixtures/test-fixture';
import {
  addPager,
  pressPagerNext,
} from './pager-actions';
import * as PagerAssertions from './pager-assertions';

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
    });
  });

  describe('Analytics integration', () => {
    function setupDefaultPager() {
      new TestFixture().with(addPager()).init();
    }

    it('should include analytics in the v2 call when clicking next', async () => {
      setupDefaultPager();
      pressPagerNext();

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

  describe('Pager should load from url', () => {
    beforeEach(() => {
      new TestFixture().with(addPager()).withHash('firstResult=20').init();
    });

    PagerAssertions.assertPagerSelected('3', true);
  });

  describe('Should load custom icons', () => {
    const testCustomIcon =
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg';

    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        url: testCustomIcon,
      }).as('custom-logo');
    });

    it('should load custom previous icon from URL', () => {
      new TestFixture()
        .with(addPager({'previous-button-icon': testCustomIcon}))
        .init();

      cy.wait('@custom-logo').should('have.property', 'response.statusCode', 200);
    });
  });
});
