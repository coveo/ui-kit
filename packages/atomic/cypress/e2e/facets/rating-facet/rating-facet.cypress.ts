import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  pressClearButton,
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
  typeFacetSearchQuery,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet} from '../facet/facet-actions';
import {FacetSelectors} from '../facet/facet-selectors';
import {
  addRatingFacet,
  ratingFacetDefaultNumberOfIntervals,
  ratingFacetField,
  ratingFacetLabel,
} from './rating-facet-actions';
import * as RatingFacetAssertions from './rating-facet-assertions';
import {
  ratingFacetComponent,
  RatingFacetSelectors,
} from './rating-facet-selectors';

describe('Rating Facet Test Suites', () => {
  describe('with default rating facet', () => {
    describe('with checkbox values', () => {
      function setupRatingFacet() {
        new TestFixture()
          .with(
            addRatingFacet({field: ratingFacetField, label: ratingFacetLabel})
          )
          .init();
      }

      describe('verify rendering', () => {
        beforeEach(setupRatingFacet);
        CommonAssertions.assertAccessibility(ratingFacetComponent);
        CommonAssertions.assertContainsComponentError(
          RatingFacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, true);
        CommonFacetAssertions.assertLabelContains(
          RatingFacetSelectors,
          ratingFacetLabel
        );
        CommonFacetAssertions.assertDisplayValues(RatingFacetSelectors, true);
        CommonFacetAssertions.assertDisplayPlaceholder(
          RatingFacetSelectors,
          false
        );
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          RatingFacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
          RatingFacetSelectors,
          ratingFacetDefaultNumberOfIntervals
        );
        RatingFacetAssertions.assertNumberOfStarAtIndex(
          RatingFacetSelectors,
          ratingFacetDefaultNumberOfIntervals
        );
        RatingFacetAssertions.assertNumberofYellowStar(
          RatingFacetSelectors,
          4,
          1
        );
      });

      describe('when select a value', () => {
        const selectionIndex = 2;
        function setupSelectCheckboxValue() {
          setupRatingFacet();
          selectIdleCheckboxValueAt(RatingFacetSelectors, selectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectCheckboxValue);

          CommonAssertions.assertAccessibility(ratingFacetComponent);
          CommonFacetAssertions.assertDisplayClearButton(
            RatingFacetSelectors,
            true
          );
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            RatingFacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
            RatingFacetSelectors,
            ratingFacetDefaultNumberOfIntervals - 1
          );
        });

        describe('verify analytic', () => {
          beforeEach(setupSelectCheckboxValue);
          RatingFacetAssertions.assertLogRatingFacetSelect(ratingFacetField);
        });
      });
    });

    describe('with link values', () => {
      function setupRatingFacetWithLinkValues() {
        new TestFixture()
          .with(
            addRatingFacet({
              field: ratingFacetField,
              label: ratingFacetLabel,
              'display-values-as': 'link',
            })
          )
          .init();
      }

      describe('verify rendering', () => {
        beforeEach(setupRatingFacetWithLinkValues);
        CommonAssertions.assertAccessibility(ratingFacetComponent);
        CommonAssertions.assertContainsComponentError(
          RatingFacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, true);
        CommonFacetAssertions.assertLabelContains(
          RatingFacetSelectors,
          ratingFacetLabel
        );
        CommonFacetAssertions.assertDisplayValues(RatingFacetSelectors, true);
        CommonFacetAssertions.assertDisplayPlaceholder(
          RatingFacetSelectors,
          false
        );
        CommonFacetAssertions.assertNumberOfSelectedLinkValues(
          RatingFacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfIdleLinkValues(
          RatingFacetSelectors,
          ratingFacetDefaultNumberOfIntervals
        );
        RatingFacetAssertions.assertNumberOfStarAtIndex(
          RatingFacetSelectors,
          ratingFacetDefaultNumberOfIntervals
        );
        RatingFacetAssertions.assertNumberofYellowStar(
          RatingFacetSelectors,
          4,
          1
        );
      });

      describe('when select a value', () => {
        const selectionIndex = 2;
        function setupSelectLinkValue() {
          setupRatingFacetWithLinkValues();
          selectIdleLinkValueAt(RatingFacetSelectors, selectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectLinkValue);

          CommonAssertions.assertAccessibility(ratingFacetComponent);
          CommonFacetAssertions.assertDisplayClearButton(
            RatingFacetSelectors,
            true
          );
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            RatingFacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            RatingFacetSelectors,
            ratingFacetDefaultNumberOfIntervals - 1
          );
        });

        describe('verify analytic', () => {
          beforeEach(setupSelectLinkValue);
          RatingFacetAssertions.assertLogRatingFacetSelect(ratingFacetField);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearCheckboxValues() {
            setupSelectLinkValue();
            pressClearButton(RatingFacetSelectors);
          }

          describe('verify rendering', () => {
            beforeEach(setupClearCheckboxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              RatingFacetSelectors,
              false
            );
            CommonFacetAssertions.assertNumberOfSelectedLinkValues(
              RatingFacetSelectors,
              0
            );
            CommonFacetAssertions.assertNumberOfIdleLinkValues(
              RatingFacetSelectors,
              ratingFacetDefaultNumberOfIntervals
            );
            CommonFacetAssertions.assertFocusHeader(RatingFacetSelectors);
          });
          describe('verify analytics', () => {
            beforeEach(setupClearCheckboxValues);

            CommonFacetAssertions.assertLogClearFacetValues(ratingFacetField);
          });
        });
      });
    });
  });

  describe('with custom #numberOfIntervals', () => {
    const customNumberofInterval = 10;
    function setupRatingFacetWithCustomInterval() {
      new TestFixture()
        .with(
          addRatingFacet({
            field: ratingFacetField,
            label: ratingFacetLabel,
            'number-of-intervals': customNumberofInterval,
          })
        )
        .init();
    }

    beforeEach(setupRatingFacetWithCustomInterval);
    CommonAssertions.assertAccessibility(ratingFacetComponent);
    CommonAssertions.assertContainsComponentError(RatingFacetSelectors, false);
    CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      RatingFacetSelectors,
      0
    );
    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      RatingFacetSelectors,
      ratingFacetDefaultNumberOfIntervals
    );
    RatingFacetAssertions.assertNumberOfStarAtIndex(
      RatingFacetSelectors,
      customNumberofInterval
    );
    RatingFacetAssertions.assertNumberofYellowStar(
      RatingFacetSelectors,
      4,
      1,
      customNumberofInterval
    );
  });

  describe('with custom #maxValueInIndex', () => {
    const customMaxValueInIndex = 4;
    function setupRatingFacetWithCustomMaxValueInIndex() {
      new TestFixture()
        .with(
          addRatingFacet({
            field: ratingFacetField,
            label: ratingFacetLabel,
            'max-value-in-index': customMaxValueInIndex,
          })
        )
        .init();
    }

    beforeEach(setupRatingFacetWithCustomMaxValueInIndex);
    CommonAssertions.assertAccessibility(ratingFacetComponent);
    CommonAssertions.assertContainsComponentError(RatingFacetSelectors, false);
    CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      RatingFacetSelectors,
      0
    );
    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      RatingFacetSelectors,
      ratingFacetDefaultNumberOfIntervals
    );
    RatingFacetAssertions.assertNumberOfStarAtIndex(
      RatingFacetSelectors,
      customMaxValueInIndex
    );
    RatingFacetAssertions.assertNumberofYellowStar(
      RatingFacetSelectors,
      0,
      4,
      customMaxValueInIndex
    );
  });

  describe('with custom #minValueInIndex', () => {
    const customMinValueInIndex = 2;
    function setupRatingFacetWithCustomMinValueInIndex() {
      new TestFixture()
        .with(
          addRatingFacet({
            field: ratingFacetField,
            label: ratingFacetLabel,
            'min-value-in-index': customMinValueInIndex,
          })
        )
        .init();
    }

    beforeEach(setupRatingFacetWithCustomMinValueInIndex);
    CommonAssertions.assertAccessibility(ratingFacetComponent);
    CommonAssertions.assertContainsComponentError(RatingFacetSelectors, false);
    CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      RatingFacetSelectors,
      0
    );
    RatingFacetAssertions.assertNumberOfStarAtIndex(
      RatingFacetSelectors,
      ratingFacetDefaultNumberOfIntervals
    );
    RatingFacetAssertions.assertNumberofYellowStar(
      RatingFacetSelectors,
      'last',
      2
    );
  });

  describe('with invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addRatingFacet({
            field: ratingFacetField,
            label: ratingFacetLabel,
            'number-of-intervals': '-10',
          })
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(RatingFacetSelectors, true);
  });

  describe('when field returns no results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addRatingFacet({
            field: 'nofield',
            label: ratingFacetLabel,
          })
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(RatingFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(RatingFacetSelectors, false);
  });

  describe('with a selected path in the URL', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addRatingFacet({
            field: ratingFacetField,
            label: ratingFacetLabel,
            'display-values-as': 'link',
          })
        )
        .withHash(`nf-${ratingFacetField}=4..5`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(RatingFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      RatingFacetSelectors,
      1
    );
    CommonFacetAssertions.assertNumberOfIdleLinkValues(
      RatingFacetSelectors,
      ratingFacetDefaultNumberOfIntervals - 1
    );
    // RatingFacetAssertions.assertSelectedFacetValueContainsNumberOfStar(
    //   RatingFacetSelectors,
    //   4
    // );
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
            addRatingFacet({
              'facet-id': facetId,
              field: ratingFacetField,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        RatingFacetSelectors.withId(facetId),
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
          RatingFacetSelectors.withId(facetId),
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
            addRatingFacet({
              'facet-id': 'ghi',
              field: ratingFacetField,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        RatingFacetSelectors.withId('ghi'),
        true
      );
    });

    describe('with two dependencies', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addFacet({'facet-id': 'abc', field: 'objecttype'}))
          .with(addFacet({'facet-id': 'def', field: 'filetype'}))
          .with(
            addRatingFacet({
              'facet-id': 'ghi',
              field: ratingFacetField,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        RatingFacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
