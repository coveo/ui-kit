import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addNumericFacet,
  addNumericFacetWithRange,
  applyInputRange,
  clickApplyButton,
  defaultNumberOfValues,
  field,
  inputMaxValue,
  inputMinValue,
  invokeSubmitButton,
  label,
  numericRanges,
} from './numeric-facet-actions';
import {
  numericFacetComponent,
  NumericFacetSelectors,
} from './numeric-facet-selectors';
import {
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
} from '../facet-common-actions';
import * as NumericFacetAssertions from './numeric-facet-assertions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';

describe('Numeric Facet V1 Test Suites', () => {
  describe('with automatic ranges generate', () => {
    function setupAutomaticRangesWithCheckboxValues() {
      new TestFixture().with(addNumericFacet({field, label})).init();
    }
    describe('with checkbox values', () => {
      describe('verify rendering', () => {
        before(setupAutomaticRangesWithCheckboxValues);

        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
        CommonAssertions.assertContainsComponentError(
          NumericFacetSelectors,
          false
        );
        CommonFacetAssertions.assertLabelContains(NumericFacetSelectors, label);
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
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectCheckboxValue);
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
          before(setupSelectCheckboxValue);
          NumericFacetAssertions.assertLogNumericFacetSelect(
            field,
            selectionIndex
          );
        });

        describe('when selecting a second value', () => {
          const secondSelectionIndex = 0;
          function setupSelectSecondCheckboxValue() {
            setupSelectCheckboxValue();
            cy.wait(TestFixture.interceptAliases.UA);
            selectIdleCheckboxValueAt(
              NumericFacetSelectors,
              secondSelectionIndex
            );
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupSelectSecondCheckboxValue);
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

          describe('verfify analytics', () => {
            before(setupSelectSecondCheckboxValue);
            NumericFacetAssertions.assertLogNumericFacetSelect(
              field,
              secondSelectionIndex
            );
          });

          describe('when selecting the "Clear filter" button', () => {
            function setupClearCheckboxValues() {
              setupSelectSecondCheckboxValue();
              cy.wait(TestFixture.interceptAliases.UA);
              NumericFacetSelectors.clearButton().click();
              cy.wait(TestFixture.interceptAliases.Search);
            }
            describe('verify rendering', () => {
              before(setupClearCheckboxValues);

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
            });

            describe('verify analytics', () => {
              before(setupClearCheckboxValues);
              CommonFacetAssertions.assertLogClearFacetValues(field);
            });
          });
        });
      });

      describe('with custom #withInput to true', () => {
        function setupAutomaticRangesWithCheckboxValuesAndInputRange() {
          new TestFixture()
            .with(addNumericFacet({field, label, 'with-input': 'true'}))
            .init();
        }
        before(setupAutomaticRangesWithCheckboxValuesAndInputRange);
        NumericFacetAssertions.assertDisplayRangeInput(true);
      });
    });

    describe('with link value', () => {
      function setupAutomaticRangesWithLinkValues() {
        new TestFixture()
          .with(addNumericFacet({field, label, 'display-values-as': 'link'}))
          .init();
      }
      describe('verify rendering', () => {
        before(setupAutomaticRangesWithLinkValues);
        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
        CommonAssertions.assertContainsComponentError(
          NumericFacetSelectors,
          false
        );
        CommonFacetAssertions.assertLabelContains(NumericFacetSelectors, label);
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
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectLinkValue);
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
          before(setupSelectLinkValue);
          NumericFacetAssertions.assertLogNumericFacetSelect(
            field,
            selectionIndex
          );
        });

        describe('when select a 2nd link', () => {
          const secondSelectionIndex = 0;
          function setupSecondLinkValue() {
            setupSelectLinkValue();
            cy.wait(TestFixture.interceptAliases.UA);
            selectIdleLinkValueAt(NumericFacetSelectors, secondSelectionIndex);
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupSecondLinkValue);
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

          describe('versify analytics', () => {
            before(setupSecondLinkValue);
            NumericFacetAssertions.assertLogNumericFacetSelect(
              field,
              secondSelectionIndex
            );
          });
        });
      });
    });
  });

  describe('with custom ranges generate', () => {
    const numberOfCustomRanges = numericRanges.length;
    function setupCustomRangesWithCheckboxValues() {
      new TestFixture()
        .with(addNumericFacetWithRange({field, label}, numericRanges))
        .init();
    }

    describe('verify rendering', () => {
      before(setupCustomRangesWithCheckboxValues);
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

    describe('when selecting a value', () => {
      const selectionIndex = 1;
      function setupSelectCheckboxValue() {
        setupCustomRangesWithCheckboxValues();
        selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectCheckboxValue);
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
          numberOfCustomRanges - 1
        );
        CommonFacetAssertions.assertDisplayClearButton(
          NumericFacetSelectors,
          true
        );
      });

      describe('verify analytics', () => {
        before(setupSelectCheckboxValue);
        NumericFacetAssertions.assertLogNumericFacetSelect(
          field,
          selectionIndex
        );
      });
    });
  });

  describe('with custom #withInput only', () => {
    const min = 0;
    const max = 100000;
    function setupRangesWithInputOnly() {
      new TestFixture()
        .with(
          addNumericFacet({
            field,
            label,
            'with-input': 'true',
            'number-of-values': 0,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      before(setupRangesWithInputOnly);
      NumericFacetAssertions.assertDisplayRangeInput(true);
      NumericFacetAssertions.assertDisplayApplyButton(true);
      CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, false);
    });

    describe('verify input form', () => {
      describe('when min & max input is empty', () => {
        before(() => {
          setupRangesWithInputOnly();
          invokeSubmitButton();
          clickApplyButton();
        });
        NumericFacetAssertions.assertDisplayInputWarning(2);
      });

      describe('when max input is empty', () => {
        before(() => {
          setupRangesWithInputOnly();
          inputMinValue(min);
          invokeSubmitButton();
          clickApplyButton();
        });
        NumericFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when min input is empty', () => {
        before(() => {
          setupRangesWithInputOnly();
          inputMaxValue(max);
          invokeSubmitButton();
          clickApplyButton();
        });
        NumericFacetAssertions.assertDisplayInputWarning(1);
      });

      describe('when max input is invalid', () => {
        before(() => {
          setupRangesWithInputOnly();
          inputMaxValue('a');
          invokeSubmitButton();
          clickApplyButton();
        });
        NumericFacetAssertions.assertDisplayInputWarning(2);
      });

      describe('when min input is bigger than max input', () => {
        before(() => {
          setupRangesWithInputOnly();
          inputMinValue(max);
          inputMaxValue(min);
          invokeSubmitButton();
          clickApplyButton();
        });
        NumericFacetAssertions.assertDisplayInputWarning(
          2,
          `Value must be less than or equal to ${max}.`
        );
      });
    });

    describe('when submitting an valid range', () => {
      function setupNumericValidRange() {
        new TestFixture()
          .with(
            addNumericFacet({
              field,
              label,
              'with-input': 'true',
              'number-of-values': 0,
            })
          )
          .init();
        inputMinValue(min);
        inputMaxValue(max);
        clickApplyButton();
      }

      describe('verify rendering', () => {
        before(setupNumericValidRange);
        NumericFacetAssertions.assertURLHash(field, `${min}..${max}`);
      });

      describe.skip('verify analytic', () => {
        before(setupNumericValidRange);
        NumericFacetAssertions.assertLogNumericFacetInputSubmit(
          field,
          min,
          max
        );
      });
    });

    describe('with a selected path in the URL', () => {
      function setupNumericInput() {
        new TestFixture()
          .with(
            addNumericFacet({
              field,
              label,
              'with-input': 'true',
            })
          )
          .withHash(`nf[${field}_input]=${min}..${max}`)
          .init();
      }

      before(setupNumericInput);

      NumericFacetAssertions.assertDisplayRangeInput(true);
      NumericFacetAssertions.assertDisplayApplyButton(true);
      NumericFacetAssertions.assertMinInputValue(min);
      NumericFacetAssertions.assertMaxInputValue(max);
      CommonFacetAssertions.assertDisplayValues(NumericFacetSelectors, false);
    });
  });

  describe('with custom #numberOfValues', () => {
    const customNumberOfValues = 5;
    function setupRangesWithCustomNumberOfValues() {
      new TestFixture()
        .with(
          addNumericFacet({
            field,
            label,
            'number-of-values': customNumberOfValues,
          })
        )
        .init();
    }

    describe('verify rendering', () => {
      before(setupRangesWithCustomNumberOfValues);
      CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
      CommonAssertions.assertAccessibility(numericFacetComponent);
      CommonAssertions.assertContainsComponentError(
        NumericFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(NumericFacetSelectors, label);
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

    describe('when selecting a value', () => {
      const selectionIndex = 3;
      function setupSelectCheckboxValue() {
        setupRangesWithCustomNumberOfValues();
        selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectCheckboxValue);
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
          customNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        before(setupSelectCheckboxValue);
        NumericFacetAssertions.assertLogNumericFacetSelect(
          field,
          selectionIndex
        );
      });
    });
  });

  describe('with custom #sortCriteria, descending', () => {
    function setupRangesWithCustomSortCriterias() {
      new TestFixture()
        .with(addNumericFacet({field, label, 'sort-criteria': 'descending'}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupRangesWithCustomSortCriterias);
      CommonAssertions.assertAccessibility(numericFacetComponent);
      NumericFacetAssertions.assertValueSortedByDescending();
    });
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addNumericFacet({field, label}))
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(NumericFacetSelectors, true);
  });

  describe('with a field that returns no result', () => {
    before(() => {
      new TestFixture()
        .with(
          addNumericFacet({
            field: 'dafsfs',
            label,
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
    before(() => {
      new TestFixture()
        .with(
          addNumericFacet({
            field,
            label,
            'sort-criteria': 'invalid',
          })
        )
        .init();
    });
    CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(NumericFacetSelectors, true);
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(addNumericFacet({field, label}))
        .withHash(`nf[${field}]=0..100000`)
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
          .with(addNumericFacet({field, label, 'range-algorithm': 'even'}))
          .init();
      }
      describe('verify rendering', () => {
        before(setupNumericWithEvenRangeAlgorithm);
        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
        NumericFacetAssertions.assertEqualRange();
      });
    });
    describe('with #equiprobable option', () => {
      function setupNumericWithEquiprobableRangeAlgorithm() {
        new TestFixture()
          .with(
            addNumericFacet({field, label, 'range-algorithm': 'equiprobable'})
          )
          .init();
      }
      describe('verify rendering', () => {
        before(setupNumericWithEquiprobableRangeAlgorithm);
        CommonFacetAssertions.assertDisplayFacet(NumericFacetSelectors, true);
        CommonAssertions.assertAccessibility(numericFacetComponent);
      });
    });
  });
});
