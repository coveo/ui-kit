import {TestFixture} from '../../../fixtures/test-fixture';
import {FacetSelectors} from './facet-selectors';
import {
  addFacet,
  field,
  label,
  defaultNumberOfValues,
  selectIdleCheckboxValueAt,
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

    describe('when selecting the "Show more" button', () => {
      function setupSelectShowMore() {
        setupWithCheckboxValues();
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
          FacetAssertions.assertNumberOfIdleCheckboxValues(
            defaultNumberOfValues
          );
        });

        describe('verify analytics', () => {
          before(setupSelectShowLess);

          FacetAssertions.assertLogFacetShowLess(field);
        });
      });
    });
  });

  describe.skip('with link values', () => {});

  describe.skip('with box values', () => {});

  describe.skip('when being collapsed', () => {});

  describe.skip('with custom #numberOfValues', () => {});

  describe.skip('with custom #sortCriteria, alphanumeric', () => {});

  describe.skip('with custom #sortCriteria, occurrences', () => {});

  describe.skip('with #withSearch to false', () => {});

  describe.skip('when no search has yet been executed', () => {});

  describe.skip('with an invalid option', () => {});

  describe.skip('when field returns no results', () => {});

  describe.skip('with a selected path in the URL', () => {});
});
