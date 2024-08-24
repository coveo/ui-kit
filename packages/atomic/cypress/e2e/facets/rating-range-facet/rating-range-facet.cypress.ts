import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  pressClearButton,
  selectIdleLinkValueAt,
  typeFacetSearchQuery,
  selectIdleCheckboxValueAt,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet} from '../facet/facet-actions';
import {FacetSelectors} from '../facet/facet-selectors';
import * as RatingFacetAssertions from '../rating-facet/rating-facet-assertions';
import {
  addRatingRangeFacet,
  ratingRangeFacetField,
  ratingRangeFacetLabel,
  ratingRangeFacetDefaultNumberOfIntervals,
} from './rating-range-facet-actions';
import * as RatingRangeFacetAssertions from './rating-range-facet-assertions';
import {
  ratingRangeFacetComponent,
  RatingRangeFacetSelectors,
} from './rating-range-facet-selectors';

describe('Rating Range Test Suites', () => {
  describe('with default rating facet', () => {
    function setupRatingRangeFacet() {
      new TestFixture()
        .with(
          addRatingRangeFacet({
            field: ratingRangeFacetField,
            label: ratingRangeFacetLabel,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupRatingRangeFacet);
      CommonAssertions.assertAccessibility(ratingRangeFacetComponent);
      CommonAssertions.assertContainsComponentError(
        RatingRangeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, true);
      CommonFacetAssertions.assertLabelContains(
        RatingRangeFacetSelectors,
        ratingRangeFacetLabel
      );
      CommonFacetAssertions.assertDisplayValues(
        RatingRangeFacetSelectors,
        true
      );
      CommonFacetAssertions.assertDisplayPlaceholder(
        RatingRangeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertNumberOfSelectedLinkValues(
        RatingRangeFacetSelectors,
        0
      );
      CommonFacetAssertions.assertNumberOfIdleLinkValues(
        RatingRangeFacetSelectors,
        ratingRangeFacetDefaultNumberOfIntervals
      );
      RatingFacetAssertions.assertNumberOfStarAtIndex(
        RatingRangeFacetSelectors,
        ratingRangeFacetDefaultNumberOfIntervals
      );
      RatingFacetAssertions.assertNumberofYellowStar(
        RatingRangeFacetSelectors,
        4,
        1
      );
      RatingRangeFacetAssertions.assertFacetValueContainsTextOnlyAndUp();
    });

    describe('when select a value', () => {
      const selectionIndex = 2;
      function setupSelectLinkValue() {
        setupRatingRangeFacet();
        selectIdleLinkValueAt(RatingRangeFacetSelectors, selectionIndex);
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectLinkValue);

        CommonAssertions.assertAccessibility(ratingRangeFacetComponent);
        CommonFacetAssertions.assertDisplayClearButton(
          RatingRangeFacetSelectors,
          true
        );
        CommonFacetAssertions.assertNumberOfSelectedLinkValues(
          RatingRangeFacetSelectors,
          1
        );
        CommonFacetAssertions.assertNumberOfIdleLinkValues(
          RatingRangeFacetSelectors,
          ratingRangeFacetDefaultNumberOfIntervals - 1
        );
      });

      describe('verify analytic', () => {
        beforeEach(setupSelectLinkValue);
        RatingFacetAssertions.assertLogRatingFacetSelect(ratingRangeFacetField);
      });

      describe('when selecting the "Clear filter" button', () => {
        function setupClearCheckboxValues() {
          setupSelectLinkValue();
          pressClearButton(RatingRangeFacetSelectors);
        }
        describe('verify rendering', () => {
          beforeEach(setupClearCheckboxValues);

          CommonFacetAssertions.assertDisplayClearButton(
            RatingRangeFacetSelectors,
            false
          );
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            RatingRangeFacetSelectors,
            0
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            RatingRangeFacetSelectors,
            ratingRangeFacetDefaultNumberOfIntervals
          );
          CommonFacetAssertions.assertFocusHeader(RatingRangeFacetSelectors);
        });

        describe('verify analytics', () => {
          beforeEach(setupClearCheckboxValues);
          CommonFacetAssertions.assertLogClearFacetValues(
            ratingRangeFacetField
          );
        });
      });
    });
  });

  describe('with custom #numberOfIntervals', () => {
    const customNumberofInterval = 10;
    function setupRatingFacetWithCustomInterval() {
      new TestFixture()
        .with(
          addRatingRangeFacet({
            field: ratingRangeFacetField,
            label: ratingRangeFacetLabel,
            'number-of-intervals': customNumberofInterval,
          })
        )
        .init();
    }

    beforeEach(setupRatingFacetWithCustomInterval);
    CommonAssertions.assertAccessibility(ratingRangeFacetComponent);
    CommonAssertions.assertContainsComponentError(
      RatingRangeFacetSelectors,
      false
    );
    CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      RatingRangeFacetSelectors,
      0
    );
    CommonFacetAssertions.assertNumberOfIdleLinkValues(
      RatingRangeFacetSelectors,
      ratingRangeFacetDefaultNumberOfIntervals
    );
    RatingFacetAssertions.assertNumberOfStarAtIndex(
      RatingRangeFacetSelectors,
      customNumberofInterval
    );
    RatingFacetAssertions.assertNumberofYellowStar(
      RatingRangeFacetSelectors,
      4,
      1,
      customNumberofInterval
    );
    RatingRangeFacetAssertions.assertFacetValueContainsAndUp();
  });

  // describe('with custom #maxValueInIndex', () => {
  //   const customMaxValueInIndex = 3;
  //   function setupRatingFacetWithCustomMaxValueInIndex() {
  //     new TestFixture()
  //       .with(
  //         addRatingRangeFacet({
  //           field: ratingRangeFacetField,
  //           label: ratingRangeFacetLabel,
  //           'number-of-intervals': '5',
  //           'max-value-in-index': customMaxValueInIndex,
  //         })
  //       )
  //       .init();
  //   }

  // beforeEach(setupRatingFacetWithCustomMaxValueInIndex);
  // CommonAssertions.assertAccessibility(ratingRangeFacetComponent);
  // CommonAssertions.assertContainsComponentError(
  //   RatingRangeFacetSelectors,
  //   false
  // );
  // CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, true);
  // CommonFacetAssertions.assertNumberOfSelectedLinkValues(
  //   RatingRangeFacetSelectors,
  //   0
  // );
  // CommonFacetAssertions.assertNumberOfIdleLinkValues(
  //   RatingRangeFacetSelectors,
  //   ratingRangeFacetDefaultNumberOfIntervals
  // );
  // RatingFacetAssertions.assertNumberOfStarAtIndex(
  //   RatingRangeFacetSelectors,
  //   customMaxValueInIndex
  // );
  // RatingFacetAssertions.assertNumberofYellowStar(
  //   RatingRangeFacetSelectors,
  //   0,
  //   4,
  //   customMaxValueInIndex
  // );
  // RatingRangeFacetAssertions.assertFacetValueContainsTextOnlyAndUp();
  // });

  describe('with custom #minValueInIndex', () => {
    const customMinValueInIndex = 2;
    function setupRatingFacetWithCustomMinValueInIndex() {
      new TestFixture()
        .with(
          addRatingRangeFacet({
            field: ratingRangeFacetField,
            label: ratingRangeFacetLabel,
            'min-value-in-index': customMinValueInIndex,
          })
        )
        .init();
    }

    beforeEach(setupRatingFacetWithCustomMinValueInIndex);
    CommonAssertions.assertAccessibility(ratingRangeFacetComponent);
    CommonAssertions.assertContainsComponentError(
      RatingRangeFacetSelectors,
      false
    );
    CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      RatingRangeFacetSelectors,
      0
    );
    RatingFacetAssertions.assertNumberOfStarAtIndex(
      RatingRangeFacetSelectors,
      ratingRangeFacetDefaultNumberOfIntervals
    );
    RatingFacetAssertions.assertNumberofYellowStar(
      RatingRangeFacetSelectors,
      'last',
      2
    );
    RatingRangeFacetAssertions.assertFacetValueContainsTextOnlyAndUp();
  });

  describe('with invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addRatingRangeFacet({
            field: ratingRangeFacetField,
            label: ratingRangeFacetLabel,
            'number-of-intervals': '-10',
          })
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(
      RatingRangeFacetSelectors,
      true
    );
  });

  describe('when field returns no results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addRatingRangeFacet({
            field: 'nofield',
            label: ratingRangeFacetLabel,
          })
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(
      RatingRangeFacetSelectors,
      false
    );
    CommonAssertions.assertContainsComponentError(
      RatingRangeFacetSelectors,
      false
    );
  });

  describe('with a selected path in the URL', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addRatingRangeFacet({
            field: ratingRangeFacetField,
            label: ratingRangeFacetLabel,
          })
        )
        .withHash(`nf-${ratingRangeFacetField}=4..5`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(RatingRangeFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      RatingRangeFacetSelectors,
      1
    );
    CommonFacetAssertions.assertNumberOfIdleLinkValues(
      RatingRangeFacetSelectors,
      ratingRangeFacetDefaultNumberOfIntervals - 1
    );
    // RatingFacetAssertions.assertSelectedFacetValueContainsNumberOfStar(
    //   RatingRangeFacetSelectors,
    //   4
    // );
    RatingRangeFacetAssertions.assertFacetValueContainsTextOnlyAndUp();
  });
  describe('with depends-on', () => {
    const facetId = 'abc';
    describe('as a dependent', () => {
      const parentFacetId = 'def';
      const parentField = 'language';
      const expectedValue = 'English';
      beforeEach(() => {
        new TestFixture()
          .with(
            addRatingRangeFacet({
              'facet-id': facetId,
              field: ratingRangeFacetField,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        RatingRangeFacetSelectors.withId(facetId),
        false
      );
      CommonFacetAssertions.assertDisplayFacet(
        FacetSelectors.withId(parentFacetId),
        true
      );

      describe('when the dependency is met', () => {
        beforeEach(() => {
          typeFacetSearchQuery(
            FacetSelectors.withId(parentFacetId),
            expectedValue,
            true
          );
          selectIdleCheckboxValueAt(FacetSelectors.withId(parentFacetId), 0);
        });

        CommonFacetAssertions.assertDisplayFacet(
          RatingRangeFacetSelectors.withId(facetId),
          true
        );
        CommonFacetAssertions.assertDisplayFacet(
          FacetSelectors.withId(parentFacetId),
          true
        );
      });
    });

    describe('with two dependencies', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addFacet({'facet-id': 'abc', field: 'objecttype'}))
          .with(addFacet({'facet-id': 'def', field: 'filetype'}))
          .with(
            addRatingRangeFacet({
              'facet-id': 'ghi',
              field: ratingRangeFacetField,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        RatingRangeFacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
