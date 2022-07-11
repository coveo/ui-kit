import {TestFixture} from '../../../fixtures/test-fixture';
import {
  segmentedFacetComponent,
  SegmentedFacetSelectors,
} from './segmented-facet-selectors';
import {addSegmentedFacet, field, label} from './segmented-facet-actions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';

describe('Segmented Facet Test Suites', () => {
  function setupSegmentedFacet() {
    new TestFixture().with(addSegmentedFacet({field, label})).init();
  }

  describe('verify rendering', () => {
    before(setupSegmentedFacet);

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

  describe('when select a value', () => {
    describe('verify rendering', () => {});
    describe('verify analytic', () => {});
  });

  describe('with custom #numberOfValues', () => {});

  describe('with no label', () => {});

  describe('when field returns no results', () => {});

  describe('with a selected path in the URL', () => {});

  describe('with depends-on', () => {});

  describe('when the dependency is met', () => {});

  describe('with two dependencies', () => {});
});
