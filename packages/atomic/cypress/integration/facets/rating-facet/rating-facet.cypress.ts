import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addRatingFacet,
  ratingFacetDefaultNumberOfIntervals,
  ratingFacetField,
  ratingFacetLabel,
} from './rating-facet-actions';

import * as RatingFacetAssertions from './rating-facet-assertions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {
  ratingFacetComponent,
  RatingFacetSelectors,
} from './rating-facet-selectors';
import {
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
} from '../facet-common-actions';

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
        before(setupRatingFacet);
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
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectCheckboxValue);

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
          before(setupSelectCheckboxValue);
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
        before(setupRatingFacetWithLinkValues);
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
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectLinkValue);

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
          before(setupSelectLinkValue);
          RatingFacetAssertions.assertLogRatingFacetSelect(ratingFacetField);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearCheckboxValues() {
            setupSelectLinkValue();
            cy.wait(TestFixture.interceptAliases.UA);
            RatingFacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearCheckboxValues);

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
            before(setupClearCheckboxValues);

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

    before(setupRatingFacetWithCustomInterval);
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

    before(setupRatingFacetWithCustomMaxValueInIndex);
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

    before(setupRatingFacetWithCustomMinValueInIndex);
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
    before(() => {
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
    before(() => {
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
    before(() => {
      new TestFixture()
        .with(
          addRatingFacet({
            field: ratingFacetField,
            label: ratingFacetLabel,
            'display-values-as': 'link',
          })
        )
        .withHash(`nf[${ratingFacetField}]=4..5`)
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
    RatingFacetAssertions.assertSelectedFacetValueContainsNumberOfStar(
      RatingFacetSelectors,
      4
    );
  });
});
