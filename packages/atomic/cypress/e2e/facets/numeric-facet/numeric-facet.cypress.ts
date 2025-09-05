import {TagProps, TestFixture} from '../../../fixtures/test-fixture';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox-actions';
import * as BreadboxAssertions from '../../breadbox-assertions';
import {breadboxComponent, BreadboxSelectors} from '../../breadbox-selectors';
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
  addNumericFacet,
  addNumericFacetWithRange,
  clickApplyButton,
  defaultNumberOfValues,
  numericFacetField,
  inputMaxValue,
  inputMinValue,
  invokeSubmitButton,
  numericFacetLabel,
  NumericRange,
  numericRanges,
} from './numeric-facet-actions';
import * as NumericFacetAssertions from './numeric-facet-assertions';
import {
  numericFacetComponent,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

describe.skip('Numeric Facet V1 Test Suites', () => {
  const min = 0;
  const max = 100000;
  const minDecimal = 1.5;
  const maxDecimal = 3.5;
  describe('with automatic ranges generate', () => {
    function setupAutomaticRangesWithCheckboxValues() {
      new TestFixture()
        .with(
          addNumericFacet({field: numericFacetField, label: numericFacetLabel})
        )
        .init();
    }
    describe('with checkbox values', () => {
      describe('verify rendering', () => {
        beforeEach(setupAutomaticRangesWithCheckboxValues);

        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
        CommonAssertions.assertContainsComponentError(
          NumericFacetSelectors,
          false
        );
        CommonFacetAssertions.assertLabelContains(
          NumericFacetSelectors,
          numericFacetLabel
        );
        CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, true);
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          NumericFacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
          NumericFacetSelectors,
          8
        );
        CommonFacetAssertions.assertDisplayClearButton(
          NumericFacetSelectors,
          false
        );
        NumericFacetAssertions.assertDisplayRangeInput(false);
      });

      describe('when selecting a value', () => {
        const selectionIndex = 2;
        function setupSelectCheckboxValue() {
          setupAutomaticRangesWithCheckboxValues();
          selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectCheckboxValue);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          CommonFacetAssertions.assertDisplayClearButton(
            NumericFacetSelectors,
            true
          );
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            NumericFacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
            NumericFacetSelectors,
            defaultNumberOfValues - 1
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupSelectCheckboxValue);
          NumericFacetAssertions.assertLogNumericFacetSelect(
            numericFacetField,
            selectionIndex
          );
        });

        describe('when selecting a second value', () => {
          const secondSelectionIndex = 0;
          function setupSelectSecondCheckboxValue() {
            setupSelectCheckboxValue();
            selectIdleCheckboxValueAt(
              NumericFacetSelectors,
              secondSelectionIndex
            );
          }

          describe('verify rendering', () => {
            beforeEach(setupSelectSecondCheckboxValue);
            CommonAssertions.assertAccessibility(numericFacetComponent);
            CommonFacetAssertions.assertDisplayClearButton(
              NumericFacetSelectors,
              true
            );
            CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
              NumericFacetSelectors,
              2
            );
            CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
              NumericFacetSelectors,
              defaultNumberOfValues - 2
            );
          });

          describe('verify analytics', () => {
            beforeEach(setupSelectSecondCheckboxValue);
            NumericFacetAssertions.assertLogNumericFacetSelect(
              numericFacetField,
              secondSelectionIndex
            );
          });

          describe('when selecting the "Clear filter" button', () => {
            function setupClearCheckboxValues() {
              setupSelectSecondCheckboxValue();
              pressClearButton(NumericFacetSelectors);
            }
            describe('verify rendering', () => {
              beforeEach(setupClearCheckboxValues);

              CommonFacetAssertions.assertDisplayClearButton(
                NumericFacetSelectors,
                false
              );
              CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
                NumericFacetSelectors,
                0
              );
              CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
                NumericFacetSelectors,
                8
              );
              CommonFacetAssertions.assertFocusHeader(NumericFacetSelectors);
            });

            describe('verify analytics', () => {
              beforeEach(setupClearCheckboxValues);
              CommonFacetAssertions.assertLogClearFacetValues(
                numericFacetField
              );
            });
          });
        });
      });

      describe('with custom #withInput', () => {
        function setupAutomaticRangesWithCheckboxValuesAndInputRange(
          inputType = 'integer'
        ) {
          new TestFixture()
            .with(
              addNumericFacet({
                field: numericFacetField,
                label: numericFacetLabel,
                'with-input': inputType,
              })
            )
            .init();
        }

        describe('when #withInput is integer', () => {
          beforeEach(() => {
            setupAutomaticRangesWithCheckboxValuesAndInputRange();
          });
          NumericFacetAssertions.assertDisplayRangeInput(true);
        });

        describe('when #withInput is decimal', () => {
          beforeEach(() => {
            setupAutomaticRangesWithCheckboxValuesAndInputRange('decimal');
          });
          NumericFacetAssertions.assertDisplayRangeInput(true);
        });

        describe('when select a valid range', () => {
          beforeEach(() => {
            setupAutomaticRangesWithCheckboxValuesAndInputRange();
            inputMinValue(min);
            inputMaxValue(max);
            clickApplyButton(true);
          });
          CommonFacetAssertions.assertDisplayValues(
            NumericFacetSelectors,
            false
          );
        });
      });
    });

    describe('with link value', () => {
      function setupAutomaticRangesWithLinkValues() {
        new TestFixture()
          .with(
            addNumericFacet({
              field: numericFacetField,
              label: numericFacetLabel,
              'display-values-as': 'link',
            })
          )
          .init();
      }
      describe('verify rendering', () => {
        beforeEach(setupAutomaticRangesWithLinkValues);
        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
        CommonAssertions.assertContainsComponentError(
          NumericFacetSelectors,
          false
        );
        CommonFacetAssertions.assertLabelContains(
          NumericFacetSelectors,
          numericFacetLabel
        );
        CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, true);
        CommonFacetAssertions.assertNumberOfSelectedLinkValues(
          NumericFacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfIdleLinkValues(
          NumericFacetSelectors,
          defaultNumberOfValues
        );
        CommonFacetAssertions.assertDisplayClearButton(
          NumericFacetSelectors,
          false
        );
        NumericFacetAssertions.assertDisplayRangeInput(false);
      });

      describe('when selecting a value', () => {
        const selectionIndex = 2;
        function setupSelectLinkValue() {
          setupAutomaticRangesWithLinkValues();
          selectIdleLinkValueAt(NumericFacetSelectors, selectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectLinkValue);
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          CommonFacetAssertions.assertDisplayClearButton(
            NumericFacetSelectors,
            true
          );
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            NumericFacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            NumericFacetSelectors,
            defaultNumberOfValues - 1
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupSelectLinkValue);
          NumericFacetAssertions.assertLogNumericFacetSelect(
            numericFacetField,
            selectionIndex
          );
        });

        describe('when select a 2nd link', () => {
          const secondSelectionIndex = 0;
          function setupSecondLinkValue() {
            setupSelectLinkValue();
            selectIdleLinkValueAt(NumericFacetSelectors, secondSelectionIndex);
          }

          describe('verify rendering', () => {
            beforeEach(setupSecondLinkValue);
            CommonAssertions.assertAccessibility(numericFacetComponent);
            CommonFacetAssertions.assertNumberOfSelectedLinkValues(
              NumericFacetSelectors,
              1
            );
            CommonFacetAssertions.assertNumberOfIdleLinkValues(
              NumericFacetSelectors,
              defaultNumberOfValues - 1
            );
          });

          describe('verify analytics', () => {
            beforeEach(setupSecondLinkValue);
            NumericFacetAssertions.assertLogNumericFacetSelect(
              numericFacetField,
              secondSelectionIndex
            );
          });
        });
      });

      describe('with custom #withInput', () => {
        function setupAutomaticRangesWithLinkValuesAndInputRange(
          inputType = 'integer'
        ) {
          new TestFixture()
            .with(
              addNumericFacet({
                field: numericFacetField,
                label: numericFacetLabel,
                'display-values-as': 'link',
                'with-input': inputType,
              })
            )
            .init();
        }

        describe('when #withInput is integer', () => {
          beforeEach(() => {
            setupAutomaticRangesWithLinkValuesAndInputRange();
          });
          NumericFacetAssertions.assertDisplayRangeInput(true);
        });

        describe('when #withInput is decimal', () => {
          beforeEach(() => {
            setupAutomaticRangesWithLinkValuesAndInputRange('decimal');
          });
          NumericFacetAssertions.assertDisplayRangeInput(true);
        });

        describe('when select a valid range', () => {
          beforeEach(() => {
            setupAutomaticRangesWithLinkValuesAndInputRange();
            inputMinValue(min);
            inputMaxValue(max);
            clickApplyButton(true);
          });
          CommonFacetAssertions.assertDisplayValues(
            NumericFacetSelectors,
            false
          );
        });
      });
    });
  });

  describe('with custom ranges', () => {
    const numberOfCustomRanges = numericRanges.length;
    function setupCustomRangesWithCheckboxValues() {
      new TestFixture()
        .with(
          addNumericFacetWithRange(
            {field: numericFacetField, label: numericFacetLabel},
            numericRanges
          )
        )
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupCustomRangesWithCheckboxValues);
      CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
      CommonAssertions.assertAccessibility(numericFacetComponent);
      CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
        NumericFacetSelectors,
        0
      );
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        NumericFacetSelectors,
        numberOfCustomRanges
      );
      CommonFacetAssertions.assertDisplayClearButton(
        NumericFacetSelectors,
        false
      );
    });
  });

  describe('with custom #withInput only', () => {
    function setupRangesWithInputOnly(inputType = 'integer') {
      new TestFixture()
        .with(
          addNumericFacet({
            field: numericFacetField,
            label: numericFacetLabel,
            'with-input': inputType,
            'number-of-values': 0,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(() => {
        setupRangesWithInputOnly();
      });
      NumericFacetAssertions.assertDisplayRangeInput(true);
      NumericFacetAssertions.assertDisplayApplyButton(true);
      CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, false);
    });

    describe('verify input form', () => {
      describe('when min & max input is empty', () => {
        beforeEach(() => {
          setupRangesWithInputOnly();
          invokeSubmitButton();
          clickApplyButton(false);
        });
        NumericFacetAssertions.assertDisplayInputWarning(2);
      });

      describe('when max input is empty', () => {
        beforeEach(() => {
          setupRangesWithInputOnly();
          inputMinValue(min);
          invokeSubmitButton();
          clickApplyButton(false);
        });
        NumericFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when min input is empty', () => {
        beforeEach(() => {
          setupRangesWithInputOnly('decimal');
          inputMaxValue(maxDecimal);
          invokeSubmitButton();
          clickApplyButton(false);
        });
        NumericFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when max input is invalid', () => {
        beforeEach(() => {
          setupRangesWithInputOnly();
          inputMaxValue('a');
          invokeSubmitButton();
          clickApplyButton(false);
        });
        NumericFacetAssertions.assertDisplayInputWarning(2);
      });

      describe('when min input is bigger than max input', () => {
        beforeEach(() => {
          setupRangesWithInputOnly();
          inputMinValue(max);
          inputMaxValue(min);
          invokeSubmitButton();
          clickApplyButton(false);
        });
        NumericFacetAssertions.assertDisplayInputWarning(
          2,
          `Value must be less than or equal to ${min}.`
        );
      });
    });

    describe('when submitting a valid range', () => {
      function setupNumericValidRange(
        inputType = 'integer',
        fieldInput = numericFacetField,
        start = min,
        end = max
      ) {
        new TestFixture()
          .with(
            addNumericFacet({
              field: fieldInput,
              label: numericFacetLabel,
              'with-input': inputType,
              'number-of-values': 0,
            })
          )
          .init();
        inputMinValue(start);
        inputMaxValue(end);
        clickApplyButton(true);
      }

      describe('with #inputDefault is "integer"', () => {
        describe('verify rendering', () => {
          beforeEach(() => {
            setupNumericValidRange();
          });
          NumericFacetAssertions.assertURLHash(
            `${numericFacetField}_input`,
            `${min}...${max}`
          );
        });

        describe('verify analytics', () => {
          beforeEach(() => {
            setupNumericValidRange();
          });
          NumericFacetAssertions.assertLogNumericFacetInputSubmit(
            numericFacetField,
            min,
            max
          );
        });
      });

      describe('with #inputDefault is "decimal"', () => {
        const decimalField = 'snrating';
        describe('verify rendering', () => {
          beforeEach(() => {
            setupNumericValidRange(
              'decimal',
              decimalField,
              minDecimal,
              maxDecimal
            );
          });
          NumericFacetAssertions.assertURLHash(
            `${decimalField}_input`,
            `${minDecimal}...${maxDecimal}`
          );
        });

        describe('verify analytics', () => {
          beforeEach(() => {
            setupNumericValidRange(
              'decimal',
              decimalField,
              minDecimal,
              maxDecimal
            );
          });
          NumericFacetAssertions.assertLogNumericFacetInputSubmit(
            decimalField,
            minDecimal,
            maxDecimal
          );
        });
      });

      describe('verify visibility of range input', () => {
        const activeInput = `nf-${numericFacetField}_input=0..1000`;

        const visibilitySetup = () =>
          new TestFixture().with(
            addNumericFacet({
              field: numericFacetField,
              label: numericFacetLabel,
              'with-input': 'integer',
            })
          );

        describe('with no query results', () => {
          const baseSetup = () => visibilitySetup().withNoResults();

          before(() => {
            baseSetup().init();
          });

          NumericFacetAssertions.assertDisplayRangeInput(false);

          describe('with active input', () => {
            beforeEach(() => {
              baseSetup().withHash(activeInput).init();
            });
            NumericFacetAssertions.assertDisplayRangeInput(true);
          });
        });

        describe('with no facet results', () => {
          const baseSetup = () =>
            visibilitySetup().withCustomResponse((r) => {
              r.facets.forEach((facet, i) => {
                if (
                  facet.facetId !== numericFacetField &&
                  facet.facetId !== `${numericFacetField}_input`
                ) {
                  r.facets[i].values = [];
                }
              });
            });

          before(() => {
            baseSetup().init();
          });

          NumericFacetAssertions.assertDisplayRangeInput(false);

          describe('with active input', () => {
            beforeEach(() => {
              baseSetup().withHash(activeInput).init();
            });

            NumericFacetAssertions.assertDisplayRangeInput(true);
          });
        });
      });
    });

    describe('with a selected path in the URL', () => {
      function setupNumericInput() {
        new TestFixture()
          .with(
            addNumericFacet({
              field: numericFacetField,
              label: numericFacetLabel,
              'with-input': 'integer',
            })
          )
          .withHash(`nf-${numericFacetField}_input=${min}..${max}`)
          .init();
      }

      beforeEach(setupNumericInput);

      NumericFacetAssertions.assertDisplayRangeInput(true);
      NumericFacetAssertions.assertDisplayApplyButton(true);
      NumericFacetAssertions.assertMinInputValue(min);
      NumericFacetAssertions.assertMaxInputValue(max);
      CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, false);
    });

    describe('with invalid #withInput', () => {
      beforeEach(() => {
        setupRangesWithInputOnly('true');
      });
      NumericFacetAssertions.assertDisplayRangeInput(false);
      CommonAssertions.assertContainsComponentError(
        NumericFacetSelectors,
        true
      );
    });
  });

  describe('with custom #numberOfValues', () => {
    const customNumberOfValues = 5;
    function setupRangesWithCustomNumberOfValues() {
      new TestFixture()
        .with(
          addNumericFacet({
            field: numericFacetField,
            label: numericFacetLabel,
            'number-of-values': customNumberOfValues,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupRangesWithCustomNumberOfValues);
      CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
      CommonAssertions.assertAccessibility(numericFacetComponent);
      CommonAssertions.assertContainsComponentError(
        NumericFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(
        NumericFacetSelectors,
        numericFacetLabel
      );
      CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, true);
      CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
        NumericFacetSelectors,
        0
      );
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        NumericFacetSelectors,
        customNumberOfValues
      );
    });
  });

  describe('with custom #sortCriteria, descending', () => {
    function setupRangesWithCustomSortCriteria() {
      new TestFixture()
        .with(
          addNumericFacet({
            field: numericFacetField,
            label: numericFacetLabel,
            'sort-criteria': 'descending',
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupRangesWithCustomSortCriteria);
      CommonAssertions.assertAccessibility(numericFacetComponent);
      NumericFacetAssertions.assertValueSortedByDescending();
    });
  });

  describe('when no search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addNumericFacet({field: numericFacetField, label: numericFacetLabel})
        )
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(NumericFacetSelectors, true);
  });

  describe('with a field that returns no result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addNumericFacet({
            field: 'thisfielddoesnotexist',
            label: numericFacetLabel,
          })
        )
        .init();
    });
    CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(
      NumericFacetSelectors,
      false
    );
    CommonAssertions.assertContainsComponentError(NumericFacetSelectors, false);
  });

  describe('with an invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addNumericFacet({
            field: numericFacetField,
            label: numericFacetLabel,
            'sort-criteria': 'invalid',
          })
        )
        .init();
    });
    CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(NumericFacetSelectors, true);
  });

  describe('with a selected path in the URL', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addNumericFacet({field: numericFacetField, label: numericFacetLabel})
        )
        .withHash(`nf-${numericFacetField}=0..100000`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      NumericFacetSelectors,
      1
    );
    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      NumericFacetSelectors,
      defaultNumberOfValues - 1
    );
    CommonFacetAssertions.assertFirstValueContains(
      NumericFacetSelectors,
      '0 to 100,000'
    );
  });

  describe('with custom #rangeAlgorithm', () => {
    describe('with #even value option', () => {
      function setupNumericWithEvenRangeAlgorithm() {
        new TestFixture()
          .with(
            addNumericFacet({
              field: numericFacetField,
              label: numericFacetLabel,
              'range-algorithm': 'even',
            })
          )
          .init();
      }
      describe('verify rendering', () => {
        beforeEach(setupNumericWithEvenRangeAlgorithm);
        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
        NumericFacetAssertions.assertEqualRange();
      });
    });
    describe('with #equiprobable option', () => {
      function setupNumericWithEquiprobableRangeAlgorithm() {
        new TestFixture()
          .with(
            addNumericFacet({
              field: numericFacetField,
              label: numericFacetLabel,
              'range-algorithm': 'equiprobable',
            })
          )
          .init();
      }
      describe('verify rendering', () => {
        beforeEach(setupNumericWithEquiprobableRangeAlgorithm);
        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
      });
    });
  });

  describe('with custom unit format', () => {
    const customField = 'snrating';
    const customLabel = 'Rating';
    const customRanges: NumericRange[] = [
      {
        start: 0,
        end: 2.5,
      },
      {
        start: 2.5,
        end: 3.5,
      },
      {
        start: 3.5,
        end: 5.1,
      },
    ];

    describe('with automatic numeric range with checkbox', () => {
      function setupNumericFacetWithCustomFormat(
        formatTag: string,
        formatProp: TagProps
      ) {
        new TestFixture()
          .with(
            addNumericFacet(
              {field: customField, label: customLabel},
              formatTag,
              formatProp
            )
          )
          .init();
      }

      describe('with custom format currency CAD', () => {
        function setupNumericCustomFormatCurrency() {
          setupNumericFacetWithCustomFormat('atomic-format-currency', {
            currency: 'CAD',
          });
        }

        describe('verify rendering', () => {
          beforeEach(setupNumericCustomFormatCurrency);
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          CommonAssertions.assertContainsComponentError(
            NumericFacetSelectors,
            false
          );
          CommonFacetAssertions.assertLabelContains(
            NumericFacetSelectors,
            customLabel
          );
          CommonFacetAssertions.assertDisplayValues(
            NumericFacetSelectors,
            true
          );
          NumericFacetAssertions.assertCurrencyFormat();
        });

        describe('when select a value', () => {
          const selectionIndex = 1;
          function setupSelectCheckboxValue() {
            setupNumericCustomFormatCurrency();
            selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
          }

          describe('verify rendering', () => {
            beforeEach(setupSelectCheckboxValue);
            CommonAssertions.assertAccessibility(numericFacetComponent);
            CommonFacetAssertions.assertDisplayClearButton(
              NumericFacetSelectors,
              true
            );
            CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
              NumericFacetSelectors,
              1
            );
          });
        });
      });

      describe('with custom format unit Kilogram', () => {
        describe('with custom unitDisplay "Long"', () => {
          const formatUnitKgLong = {unit: 'kilogram', 'unit-display': 'long'};
          beforeEach(() => {
            setupNumericFacetWithCustomFormat(
              'atomic-format-unit',
              formatUnitKgLong
            );
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          NumericFacetAssertions.assertUnitFormatKgLong();
        });

        describe('with custom unitDisplay "Narrow"', () => {
          const formatUnitLiterNarrow = {
            unit: 'kilogram',
            'unit-display': 'narrow',
          };
          beforeEach(() => {
            setupNumericFacetWithCustomFormat(
              'atomic-format-unit',
              formatUnitLiterNarrow
            );
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          NumericFacetAssertions.assertUnitFormatKgNarrow();
        });
      });

      describe('with custom format number', () => {
        describe('with custom #minimumIntegerDigits', () => {
          beforeEach(() => {
            setupNumericFacetWithCustomFormat('atomic-format-number', {
              'minimum-integer-digits': 5,
            });
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          NumericFacetAssertions.assertFormatNumberMinimumIntegerDigits(5);
        });

        describe('with custom #minimumFractionDigits & #maximumFractionDigits', () => {
          const min = 2;
          const max = 4;
          beforeEach(() => {
            setupNumericFacetWithCustomFormat('atomic-format-number', {
              'minimum-fraction-digits': min,
              'maximum-fraction-digits': max,
            });
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          NumericFacetAssertions.assertFormatNumberMinimumMaxFractionDigits(
            min,
            max
          );
        });

        describe('with custom #minimumSignificantDigits & #maximumSignificantDigits', () => {
          const min = 3;
          const max = 5;
          beforeEach(() => {
            setupNumericFacetWithCustomFormat('atomic-format-number', {
              'minimum-significant-digits': min,
              'maximum-significant-digits': max,
            });
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          NumericFacetAssertions.assertFormatNumberMinimumMaxSignificantDigits(
            min,
            max
          );
        });
      });
    });

    describe('with custom numeric range with linkValue', () => {
      const numberOfCustomRanges = customRanges.length;
      function setupNumericFacetWithCustomRangeAndCustomFormat(
        formatTag: string,
        formatProp: TagProps
      ) {
        new TestFixture()
          .with(
            addNumericFacetWithRange(
              {
                field: customField,
                label: customLabel,
                'display-values-as': 'link',
              },
              customRanges,
              formatTag,
              formatProp
            )
          )
          .init();
      }

      describe('with custom format currency CAD', () => {
        function setupNumericCustomFormatCurrency() {
          setupNumericFacetWithCustomRangeAndCustomFormat(
            'atomic-format-currency',
            {
              currency: 'CAD',
            }
          );
        }

        describe('verify rendering', () => {
          beforeEach(setupNumericCustomFormatCurrency);
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          CommonAssertions.assertContainsComponentError(
            NumericFacetSelectors,
            false
          );
          CommonFacetAssertions.assertLabelContains(
            NumericFacetSelectors,
            customLabel
          );
          CommonFacetAssertions.assertDisplayValues(
            NumericFacetSelectors,
            true
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            NumericFacetSelectors,
            numberOfCustomRanges
          );
          NumericFacetAssertions.assertCurrencyFormat();
        });

        describe('when select a value', () => {
          const selectionIndex = 1;
          function setupSelectLinkValue() {
            setupNumericCustomFormatCurrency();
            selectIdleLinkValueAt(NumericFacetSelectors, selectionIndex);
          }

          describe('verify rendering', () => {
            beforeEach(setupSelectLinkValue);
            CommonFacetAssertions.assertDisplayFacet(
              NumericFacetSelectors,
              true
            );
            CommonAssertions.assertAccessibility(numericFacetComponent);
            CommonFacetAssertions.assertNumberOfSelectedLinkValues(
              NumericFacetSelectors,
              1
            );
            NumericFacetAssertions.assertCurrencyFormat();
          });
        });
      });

      describe('with custom format unit Kilogram', () => {
        describe('with custom unitDisplay "Long"', () => {
          const formatUnitKgLong = {unit: 'kilogram', 'unit-display': 'long'};
          beforeEach(() => {
            setupNumericFacetWithCustomRangeAndCustomFormat(
              'atomic-format-unit',
              formatUnitKgLong
            );
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          CommonAssertions.assertAccessibility(numericFacetComponent);
          NumericFacetAssertions.assertUnitFormatKgLong();
        });
      });

      describe('with custom format number', () => {
        describe('with custom #minimumFractionDigits & #maximumFractionDigits', () => {
          const min = 2;
          const max = 4;
          beforeEach(() => {
            setupNumericFacetWithCustomRangeAndCustomFormat(
              'atomic-format-number',
              {
                'minimum-fraction-digits': min,
                'maximum-fraction-digits': max,
              }
            );
          });
          CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
          NumericFacetAssertions.assertFormatNumberMinimumMaxFractionDigits(
            min,
            max
          );
        });
      });
    });
  });

  describe('with breadbox', () => {
    function setupBreadboxWithNumericFacet() {
      new TestFixture()
        .with(addBreadbox())
        .with(
          addNumericFacet(
            {field: numericFacetField, label: numericFacetLabel},
            'atomic-format-currency',
            {
              currency: 'CAD',
            }
          )
        )
        .init();
    }
    describe('verify rendering', () => {
      beforeEach(setupBreadboxWithNumericFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a numeric facetValue', () => {
      const selectionIndex = 2;
      function setupSelectedNumericFacetValue() {
        setupBreadboxWithNumericFacet();
        selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
      }

      describe('verify rendering', () => {
        beforeEach(() => {
          setupSelectedNumericFacetValue();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
          NumericFacetSelectors,
          numericFacetLabel
        );
        BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      });

      describe('when deselecting a facetValue on breadcrumb', () => {
        const deselectionIndex = 0;
        function setupDeselectNumericFacetValue() {
          setupSelectedNumericFacetValue();
          deselectBreadcrumbAtIndex(deselectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(() => {
            setupDeselectNumericFacetValue();
            cy.wait(TestFixture.interceptAliases.Search);
          });
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytic', () => {
          beforeEach(setupDeselectNumericFacetValue);
          BreadboxAssertions.assertLogBreadcrumbFacet(numericFacetField);
        });

        describe('verify selected facetValue', () => {
          beforeEach(setupSelectedNumericFacetValue);
          BreadboxAssertions.assertDeselectCheckboxFacet(
            NumericFacetSelectors,
            deselectionIndex
          );
        });
      });
    });

    describe('when selecting 2 facetValues of numeric facet with custom format number', () => {
      const index = [0, 1];
      function setupSelectedMultipleNumericFacetValues() {
        new TestFixture()
          .with(addBreadbox())
          .with(
            addNumericFacet(
              {field: numericFacetField, label: numericFacetLabel},
              'atomic-format-number',
              {
                'minimum-fraction-digits': 1,
                'maximum-fraction-digits': 4,
              }
            )
          )
          .init();
        index.forEach((position, i) => {
          selectIdleCheckboxValueAt(NumericFacetSelectors, position);
          BreadboxSelectors.breadcrumbButton().should('have.length', i + 1);
        });
      }

      describe('verify rendering', () => {
        beforeEach(() => {
          setupSelectedMultipleNumericFacetValues();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
          NumericFacetSelectors,
          numericFacetLabel
        );
        BreadboxAssertions.assertDisplayBreadcrumbShowMore(false);
        BreadboxAssertions.assertBreadcrumbDisplayLength(index.length);
      });
    });
  });

  describe('with depends-on', () => {
    const facetId = 'abc';
    const parentFacetId = 'def';
    const parentField = 'filetype';
    const expectedValue = 'YouTubeVideo';
    describe('as a dependent, without an input', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addNumericFacet({
              'facet-id': facetId,
              field: numericFacetField,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        NumericFacetSelectors.withId(facetId),
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
          NumericFacetSelectors.withId(facetId),
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
            addNumericFacet({
              'facet-id': facetId,
              field: numericFacetField,
              'with-input': 'integer',
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        NumericFacetSelectors.withId(facetId),
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
          NumericFacetSelectors.withId(facetId),
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
            addNumericFacet({
              'facet-id': facetId,
              field: numericFacetField,
              'number-of-values': '0',
              'with-input': 'integer',
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      CommonFacetAssertions.assertDisplayFacet(
        NumericFacetSelectors.withId(facetId),
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
          NumericFacetSelectors.withId(facetId),
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
            addNumericFacet({
              'facet-id': 'ghi',
              field: numericFacetField,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        NumericFacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
