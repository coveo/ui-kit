import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addTimeframeFacet,
  timeframeFacetField,
  inputStartDate,
  timeframeFacetLabel,
  unitFrames,
  clickApplyButton,
  inputEndDate,
  invokeSubmitButton,
} from './timeframe-facet-action';
import {
  timeframeFacetComponent,
  TimeframeFacetSelectors,
} from './timeframe-facet-selectors';
import {selectIdleLinkValueAt} from '../facet-common-actions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import * as TimeframeFacetAssertions from './timeframe-facet-assertions';
import * as BreadboxAssertions from '../../breadbox/breadbox-assertions';
import {breadboxComponent} from '../../breadbox/breadbox-selectors';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox/breadbox-actions';

const startDate = '2020-08-06';
const endDate = '2021-09-03';

describe('Timeframe Facet V1 Test Suites', () => {
  const defaultNumberOfValues = unitFrames.length;
  describe('with default "date" field timeframe-facet', () => {
    function setupTimeframeFacet() {
      new TestFixture()
        .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
        .init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacet);
      CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
      CommonAssertions.assertAccessibility(timeframeFacetComponent);
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(
        TimeframeFacetSelectors,
        timeframeFacetLabel
      );
      CommonFacetAssertions.assertNumberOfSelectedLinkValues(
        TimeframeFacetSelectors,
        0
      );
      CommonFacetAssertions.assertDisplayClearButton(
        TimeframeFacetSelectors,
        false
      );
      TimeframeFacetAssertions.assertDisplayRangeInput(false);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectLinkValue() {
        setupTimeframeFacet();
        selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }
      describe('verify rendering', () => {
        before(setupSelectLinkValue);
        CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
        CommonAssertions.assertAccessibility(timeframeFacetComponent);
        CommonFacetAssertions.assertDisplayClearButton(
          TimeframeFacetSelectors,
          true
        );
        CommonFacetAssertions.assertNumberOfSelectedLinkValues(
          TimeframeFacetSelectors,
          1
        );
        CommonFacetAssertions.assertNumberOfIdleLinkValues(
          TimeframeFacetSelectors,
          defaultNumberOfValues - 1
        );
      });

      describe('verify analytic', () => {
        before(setupSelectLinkValue);
        TimeframeFacetAssertions.assertLogTimeframeFacetSelect(
          timeframeFacetField,
          unitFrames[selectionIndex].unit
        );
      });

      describe('when select a 2nd link', () => {
        const secondSelectionIndex = 0;
        function setupSecondLinkValue() {
          setupSelectLinkValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleLinkValueAt(TimeframeFacetSelectors, secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSecondLinkValue);
          CommonAssertions.assertAccessibility(timeframeFacetComponent);
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            TimeframeFacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            TimeframeFacetSelectors,
            defaultNumberOfValues - 1
          );
        });

        describe('verify analytics', () => {
          before(setupSecondLinkValue);
          TimeframeFacetAssertions.assertLogTimeframeFacetSelect(
            timeframeFacetField,
            unitFrames[secondSelectionIndex].unit,
            'past',
            1
          );
        });

        describe('when selecting the "Clear filter" button', () => {
          function setupClearCheckboxValues() {
            setupSecondLinkValue();
            cy.wait(TestFixture.interceptAliases.UA);
            TimeframeFacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }
          describe('verify rendering', () => {
            before(setupClearCheckboxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              TimeframeFacetSelectors,
              false
            );
            CommonFacetAssertions.assertNumberOfSelectedLinkValues(
              TimeframeFacetSelectors,
              0
            );
            CommonFacetAssertions.assertNumberOfIdleLinkValues(
              TimeframeFacetSelectors,
              defaultNumberOfValues
            );
            CommonFacetAssertions.assertFocusHeader(TimeframeFacetSelectors);
          });

          describe('verify analytics', () => {
            before(setupClearCheckboxValues);
            CommonFacetAssertions.assertLogClearFacetValues(
              timeframeFacetField
            );
          });
        });

        describe('with custom #withInput', () => {});
      });
    });

    describe('with custom #withInput', () => {
      function setupTimeFrameWithInputRange() {
        new TestFixture()
          .with(
            addTimeframeFacet(
              {
                label: timeframeFacetLabel,
                field: timeframeFacetField,
                'with-date-picker': '',
              },
              unitFrames
            )
          )
          .init();
      }

      describe('verify rendering', () => {
        before(() => {
          setupTimeFrameWithInputRange();
        });
        TimeframeFacetAssertions.assertDisplayRangeInput(true);
      });

      describe('when select a valid range', () => {
        function setupInputRange() {
          setupTimeFrameWithInputRange();
          inputStartDate(startDate);
          inputEndDate(endDate);
          clickApplyButton();
        }

        describe('verify rendering', () => {
          before(setupInputRange);
          TimeframeFacetAssertions.assertDisplayRangeInput(true);
          CommonFacetAssertions.assertDisplayValues(
            TimeframeFacetSelectors,
            false
          );
        });

        describe('verify analytic', () => {
          before(setupInputRange);
          TimeframeFacetAssertions.assertLogTimeframeInputRange(
            timeframeFacetField
          );
        });
      });
    });
  });

  describe('with custom #field timeframe-facet', () => {
    const customField = 'indexeddate';
    function setupTimeframeFacet() {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {label: timeframeFacetLabel, field: customField},
            unitFrames
          )
        )
        .init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacet);
      CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
      CommonAssertions.assertAccessibility(timeframeFacetComponent);
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(
        TimeframeFacetSelectors,
        timeframeFacetLabel
      );
    });
  });

  describe('with custom #withInput only', () => {
    function setupTimeframeWithInputOnly(inputType = '') {
      new TestFixture()
        .with(
          addTimeframeFacet({
            label: timeframeFacetLabel,
            field: timeframeFacetField,
            'with-date-picker': inputType,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      before(() => {
        setupTimeframeWithInputOnly();
      });
      TimeframeFacetAssertions.assertDisplayRangeInput(true);
      TimeframeFacetAssertions.assertDisplayApplyButton(true);
      CommonFacetAssertions.assertLabelContains(
        TimeframeFacetSelectors,
        timeframeFacetLabel
      );
      CommonFacetAssertions.assertDisplayValues(TimeframeFacetSelectors, false);
    });

    describe('verify input form', () => {
      describe('when "start" & "end" input is empty', () => {
        before(() => {
          setupTimeframeWithInputOnly();
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(2);
      });

      describe('when "end" input is empty', () => {
        before(() => {
          setupTimeframeWithInputOnly();
          inputStartDate(startDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when "start" input is empty', () => {
        before(() => {
          setupTimeframeWithInputOnly();
          inputEndDate(endDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when "start" input is bigger than "end" input', () => {
        before(() => {
          setupTimeframeWithInputOnly();
          inputStartDate(endDate);
          inputEndDate(startDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(2, 'or earlier.');
      });
    });
  });

  describe('with custom #amount timeframe', () => {
    const periodFrames = [
      {unit: 'month', amount: 20},
      {unit: 'year', amount: 3},
      {unit: 'year', amount: 5},
    ];
    const customNumberOfValues = periodFrames.length;
    const selectionIndex = 0;
    function setupTimeframeFacetCustomAmount() {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {label: timeframeFacetLabel, field: timeframeFacetField},
            periodFrames
          )
        )
        .init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacetCustomAmount);
      CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
      CommonAssertions.assertAccessibility(timeframeFacetComponent);
      CommonFacetAssertions.assertLabelContains(
        TimeframeFacetSelectors,
        timeframeFacetLabel
      );
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertNumberOfIdleLinkValues(
        TimeframeFacetSelectors,
        customNumberOfValues
      );
      TimeframeFacetAssertions.assertFacetValueContainsText(
        selectionIndex,
        `Past ${periodFrames[selectionIndex].amount} ${periodFrames[selectionIndex].unit}s`
      );
    });
  });

  describe('with custom #period timeframe', () => {
    const period = 'next';
    const periodFrames = [{unit: 'year', period, amount: 25}];
    function setupTimeframeFacetCustomAmount() {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {label: timeframeFacetLabel, field: timeframeFacetField},
            periodFrames
          )
        )
        .init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacetCustomAmount);
      CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
      CommonAssertions.assertAccessibility(timeframeFacetComponent);
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(
        TimeframeFacetSelectors,
        timeframeFacetLabel
      );
      CommonFacetAssertions.assertNumberOfIdleLinkValues(
        TimeframeFacetSelectors,
        1
      );
      CommonFacetAssertions.assertFirstValueContains(
        TimeframeFacetSelectors,
        `Next ${periodFrames[0].amount} years`
      );
      CommonFacetAssertions.assertNumberOfSelectedLinkValues(
        TimeframeFacetSelectors,
        0
      );
      CommonFacetAssertions.assertDisplayClearButton(
        TimeframeFacetSelectors,
        false
      );
    });
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(
      TimeframeFacetSelectors,
      true
    );
  });

  describe('with a field that returns no result', () => {
    before(() => {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {
              field: 'dafsfs',
              label: timeframeFacetLabel,
            },
            unitFrames
          )
        )
        .init();
    });
    CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(
      TimeframeFacetSelectors,
      false
    );
    CommonAssertions.assertContainsComponentError(
      TimeframeFacetSelectors,
      false
    );
  });

  describe('with an invalid option', () => {
    const invalidFrames = [{unit: 'here'}];
    before(() => {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {
              field: timeframeFacetField,
              label: timeframeFacetLabel,
            },
            invalidFrames
          )
        )
        .init();
    });
    CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(
      TimeframeFacetSelectors,
      true
    );
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {label: timeframeFacetLabel, field: timeframeFacetField},
            unitFrames
          )
        )
        .withHash(`df[${timeframeFacetField}]=past-1-month..now`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      TimeframeFacetSelectors,
      1
    );
    TimeframeFacetAssertions.assertFacetValueContainsText(
      2,
      `Past ${unitFrames[2].unit}`
    );
  });

  describe('with breadbox', () => {
    function setupBreadboxWithFacet() {
      new TestFixture()
        .with(addBreadbox())
        .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
        .init();
    }
    describe('verify rendering', () => {
      before(setupBreadboxWithFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a facetValue', () => {
      const selectionIndex = 2;
      function setupSelectedFacet() {
        setupBreadboxWithFacet();
        selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectedFacet);
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedLinkFacetsInBreadcrumb(
          TimeframeFacetSelectors
        );
        BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      });

      describe('when unselect a facetValue on breadcrumb', () => {
        const deselectionIndex = 0;
        function setupUnselectFacetValue() {
          setupSelectedFacet();
          cy.wait(TestFixture.interceptAliases.UA);
          deselectBreadcrumbAtIndex(deselectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupUnselectFacetValue);
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytic', () => {
          before(setupUnselectFacetValue);
          BreadboxAssertions.assertLogBreadcrumbFacet(timeframeFacetField);
        });

        describe('verify selected facetValue', () => {
          before(setupSelectedFacet);
          BreadboxAssertions.assertDeselectLinkFacet(
            TimeframeFacetSelectors,
            deselectionIndex
          );
        });
      });
    });
  });
});
