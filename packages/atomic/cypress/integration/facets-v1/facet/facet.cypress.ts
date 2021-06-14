import {TestFixture} from '../../../fixtures/test-fixture';
import {FacetSelectors} from './facet-selectors';
import {
  addFacet,
  field,
  label,
  defaultNumberOfValues,
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
  selectIdleBoxValueAt,
} from './facet-actions';
import * as FacetAssertions from './facet-assertions';

describe('Facet v1 Test Suites', () => {
  describe('with checkbox values', () => {
    function setupWithCheckboxValues() {
      new TestFixture().with(addFacet({field, label})).init();
      cy.wait(TestFixture.interceptAliases.UA);
    }

    describe('verify rendering', () => {
      before(setupWithCheckboxValues);

      FacetAssertions.assertAccessibility();
      FacetAssertions.assertContainsComponentError(false);
      FacetAssertions.assertDisplayFacet(true);
      FacetAssertions.assertDisplayValues(true);
      FacetAssertions.assertDisplayPlaceholder(false);
      FacetAssertions.assertNumberOfSelectedCheckboxValues(0);
      FacetAssertions.assertNumberOfIdleCheckboxValues(defaultNumberOfValues);
      FacetAssertions.assertDisplayShowMoreButton(true);
      FacetAssertions.assertDisplayShowLessButton(false);
      FacetAssertions.assertLabelContains(label);
      FacetAssertions.assertDisplayClearButton(false);
      FacetAssertions.assertDisplaySearchInput(true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectCheckboxValue() {
        setupWithCheckboxValues();
        selectIdleCheckboxValueAt(selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectCheckboxValue);

        FacetAssertions.assertAccessibility();
        FacetAssertions.assertDisplayClearButton(true);
        FacetAssertions.assertNumberOfSelectedCheckboxValues(1);
        FacetAssertions.assertNumberOfIdleCheckboxValues(
          defaultNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        before(setupSelectCheckboxValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondCheckboxValue() {
          setupSelectCheckboxValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleCheckboxValueAt(secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondCheckboxValue);

          FacetAssertions.assertDisplayClearButton(true);
          FacetAssertions.assertNumberOfSelectedCheckboxValues(2);
          FacetAssertions.assertNumberOfIdleCheckboxValues(
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondCheckboxValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearCheckboxValues() {
            setupSelectSecondCheckboxValue();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearCheckboxValues);

            FacetAssertions.assertDisplayClearButton(false);
            FacetAssertions.assertNumberOfSelectedCheckboxValues(0);
            FacetAssertions.assertNumberOfIdleCheckboxValues(
              defaultNumberOfValues
            );
          });
          describe('verify analytics', () => {
            before(setupClearCheckboxValues);

            FacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });
    });
  });

  describe('with link values', () => {
    function setupWithLinkValues() {
      new TestFixture()
        .with(addFacet({field, label, 'display-values-as': 'link'}))
        .init();
      cy.wait(TestFixture.interceptAliases.UA);
    }

    describe('verify rendering', () => {
      before(setupWithLinkValues);

      FacetAssertions.assertAccessibility();
      FacetAssertions.assertDisplayValues(true);
      FacetAssertions.assertNumberOfSelectedLinkValues(0);
      FacetAssertions.assertNumberOfIdleLinkValues(defaultNumberOfValues);
      FacetAssertions.assertDisplayClearButton(false);
      FacetAssertions.assertDisplaySearchInput(true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectLinkValue() {
        setupWithLinkValues();
        selectIdleLinkValueAt(selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectLinkValue);

        FacetAssertions.assertAccessibility();
        FacetAssertions.assertDisplayClearButton(true);
        FacetAssertions.assertNumberOfSelectedLinkValues(1);
        FacetAssertions.assertNumberOfIdleLinkValues(defaultNumberOfValues - 1);
      });

      describe('verify analytics', () => {
        before(setupSelectLinkValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondLinkValue() {
          setupSelectLinkValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleLinkValueAt(secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondLinkValue);

          FacetAssertions.assertDisplayClearButton(true);
          FacetAssertions.assertNumberOfSelectedLinkValues(1);
          FacetAssertions.assertNumberOfIdleLinkValues(
            defaultNumberOfValues - 1
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondLinkValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearLinkValues() {
            setupSelectSecondLinkValue();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearLinkValues);

            FacetAssertions.assertDisplayClearButton(false);
            FacetAssertions.assertNumberOfSelectedLinkValues(0);
            FacetAssertions.assertNumberOfIdleLinkValues(defaultNumberOfValues);
          });
          describe('verify analytics', () => {
            before(setupClearLinkValues);

            FacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });
    });
  });

  describe('with box values', () => {
    function setupWithBoxValues() {
      new TestFixture()
        .with(addFacet({field, label, 'display-values-as': 'box'}))
        .init();
      cy.wait(TestFixture.interceptAliases.UA);
    }

    describe('verify rendering', () => {
      before(setupWithBoxValues);

      FacetAssertions.assertAccessibility();
      FacetAssertions.assertDisplayValues(true);
      FacetAssertions.assertNumberOfSelectedBoxValues(0);
      FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
      FacetAssertions.assertDisplayClearButton(false);
      FacetAssertions.assertDisplaySearchInput(true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectBoxValue() {
        setupWithBoxValues();
        selectIdleBoxValueAt(selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectBoxValue);

        FacetAssertions.assertAccessibility();
        FacetAssertions.assertDisplayClearButton(true);
        FacetAssertions.assertNumberOfSelectedBoxValues(1);
        FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
      });

      describe('verify analytics', () => {
        before(setupSelectBoxValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondBoxValue() {
          setupSelectBoxValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleBoxValueAt(secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondBoxValue);

          FacetAssertions.assertDisplayClearButton(true);
          FacetAssertions.assertNumberOfSelectedBoxValues(2);
          FacetAssertions.assertNumberOfIdleBoxValues(
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondBoxValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            setupSelectSecondBoxValue();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearBoxValues);

            FacetAssertions.assertDisplayClearButton(false);
            FacetAssertions.assertNumberOfSelectedBoxValues(0);
            FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          });

          describe('verify analytics', () => {
            before(setupClearBoxValues);

            FacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });
    });
  });

  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore() {
      new TestFixture().with(addFacet({field, label})).init();
      cy.wait(TestFixture.interceptAliases.UA);
      FacetSelectors.showMoreButton().click();
      cy.wait(TestFixture.interceptAliases.Search);
    }

    describe('verify rendering', () => {
      before(setupSelectShowMore);

      FacetAssertions.assertDisplayShowMoreButton(true);
      FacetAssertions.assertDisplayShowLessButton(true);
      FacetAssertions.assertValuesSortedAlphanumerically();
      FacetAssertions.assertNumberOfIdleCheckboxValues(
        defaultNumberOfValues * 2
      );
    });

    describe('verify analytics', () => {
      before(setupSelectShowMore);

      FacetAssertions.assertLogFacetShowMore(field);
    });

    describe('when selecting the "Show less" button', () => {
      function setupSelectShowLess() {
        setupSelectShowMore();
        cy.wait(TestFixture.interceptAliases.UA);
        FacetSelectors.showLessButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectShowLess);

        FacetAssertions.assertDisplayShowMoreButton(true);
        FacetAssertions.assertDisplayShowLessButton(false);
        FacetAssertions.assertNumberOfIdleCheckboxValues(defaultNumberOfValues);
      });

      describe('verify analytics', () => {
        before(setupSelectShowLess);

        FacetAssertions.assertLogFacetShowLess(field);
      });
    });
  });

  describe('when selecting the label button to collapse', () => {
    function setupSelectLabelCollapse() {
      new TestFixture().with(addFacet({field, label})).init();
      cy.wait(TestFixture.interceptAliases.UA);
      selectIdleCheckboxValueAt(0);
      cy.wait(TestFixture.interceptAliases.Search);
      FacetSelectors.labelButton().click();
    }

    before(setupSelectLabelCollapse);

    FacetAssertions.assertAccessibility();
    FacetAssertions.assertContainsComponentError(false);
    FacetAssertions.assertDisplayFacet(true);
    FacetAssertions.assertDisplayClearButton(true);
    FacetAssertions.assertDisplaySearchInput(false);
    FacetAssertions.assertDisplayValues(false);
    FacetAssertions.assertDisplayShowMoreButton(false);
    FacetAssertions.assertDisplayShowLessButton(false);
    FacetAssertions.assertLabelContains(label);

    describe('when selecting the label button to expand', () => {
      function setupSelectLabelExpand() {
        setupSelectLabelCollapse();
        FacetSelectors.labelButton().click();
      }

      before(setupSelectLabelExpand);

      FacetAssertions.assertDisplayClearButton(true);
      FacetAssertions.assertDisplaySearchInput(true);
      FacetAssertions.assertDisplayValues(true);
      FacetAssertions.assertDisplayShowMoreButton(true);
    });
  });

  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addFacet({field, label, 'number-of-values': numberOfValues}))
        .init();
      cy.wait(TestFixture.interceptAliases.UA);
    }

    before(setupCustomNumberOfValues);

    FacetAssertions.assertNumberOfIdleCheckboxValues(numberOfValues);
    FacetAssertions.assertDisplayShowMoreButton(true);
    FacetAssertions.assertDisplayShowLessButton(false);

    describe('when selecting the "Show More" button', () => {
      before(() => {
        setupCustomNumberOfValues();
        FacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.UA);
      });

      FacetAssertions.assertNumberOfIdleCheckboxValues(numberOfValues * 2);
      FacetAssertions.assertDisplayShowMoreButton(true);
      FacetAssertions.assertDisplayShowLessButton(true);
    });
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'alphanumeric'}))
        .init();
      cy.wait(TestFixture.interceptAliases.UA);
    });

    FacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with custom #sortCriteria, occurrences', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
      cy.wait(TestFixture.interceptAliases.UA);
    });

    FacetAssertions.assertValuesSortedByOccurences();
  });

  describe.skip('with #withSearch to false', () => {});

  describe.skip('when no search has yet been executed', () => {});

  describe.skip('with an invalid option', () => {});

  describe.skip('when field returns no results', () => {});

  describe.skip('with a selected path in the URL', () => {});
});
