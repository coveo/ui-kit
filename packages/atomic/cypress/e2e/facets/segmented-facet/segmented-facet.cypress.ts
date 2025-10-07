import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {
  addSegmentedFacet,
  defaultNumberOfValues,
  field,
  label,
  selectIdleBoxValueAt,
} from './segmented-facet-actions';
import * as FacetAssertions from './segmented-facet-assertions';
import {
  segmentedFacetComponent,
  SegmentedFacetSelectors,
} from './segmented-facet-selectors';

describe.skip('Segmented Facet Test Suites', () => {
  function setupSegmentedFacet() {
    new TestFixture().with(addSegmentedFacet({field, label})).init();
  }

  describe('verify rendering', () => {
    beforeEach(setupSegmentedFacet);

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
      beforeEach(setupSelectSegmentedFacet);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      FacetAssertions.assertNumberOfSelectedBoxValues(1);
      FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
    });
    describe('verify analytics', () => {
      beforeEach(setupSelectSegmentedFacet);
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
      beforeEach(setupCustomSegmentedFacet);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      CommonFacetAssertions.assertLabelContains(
        SegmentedFacetSelectors,
        'Language'
      );
      FacetAssertions.assertNumberOfIdleBoxValues(customNumValues);
    });
  });

  describe('when no search has yet been executed', () => {
    beforeEach(() => {
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
      beforeEach(setupSegmentedFacetNoLabel);

      CommonAssertions.assertAccessibility(segmentedFacetComponent);
      CommonFacetAssertions.assertDisplayFacet(SegmentedFacetSelectors, true);
      FacetAssertions.assertLabelExists(false);
      FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
    });
  });

  describe('when field returns no results', () => {
    beforeEach(() => {
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
    beforeEach(() => {
      new TestFixture()
        .with(addSegmentedFacet({field, label}))
        .withHash(`f-${field}=Cervantes`)
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

  describe('with custom #sortCriteria, occurrences', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSegmentedFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
    });

    FacetAssertions.assertValuesSortedByOccurrences();
  });

  describe('with allowed-values', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addSegmentedFacet({
            field: 'objecttype',
            'allowed-values': JSON.stringify(['FAQ', 'People']),
          })
        )
        .init();
    });

    it('returns only allowed values', () => {
      SegmentedFacetSelectors.valueLabel()
        .should('contain.text', 'FAQ')
        .should('contain.text', 'People')
        .should('not.contain.text', 'Page');
    });
  });

  describe('with custom-sort', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addSegmentedFacet({
            field: 'filetype',
            'custom-sort': JSON.stringify(['txt', 'rssitem']),
          })
        )
        .init();
    });

    it('returns values sorted in the proper order', () => {
      SegmentedFacetSelectors.valueLabel().eq(0).should('contain.text', 'txt');
      SegmentedFacetSelectors.valueLabel()
        .eq(1)
        .should('contain.text', 'rssitem');
    });
  });
});
