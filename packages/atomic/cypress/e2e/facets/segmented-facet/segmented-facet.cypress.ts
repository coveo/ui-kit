import {TestFixture} from '../../../fixtures/test-fixture';
import {
  segmentedFacetComponent,
  SegmentedFacetSelectors,
} from './segmented-facet-selectors';
import {
  addSegmentedFacet,
  defaultNumberOfValues,
  field,
  label,
  selectIdleBoxValueAt,
} from './segmented-facet-actions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import * as FacetAssertions from './segmented-facet-assertions';

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

  describe('when selecting a value', () => {
    const selectionIndex = 2;
    function setupSelectSegmentedFacet() {
      setupSegmentedFacet();
      selectIdleBoxValueAt(selectionIndex);
    }

    describe('verify rendering', () => {
      before(setupSelectSegmentedFacet);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      FacetAssertions.assertNumberOfSelectedBoxValues(1);
      FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
    });
    describe('verify analytics', () => {
      before(setupSelectSegmentedFacet);
      FacetAssertions.assertLogFacetSelect(field, selectionIndex);
    });
  });

  describe('with custom #numberOfValues', () => {
    const customNumValues = 20;
    function setupCustomSegmentedFacet() {
      new TestFixture()
        .with(
          addSegmentedFacet({
            field: 'language',
            label: 'Language',
            'number-of-values': customNumValues,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      before(setupCustomSegmentedFacet);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      CommonFacetAssertions.assertLabelContains(
        SegmentedFacetSelectors,
        'Language'
      );
      FacetAssertions.assertNumberOfIdleBoxValues(customNumValues);
    });
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addSegmentedFacet({field, label}))
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(SegmentedFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(
      SegmentedFacetSelectors,
      true
    );
  });

  describe('with no label', () => {
    function setupSegmentedFacetNoLabel() {
      new TestFixture().with(addSegmentedFacet({field})).init();
    }

    describe('verify rendering', () => {
      before(setupSegmentedFacetNoLabel);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      CommonFacetAssertions.assertDisplayFacet(SegmentedFacetSelectors, true);
      FacetAssertions.assertLabelExists(false);
      FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
    });
  });

  describe('when field returns no results', () => {
    before(() => {
      new TestFixture()
        .with(addSegmentedFacet({field: 'notanactualfield', label}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(SegmentedFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(
      SegmentedFacetSelectors,
      false
    );
    CommonAssertions.assertContainsComponentError(
      SegmentedFacetSelectors,
      false
    );
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(addSegmentedFacet({field, label}))
        .withHash(`f[${field}]=Cervantes`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(SegmentedFacetSelectors, true);
    FacetAssertions.assertNumberOfSelectedBoxValues(1);
    FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
    CommonFacetAssertions.assertFirstValueContains(
      SegmentedFacetSelectors,
      'Cervantes'
    );
  });

  // TODO: enable when SEARCHAPI-7247 is released
  describe.skip('with custom #sortCriteria, occurrences', () => {
    before(() => {
      new TestFixture()
        .with(addSegmentedFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
    });

    FacetAssertions.assertValuesSortedByOccurrences();
  });
});
