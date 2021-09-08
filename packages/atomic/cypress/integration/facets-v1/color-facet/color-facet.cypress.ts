import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addColorFacet,
  customSript,
  defaultNumberOfValues,
  field,
  label,
  selectIdleBoxValueAt,
} from './color-facet-actions';
import {
  colorFacetComponent,
  ColorFacetSelectors,
} from './color-facet-selectors';

import * as FacetAssertions from '../facet/facet-assertions';
import * as ColorFacetAssertions from './color-facet-assertions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';

describe('Color Facet Test Suites', () => {
  describe('with default setting', () => {
    function setupColorFacet() {
      new TestFixture().with(addColorFacet({field, label})).init();
    }

    describe('verify rendering', () => {
      before(setupColorFacet);
      CommonAssertions.assertAccessibility(colorFacetComponent);
      CommonAssertions.assertContainsComponentError(ColorFacetSelectors, false);
      CommonFacetAssertions.assertLabelContains(ColorFacetSelectors, label);
      CommonFacetAssertions.assertDisplayValues(ColorFacetSelectors, true);
      ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
      ColorFacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
      CommonFacetAssertions.assertDisplayClearButton(
        ColorFacetSelectors,
        false
      );
      CommonFacetAssertions.assertDisplaySearchInput(ColorFacetSelectors, true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectBoxValue() {
        setupColorFacet();
        selectIdleBoxValueAt(selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectBoxValue);
        CommonAssertions.assertAccessibility(colorFacetComponent);
        CommonFacetAssertions.assertDisplayClearButton(
          ColorFacetSelectors,
          true
        );
        ColorFacetAssertions.assertNumberOfSelectedBoxValues(1);
        ColorFacetAssertions.assertNumberOfIdleBoxValues(
          defaultNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        before(setupSelectBoxValue);
        ColorFacetAssertions.assertLogColorFacetSelect(field, selectionIndex);
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

          CommonFacetAssertions.assertDisplayClearButton(
            ColorFacetSelectors,
            true
          );
          ColorFacetAssertions.assertNumberOfSelectedBoxValues(2);
          ColorFacetAssertions.assertNumberOfIdleBoxValues(
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondBoxValue);

          ColorFacetAssertions.assertLogColorFacetSelect(
            field,
            secondSelectionIndex
          );
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            setupSelectSecondBoxValue();
            cy.wait(TestFixture.interceptAliases.UA);
            ColorFacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearBoxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              ColorFacetSelectors,
              false
            );
            ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
            ColorFacetAssertions.assertNumberOfIdleBoxValues(
              defaultNumberOfValues
            );
          });

          describe('verify analytics', () => {
            before(setupClearBoxValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {});
    });
  });

  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore() {
      new TestFixture().with(addColorFacet({field, label})).init();
      ColorFacetSelectors.showMoreButton().click();
      cy.wait(TestFixture.interceptAliases.Search);
    }

    describe('verify rendering', () => {
      before(setupSelectShowMore);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        ColorFacetSelectors,
        true
      );
      CommonFacetAssertions.assertDisplayShowLessButton(
        ColorFacetSelectors,
        true
      );
      //   CommonAssertions.assertAccessibility(colorFacetComponent);
      ColorFacetAssertions.assertValuesSortedAlphanumerically();
      ColorFacetAssertions.assertNumberOfIdleBoxValues(
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
        ColorFacetSelectors.showLessButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectShowLess);
        CommonAssertions.assertAccessibility(colorFacetComponent);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          ColorFacetSelectors,
          true
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          ColorFacetSelectors,
          false
        );
        ColorFacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
      });

      describe('verify analytics', () => {
        before(setupSelectShowLess);
        FacetAssertions.assertLogFacetShowLess(field);
      });
    });
  });

  describe('when selecting the label button to collapse', () => {
    function setupSelectLabelCollapse() {
      new TestFixture().with(addColorFacet({field, label})).init();
      selectIdleBoxValueAt(1);
      cy.wait(TestFixture.interceptAliases.Search);
      ColorFacetSelectors.labelButton().click();
    }

    describe('verify rendering', () => {
      before(setupSelectLabelCollapse);
      CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
      CommonAssertions.assertAccessibility(colorFacetComponent);
      CommonAssertions.assertContainsComponentError(ColorFacetSelectors, false);
      CommonFacetAssertions.assertDisplayClearButton(ColorFacetSelectors, true);
      CommonFacetAssertions.assertDisplaySearchInput(
        ColorFacetSelectors,
        false
      );
      CommonFacetAssertions.assertDisplayValues(ColorFacetSelectors, false);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        ColorFacetSelectors,
        false,
        false
      );
      CommonFacetAssertions.assertDisplayShowLessButton(
        ColorFacetSelectors,
        false,
        false
      );
      CommonFacetAssertions.assertLabelContains(ColorFacetSelectors, label);
    });

    describe('when selecting the label button to expand', () => {
      function setupSelectLabelExpand() {
        setupSelectLabelCollapse();
        ColorFacetSelectors.labelButton().click();
      }

      before(setupSelectLabelExpand);

      CommonFacetAssertions.assertDisplayClearButton(ColorFacetSelectors, true);
      CommonFacetAssertions.assertDisplaySearchInput(ColorFacetSelectors, true);
      CommonFacetAssertions.assertDisplayValues(ColorFacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        ColorFacetSelectors,
        true
      );
    });
    ColorFacetSelectors;
  });

  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addColorFacet({field, label, 'number-of-values': numberOfValues}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupCustomNumberOfValues);

      ColorFacetAssertions.assertNumberOfIdleBoxValues(numberOfValues);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        ColorFacetSelectors,
        true
      );
      CommonFacetAssertions.assertDisplayShowLessButton(
        ColorFacetSelectors,
        false
      );
    });

    describe('when selecting the "Show More" button', () => {
      before(() => {
        setupCustomNumberOfValues();
        ColorFacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.UA);
      });

      ColorFacetAssertions.assertNumberOfIdleBoxValues(numberOfValues * 2);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        ColorFacetSelectors,
        true
      );
      CommonFacetAssertions.assertDisplayShowLessButton(
        ColorFacetSelectors,
        true
      );
    });
  });

  describe('with #withSearch to false', () => {
    before(() => {
      new TestFixture()
        .with(addColorFacet({field, label, 'with-search': 'false'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(ColorFacetSelectors, false);
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    before(() => {
      new TestFixture()
        .with(addColorFacet({field, label, 'sort-criteria': 'alphanumeric'}))
        .init();
    });

    ColorFacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(addColorFacet({field, label}))
        .withHash(`f[${field}]=YouTubeVideo`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
    ColorFacetAssertions.assertNumberOfSelectedBoxValues(1);
    ColorFacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
    CommonFacetAssertions.assertFirstValueContains(
      ColorFacetSelectors,
      'YouTubeVideo'
    );
  });

  describe('with an invalid option', () => {
    before(() => {
      new TestFixture()
        .with(addColorFacet({field, label, 'sort-criteria': 'nononono'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(ColorFacetSelectors, true);
  });

  describe('when field returns no results', () => {
    before(() => {
      new TestFixture()
        .with(addColorFacet({field: 'notanactualfield', label}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(ColorFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(ColorFacetSelectors, false);
  });

  describe('with custom css color', () => {
    function generateCustomCSS() {
      new TestFixture()
        .with(addColorFacet({field, label}))
        .withStyle(customSript)
        .withHash(`f[${field}]=YouTubeVideo`)
        .init();
    }
    describe('verify rendering', () => {
      before(generateCustomCSS);
      CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
      ColorFacetAssertions.assertBackgroundButtonColorRed();
    });
  });
});
