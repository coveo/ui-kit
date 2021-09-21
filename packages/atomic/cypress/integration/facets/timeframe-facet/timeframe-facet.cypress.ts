import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addTimeframeFacet,
  field,
  inputStartDate,
  label,
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

const startDate = '2020-08-06';
const endDate = '2021-09-03';

describe('Timeframe Facet V1 Test Suites', () => {
  const defaultNumberOfValues = unitFrames.length;
  describe('with default "date" field timeframe-facet', () => {
    function setupTimeframeFacet() {
      new TestFixture().with(addTimeframeFacet({label}, unitFrames)).init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacet);
      CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
      CommonAssertions.assertAccessibility(timeframeFacetComponent);
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(TimeframeFacetSelectors, label);
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
          field,
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
            field,
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
          });

          describe('verify analytics', () => {
            before(setupClearCheckboxValues);
            CommonFacetAssertions.assertLogClearFacetValues(field);
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
              {label, field, 'with-date-picker': ''},
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
          TimeframeFacetAssertions.assertLogTimeframeInputRange(field);
        });
      });
    });
  });

  describe('with custom #field timeframe-facet', () => {
    const customField = 'indexeddate';
    function setupTimeframeFacet() {
      new TestFixture()
        .with(addTimeframeFacet({label, field: customField}, unitFrames))
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
      CommonFacetAssertions.assertLabelContains(TimeframeFacetSelectors, label);
    });
  });

  describe('with custom #withInput only', () => {
    function setupTimeframeWithInputOnly(inputType = '') {
      new TestFixture()
        .with(
          addTimeframeFacet({
            label,
            field,
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
      CommonFacetAssertions.assertLabelContains(TimeframeFacetSelectors, label);
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
        .with(addTimeframeFacet({label, field}, periodFrames))
        .init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacetCustomAmount);
      CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
      CommonAssertions.assertAccessibility(timeframeFacetComponent);
      CommonFacetAssertions.assertLabelContains(TimeframeFacetSelectors, label);
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
    const periodFrames = [
      {unit: 'day', period},
      {unit: 'week', period},
      {unit: 'month', period},
    ];
    function setupTimeframeFacetCustomAmount() {
      new TestFixture()
        .with(addTimeframeFacet({label, field}, periodFrames))
        .init();
    }

    describe('verify rendering', () => {
      before(setupTimeframeFacetCustomAmount);
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors,
        false
      );
    });
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addTimeframeFacet({label}, unitFrames))
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
              label,
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
              field,
              label,
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
        .with(addTimeframeFacet({label, field}, unitFrames))
        .withHash(`df[${field}]=past-1-month..now`)
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
});
