import {TestFixture} from '../../../fixtures/test-fixture';
import {
  segmentedFacetComponent,
  SegmentedFacetSelectors,
} from './segmented-facet-selectors';
import {
  addSegmentedFacet,
  field,
  label,
  defaultNumberOfValues,
} from './segmented-facet-actions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';

describe('Segmented Facet v2 Test Suites', () => {
  describe('with checkbox values', () => {
    function setupWithCheckboxValues() {
      new TestFixture().with(addSegmentedFacet({field, label})).init();
    }

    describe('verify rendering', () => {
      before(setupWithCheckboxValues);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      CommonAssertions.assertContainsComponentError(
        SegmentedFacetSelectors,
        false
      );
      CommonFacetAssertions.assertDisplayFacet(SegmentedFacetSelectors, true);
      CommonFacetAssertions.assertLabelContains(SegmentedFacetSelectors, label);
      CommonFacetAssertions.assertDisplayValues(SegmentedFacetSelectors, true);
      CommonFacetAssertions.assertDisplayPlaceholder(
        SegmentedFacetSelectors,
        false
      );
    });
  });
});
