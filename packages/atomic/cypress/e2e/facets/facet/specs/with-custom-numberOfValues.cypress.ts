import {TestFixture} from '../../../../fixtures/test-fixture';
import {pressShowMore} from '../../facet-common-actions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addFacet({field, label, 'number-of-values': numberOfValues}))
        .init();
    }

    beforeEach(setupCustomNumberOfValues);

    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      FacetSelectors,
      numberOfValues
    );
    CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
    CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, false);

    describe('when selecting the "Show More" button', () => {
      beforeEach(() => {
        pressShowMore(FacetSelectors);
      });

      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        numberOfValues * 2
      );
      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
    });
  });
});
