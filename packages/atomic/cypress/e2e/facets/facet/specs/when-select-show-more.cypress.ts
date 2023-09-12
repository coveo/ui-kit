import {TestFixture} from '../../../../fixtures/test-fixture';
import {pressShowLess, pressShowMore} from '../../facet-common-actions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label, defaultNumberOfValues} from '../facet-actions';
import * as FacetAssertions from '../facet-assertions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore(sortCriteria?: string) {
      new TestFixture()
        .with(
          addFacet({
            field,
            label,
            ...(sortCriteria && {'sort-criteria': sortCriteria}),
          })
        )
        .init();
      pressShowMore(FacetSelectors);
    }

    describe('verify rendering', () => {
      beforeEach(() => setupSelectShowMore('automatic'));

      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      FacetAssertions.assertValuesSortedAlphanumerically();
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        defaultNumberOfValues * 2
      );
      CommonFacetAssertions.assertFocusCheckboxValue(FacetSelectors, 0);
    });

    describe("when the sort order isn't automatic", () => {
      beforeEach(() => setupSelectShowMore('alphanumeric'));

      CommonFacetAssertions.assertFocusCheckboxValue(
        FacetSelectors,
        defaultNumberOfValues
      );
    });

    describe('verify analytics', () => {
      beforeEach(() => setupSelectShowMore());

      FacetAssertions.assertLogFacetShowMore(field);
      it('should include analytics in the v2 call', async () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
          expect(firstSearch.request.body).to.have.property('analytics');
          const analyticsBody = firstSearch.request.body.analytics;
          expect(analyticsBody).to.have.property('eventType', 'facet');
          expect(analyticsBody).to.have.property(
            'eventValue',
            'showMoreFacetResults'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        });
      });
    });

    describe('when there\'s no more "Show more" button', () => {
      function setupRepeatShowMore() {
        new TestFixture().with(addFacet({field: 'month', label})).init();
        FacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }
      beforeEach(setupRepeatShowMore);

      describe('verify rendering', () => {
        CommonFacetAssertions.assertDisplayShowMoreButton(
          FacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      });
    });

    describe('when selecting the "Show less" button', () => {
      function setupSelectShowLess() {
        setupSelectShowMore();
        pressShowLess(FacetSelectors);
      }
      beforeEach(setupSelectShowLess);

      describe('verify rendering', () => {
        CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
        CommonFacetAssertions.assertDisplayShowLessButton(
          FacetSelectors,
          false
        );
        CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
          FacetSelectors,
          defaultNumberOfValues
        );
      });

      describe('verify analytics', () => {
        FacetAssertions.assertLogFacetShowLess(field);
      });
    });
  });
});
