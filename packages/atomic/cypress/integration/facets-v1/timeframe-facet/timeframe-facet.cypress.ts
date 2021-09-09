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
      CommonFacetAssertions.assertNumberOfIdleLinkValues(
        TimeframeFacetSelectors,
        defaultNumberOfValues
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
        // CommonAssertions.assertAccessibility(TimeframeFacetSelectors);
        // TODO: enable it when KIT-996 fixed
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
          // CommonAssertions.assertAccessibility(timeframeFacetComponent);
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            TimeframeFacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            TimeframeFacetSelectors,
            defaultNumberOfValues - 1
          );
        });

        describe('versify analytics', () => {
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
    const defaultNumberOfValues = unitFrames.length;
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

    describe('when selecting a value', () => {
      const selectionIndex = 1;
      function setupSelectLinkValue() {
        setupTimeframeFacet();
        selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectLinkValue);
        CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
        // CommonAssertions.assertAccessibility(TimeframeFacetSelectors);
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
          customField,
          unitFrames[selectionIndex].unit
        );
      });
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
    const amount = 10;
    const periodFrames = [
      {unit: 'day', amount: amount},
      {unit: 'week', amount: amount},
      {unit: 'month', amount: amount},
    ];
    const customNumberOfValues = periodFrames.length;
    const selectionIndex = 1;
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
        `Past ${amount} ${periodFrames[selectionIndex].unit}s`
      );
    });

    describe('when selecting a value', () => {
      function setupSelectLinkValue() {
        setupTimeframeFacetCustomAmount();
        selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectLinkValue);
        CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
        // CommonAssertions.assertAccessibility(TimeframeFacetSelectors);
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
          customNumberOfValues - 1
        );
      });

      describe('verify analytic', () => {
        before(setupSelectLinkValue);
        TimeframeFacetAssertions.assertLogTimeframeFacetSelect(
          field,
          periodFrames[selectionIndex].unit,
          'past',
          periodFrames[selectionIndex].amount
        );
      });
    });
  });

  describe.skip('with custom #period timeframe', () => {
    // TODO: enable it when KIT-995 fixed
    const period = 'next';
    const periodFrames = [
      {unit: 'day', period: period},
      {unit: 'week', period: period},
      {unit: 'month', period: period},
    ];
    const customNumberOfValues = periodFrames.length;
    const selectionIndex = 1;
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
        `Next 1 ${periodFrames[selectionIndex].unit}`
      );
    });

    describe('when selecting a value', () => {
      function setupSelectLinkValue() {
        setupTimeframeFacetCustomAmount();
        selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }
      describe('verify rendering', () => {
        before(setupSelectLinkValue);
        CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
        // CommonAssertions.assertAccessibility(TimeframeFacetSelectors);
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
          customNumberOfValues - 1
        );
      });

      describe('verify analytic', () => {
        before(setupSelectLinkValue);
        TimeframeFacetAssertions.assertLogTimeframeFacetSelect(
          field,
          periodFrames[selectionIndex].unit,
          period
        );
      });
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
        .withHash(`df[${field}]=past-1-week..now`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      TimeframeFacetSelectors,
      1
    );
    CommonFacetAssertions.assertNumberOfIdleLinkValues(
      TimeframeFacetSelectors,
      defaultNumberOfValues - 1
    );
    TimeframeFacetAssertions.assertFacetValueContainsText(
      2,
      `Past ${unitFrames[2].unit}`
    );
  });
});
