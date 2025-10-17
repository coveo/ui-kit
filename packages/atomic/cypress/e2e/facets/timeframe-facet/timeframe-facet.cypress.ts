import dayjs from 'dayjs';
import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox-actions';
import * as BreadboxAssertions from '../../breadbox-assertions';
import {breadboxComponent} from '../../breadbox-selectors';
import * as CommonAssertions from '../../common-assertions';
import {
  pressClearButton,
  selectIdleLinkValueAt,
  selectIdleCheckboxValueAt,
  typeFacetSearchQuery,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet} from '../facet/facet-actions';
import {FacetSelectors} from '../facet/facet-selectors';
import {
  addTimeframeFacet,
  timeframeFacetField,
  inputStartDate,
  timeframeFacetLabel,
  unitFrames,
  clickApplyButton,
  inputEndDate,
  invokeSubmitButton,
  UnitRange,
} from './timeframe-facet-action';
import * as TimeframeFacetAssertions from './timeframe-facet-assertions';
import {
  timeframeFacetComponent,
  TimeframeFacetSelectors,
} from './timeframe-facet-selectors';

const startDate = '2020-08-06';
const endDate = '2021-09-03';

describe.skip('Timeframe Facet V1 Test Suites', () => {
  const defaultNumberOfValues = unitFrames.length;
  describe('does not throw on init when there is no filter and timeframe configured', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addTimeframeFacet({label: timeframeFacetLabel}))
        .init();
    });

    CommonAssertions.assertConsoleError(false);
  });

  describe('with custom #sortCriteria, ascending', () => {
    const periodFrames: UnitRange[] = [
      {period: 'past', unit: 'year', amount: 10},
      {period: 'past', unit: 'month', amount: 1},
      {period: 'past', unit: 'quarter', amount: 1},
    ];
    function setupTimeframeWithCustomSortCriteria() {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {
              label: timeframeFacetLabel,
              field: timeframeFacetField,
              'sort-criteria': 'ascending',
            },
            periodFrames
          )
        )
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupTimeframeWithCustomSortCriteria);
      TimeframeFacetAssertions.assertValuesMatchExpectedOrder([
        'Past 10 years',
        'Past quarter',
        'Past month',
      ]);
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
    });
  });
  describe('with default "date" field timeframe-facet', () => {
    function setupTimeframeFacet() {
      new TestFixture()
        .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupTimeframeFacet);
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
      }
      describe('verify rendering', () => {
        beforeEach(setupSelectLinkValue);
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
        beforeEach(setupSelectLinkValue);
        TimeframeFacetAssertions.assertLogTimeframeFacetSelect(
          timeframeFacetField,
          unitFrames[selectionIndex].unit,
          unitFrames[selectionIndex].period,
          unitFrames[selectionIndex].amount
        );
      });

      describe('when select a 2nd link', () => {
        const secondSelectionIndex = 0;
        function setupSecondLinkValue() {
          setupSelectLinkValue();
          selectIdleLinkValueAt(TimeframeFacetSelectors, secondSelectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSecondLinkValue);
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
          beforeEach(setupSecondLinkValue);
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
            pressClearButton(TimeframeFacetSelectors);
          }
          describe('verify rendering', () => {
            beforeEach(setupClearCheckboxValues);

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
            beforeEach(setupClearCheckboxValues);
            CommonFacetAssertions.assertLogClearFacetValues(
              timeframeFacetField
            );
          });
        });

        describe('with custom #withInput', () => {});
      });
    });

    describe('with custom #withInput', () => {
      const addTimeFrameWithInputRange = () => (fixture: TestFixture) => {
        fixture.with(
          addTimeframeFacet(
            {
              label: timeframeFacetLabel,
              field: timeframeFacetField,
              'with-date-picker': '',
            },
            unitFrames
          )
        );
      };

      describe('verify rendering', () => {
        beforeEach(() => {
          new TestFixture().with(addTimeFrameWithInputRange()).init();
        });
        TimeframeFacetAssertions.assertDisplayRangeInput(true);
      });

      describe('with a date range in the hash', () => {
        beforeEach(() => {
          new TestFixture()
            .with(addTimeFrameWithInputRange())
            .withHash(
              `df-date_input=${startDate.replaceAll(
                '-',
                '/'
              )}@00:00:00..${endDate.replaceAll('-', '/')}@00:00:00`
            )
            .init();
        });

        TimeframeFacetAssertions.assertMinInputValue(startDate);
        TimeframeFacetAssertions.assertMaxInputValue(endDate);
      });

      describe('when select a valid range', () => {
        function setupInputRange() {
          new TestFixture().with(addTimeFrameWithInputRange()).init();
          inputStartDate(startDate);
          inputEndDate(endDate);
          clickApplyButton();
        }

        describe('verify rendering', () => {
          beforeEach(setupInputRange);
          TimeframeFacetAssertions.assertRangeHash(startDate, endDate, true);
          TimeframeFacetAssertions.assertDisplayRangeInput(true);
          CommonFacetAssertions.assertDisplayValues(
            TimeframeFacetSelectors,
            false
          );
        });

        describe('verify analytic', () => {
          beforeEach(setupInputRange);
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
      beforeEach(setupTimeframeFacet);
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
    function setupTimeframeWithInputOnly(props = {}) {
      new TestFixture()
        .with(
          addTimeframeFacet({
            label: timeframeFacetLabel,
            field: timeframeFacetField,
            'with-date-picker': 'true',
            ...props,
          })
        )
        .init();
    }
    describe('verify rendering', () => {
      beforeEach(() => {
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
        beforeEach(() => {
          setupTimeframeWithInputOnly();
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(2);
      });

      describe('when "end" input is empty', () => {
        beforeEach(() => {
          setupTimeframeWithInputOnly();
          inputStartDate(startDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when "start" input is empty', () => {
        beforeEach(() => {
          setupTimeframeWithInputOnly();
          inputEndDate(endDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when "start" input is bigger than "end" input', () => {
        beforeEach(() => {
          setupTimeframeWithInputOnly();
          inputStartDate(endDate);
          inputEndDate(startDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(2, 'or earlier.');
      });

      describe('when "min" is set on the input date', () => {
        const min = dayjs(startDate).format('YYYY-MM-DD');
        beforeEach(() => {
          setupTimeframeWithInputOnly({
            min,
          });
          inputStartDate(dayjs(min).subtract(1, 'day').format('YYYY-MM-DD'));
          inputEndDate(endDate);
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(1, 'or later');
      });

      describe('when "max" is set on the input date', () => {
        const max = dayjs(endDate).format('YYYY-MM-DD');
        beforeEach(() => {
          setupTimeframeWithInputOnly({
            max,
          });
          inputStartDate(startDate);
          inputEndDate(dayjs(max).add(1, 'day').format('YYYY-MM-DD'));
          invokeSubmitButton();
          clickApplyButton();
        });
        TimeframeFacetAssertions.assertDisplayInputWarning(1, 'or earlier');
      });
    });
  });

  describe('with custom #amount timeframe', () => {
    const periodFrames = [
      {period: 'past', unit: 'month', amount: 20},
      {period: 'past', unit: 'year', amount: 3},
      {period: 'past', unit: 'year', amount: 5},
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
      beforeEach(setupTimeframeFacetCustomAmount);
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
      beforeEach(setupTimeframeFacetCustomAmount);
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
    beforeEach(() => {
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
    beforeEach(() => {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {
              field: 'thisfielddoesnotexist',
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
    beforeEach(() => {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {
              field: timeframeFacetField,
              label: timeframeFacetLabel,
            },
            invalidFrames as UnitRange[]
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
    beforeEach(() => {
      new TestFixture()
        .with(
          addTimeframeFacet(
            {label: timeframeFacetLabel, field: timeframeFacetField},
            unitFrames
          )
        )
        .withHash(`df-${timeframeFacetField}=past-1-month..now`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(TimeframeFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedLinkValues(
      TimeframeFacetSelectors,
      1
    );
    TimeframeFacetAssertions.assertFacetValueContainsText(
      2,
      `Past ${unitFrames[2].amount} ${unitFrames[2].unit}s`
    );
  });

  describe('with breadbox', () => {
    function setupBreadboxWithTimeframeFacet() {
      new TestFixture()
        .with(addBreadbox())
        .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
        .init();
    }
    describe('verify rendering', () => {
      beforeEach(setupBreadboxWithTimeframeFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a facetValue', () => {
      const selectionIndex = 2;
      function setupSelectedTimeframeFacetValue() {
        setupBreadboxWithTimeframeFacet();
        selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
      }

      describe('verify rendering', () => {
        beforeEach(() => {
          setupSelectedTimeframeFacetValue();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedLinkFacetsInBreadcrumb(
          TimeframeFacetSelectors
        );
        BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      });

      describe('when deselecting a facetValue on breadcrumb', () => {
        const deselectionIndex = 0;
        function setupDeselectTimeframeFacetValue() {
          setupSelectedTimeframeFacetValue();
          deselectBreadcrumbAtIndex(deselectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(() => {
            setupDeselectTimeframeFacetValue();
            cy.wait(TestFixture.interceptAliases.Search);
          });
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytic', () => {
          beforeEach(setupDeselectTimeframeFacetValue);
          BreadboxAssertions.assertLogBreadcrumbFacet(timeframeFacetField);
        });

        describe('verify selected facetValue', () => {
          beforeEach(setupSelectedTimeframeFacetValue);
          BreadboxAssertions.assertDeselectLinkFacet(
            TimeframeFacetSelectors,
            deselectionIndex
          );
        });
      });

      describe('when selecting a value from custom timeframe', () => {
        const selectionIndex = 0;
        const periodFrames = [
          {unit: 'month', amount: 20},
          {unit: 'year', amount: 3},
        ];
        function setupBreadboxWithCustomTimeframeFacet() {
          new TestFixture()
            .with(addBreadbox())
            .with(
              addTimeframeFacet(
                {label: timeframeFacetLabel},
                periodFrames as UnitRange[]
              )
            )
            .init();
          selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupBreadboxWithCustomTimeframeFacet);
          CommonAssertions.assertAccessibility(breadboxComponent);
          BreadboxAssertions.assertDisplayBreadcrumb(true);
          BreadboxAssertions.assertSelectedLinkFacetsInBreadcrumb(
            TimeframeFacetSelectors
          );
        });
      });
    });
  });

  describe('with depends-on', () => {
    const facetId = 'abc';
    const parentFacetId = 'def';
    const parentField = 'filetype';
    const expectedValue = 'rssitem';
    describe('as a dependent, without an input', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addTimeframeFacet(
              {
                'facet-id': facetId,
                field: timeframeFacetField,
                [`depends-on-${parentFacetId}`]: expectedValue,
              },
              unitFrames
            )
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        TimeframeFacetSelectors.withId(facetId),
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
          TimeframeFacetSelectors.withId(facetId),
          true
        );
        CommonFacetAssertions.assertDisplayFacet(
          FacetSelectors.withId(parentFacetId),
          true
        );
      });
    });

    describe('as a dependent, with a facet and an input', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addTimeframeFacet(
              {
                'facet-id': facetId,
                field: timeframeFacetField,
                'with-date-picker': '',
                [`depends-on-${parentFacetId}`]: expectedValue,
              },
              unitFrames
            )
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        TimeframeFacetSelectors.withId(facetId),
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
          TimeframeFacetSelectors.withId(facetId),
          true
        );
        CommonFacetAssertions.assertDisplayFacet(
          FacetSelectors.withId(parentFacetId),
          true
        );
      });
    });

    describe('as a dependent, without a facet', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addTimeframeFacet({
              'facet-id': facetId,
              field: timeframeFacetField,
              'with-date-picker': '',
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        TimeframeFacetSelectors.withId(facetId),
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
          TimeframeFacetSelectors.withId(facetId),
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
            addTimeframeFacet({
              'facet-id': 'ghi',
              field: timeframeFacetField,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        TimeframeFacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
