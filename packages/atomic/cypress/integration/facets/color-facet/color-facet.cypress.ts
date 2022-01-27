import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addColorFacet,
  colorFacetDefaultNumberOfValues,
  colorFacetField,
  colorFacetLabel,
  selectIdleBoxValueAt,
} from './color-facet-actions';
import {
  colorFacetComponent,
  ColorFacetSelectors,
} from './color-facet-selectors';
import {
  pressClearButton,
  pressLabelButton,
  pressShowLess,
  pressShowMore,
  typeFacetSearchQuery,
} from '../facet-common-actions';
import * as FacetAssertions from '../facet/facet-assertions';
import * as ColorFacetAssertions from './color-facet-assertions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import * as BreadboxAssertions from '../../breadbox/breadbox-assertions';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox/breadbox-actions';
import {
  breadboxComponent,
  BreadboxSelectors,
} from '../../breadbox/breadbox-selectors';
import {AnalyticsTracker} from '../../../utils/analyticsUtils';

describe('Color Facet Test Suites', () => {
  describe('with default setting', () => {
    function setupColorFacet() {
      new TestFixture()
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupColorFacet);
      CommonAssertions.assertAccessibility(colorFacetComponent);
      CommonAssertions.assertContainsComponentError(ColorFacetSelectors, false);
      CommonFacetAssertions.assertLabelContains(
        ColorFacetSelectors,
        colorFacetLabel
      );
      CommonFacetAssertions.assertDisplayValues(ColorFacetSelectors, true);
      ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
      ColorFacetAssertions.assertNumberOfIdleBoxValues(
        colorFacetDefaultNumberOfValues
      );
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
          colorFacetDefaultNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        before(setupSelectBoxValue);
        ColorFacetAssertions.assertLogColorFacetSelect(
          colorFacetField,
          selectionIndex
        );
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondBoxValue() {
          setupSelectBoxValue();
          selectIdleBoxValueAt(secondSelectionIndex);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondBoxValue);

          CommonFacetAssertions.assertDisplayClearButton(
            ColorFacetSelectors,
            true
          );
          ColorFacetAssertions.assertNumberOfSelectedBoxValues(2);
          ColorFacetAssertions.assertNumberOfIdleBoxValues(
            colorFacetDefaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondBoxValue);

          ColorFacetAssertions.assertLogColorFacetSelect(
            colorFacetField,
            secondSelectionIndex
          );
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            setupSelectSecondBoxValue();
            pressClearButton(ColorFacetSelectors);
          }

          describe('verify rendering', () => {
            before(setupClearBoxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              ColorFacetSelectors,
              false
            );
            ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
            ColorFacetAssertions.assertNumberOfIdleBoxValues(
              colorFacetDefaultNumberOfValues
            );
            CommonFacetAssertions.assertFocusHeader(ColorFacetSelectors);
          });

          describe('verify analytics', () => {
            before(setupClearBoxValues);

            CommonFacetAssertions.assertLogClearFacetValues(colorFacetField);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'html';
        function setupSearchFor() {
          setupSelectBoxValue();
          typeFacetSearchQuery(ColorFacetSelectors, query, true);
        }

        describe('verify rendering', () => {
          before(setupSearchFor);

          CommonAssertions.assertAccessibility(colorFacetComponent);
          ColorFacetAssertions.assertNumberOfIdleBoxValues(1);
          CommonFacetAssertions.assertDisplaySearchClearButton(
            ColorFacetSelectors,
            true
          );
          CommonFacetAssertions.assertHighlightsResults(
            ColorFacetSelectors,
            query
          );
        });

        describe('verify analytics', () => {
          before(setupSearchFor);

          CommonFacetAssertions.assertLogFacetSearch(colorFacetField);
        });

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            AnalyticsTracker.reset();
            selectIdleBoxValueAt(0);
          }

          describe('verify rendering', () => {
            before(setupSelectSearchResult);
            ColorFacetAssertions.assertNumberOfSelectedBoxValues(2);
            ColorFacetAssertions.assertNumberOfIdleBoxValues(
              colorFacetDefaultNumberOfValues - 2
            );
            CommonFacetAssertions.assertSearchInputEmpty(ColorFacetSelectors);
          });

          describe('verify analytics', () => {
            before(setupSelectSearchResult);
            ColorFacetAssertions.assertLogColorFacetSelect(colorFacetField, 0);
          });
        });
      });
    });
  });

  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore() {
      new TestFixture()
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .init();
      pressShowMore(ColorFacetSelectors);
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
        colorFacetDefaultNumberOfValues * 2
      );
      CommonFacetAssertions.assertFocusShowMore(ColorFacetSelectors);
    });
    describe('verify analytics', () => {
      before(setupSelectShowMore);
      FacetAssertions.assertLogFacetShowMore(colorFacetField);
    });

    describe('when there\'s no more "Show more" button', () => {
      function setupRepeatShowMore() {
        new TestFixture()
          .with(
            addColorFacet({
              field: 'month',
              label: colorFacetLabel,
            })
          )
          .init();
        ColorFacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupRepeatShowMore);

        CommonFacetAssertions.assertDisplayShowMoreButton(
          ColorFacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          ColorFacetSelectors,
          true
        );
        CommonFacetAssertions.assertFocusShowLess(ColorFacetSelectors);
      });
    });

    describe('when selecting the "Show less" button', () => {
      function setupSelectShowLess() {
        setupSelectShowMore();
        pressShowLess(ColorFacetSelectors);
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
        ColorFacetAssertions.assertNumberOfIdleBoxValues(
          colorFacetDefaultNumberOfValues
        );
      });

      describe('verify analytics', () => {
        before(setupSelectShowLess);
        FacetAssertions.assertLogFacetShowLess(colorFacetField);
      });
    });
  });

  describe('when selecting the label button to collapse', () => {
    function setupSelectLabelCollapse() {
      new TestFixture()
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .init();
      selectIdleBoxValueAt(1);
      pressLabelButton(ColorFacetSelectors, true);
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
      CommonFacetAssertions.assertLabelContains(
        ColorFacetSelectors,
        colorFacetLabel
      );
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
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
            'number-of-values': numberOfValues,
          })
        )
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
        pressShowMore(ColorFacetSelectors);
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
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
            'with-search': 'false',
          })
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(ColorFacetSelectors, false);
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    before(() => {
      new TestFixture()
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
            'sort-criteria': 'alphanumeric',
          })
        )
        .init();
    });

    ColorFacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .withHash(`f[${colorFacetField}]=YouTubeVideo`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
    ColorFacetAssertions.assertNumberOfSelectedBoxValues(1);
    ColorFacetAssertions.assertNumberOfIdleBoxValues(
      colorFacetDefaultNumberOfValues - 1
    );
    CommonFacetAssertions.assertFirstValueContains(
      ColorFacetSelectors,
      'YouTubeVideo'
    );
  });

  describe('with an invalid option', () => {
    before(() => {
      new TestFixture()
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
            'sort-criteria': 'nononono',
          })
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(ColorFacetSelectors, true);
  });

  describe('when field returns no results', () => {
    before(() => {
      new TestFixture()
        .with(
          addColorFacet({field: 'notanactualfield', label: colorFacetLabel})
        )
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(ColorFacetSelectors, false);
    CommonAssertions.assertContainsComponentError(ColorFacetSelectors, false);
  });

  describe('with custom css color', () => {
    const colorFacetStyle = `atomic-color-facet::part(value-YouTubeVideo) {
      background-color:red
    }`;

    function generateCustomCSS() {
      new TestFixture()
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .withStyle(colorFacetStyle)
        .withHash(`f[${colorFacetField}]=YouTubeVideo`)
        .init();
    }
    describe('verify rendering', () => {
      before(generateCustomCSS);
      CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
      ColorFacetAssertions.assertBackgroundButtonColorRed();
    });
  });

  describe('with breadbox', () => {
    function setupBreadboxWithColorFacet() {
      new TestFixture()
        .with(addBreadbox())
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .init();
    }
    describe('verify rendering', () => {
      before(setupBreadboxWithColorFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a facetValue', () => {
      const selectionIndex = 2;

      function setupSelectedColorFacet() {
        setupBreadboxWithColorFacet();
        selectIdleBoxValueAt(selectionIndex);
      }

      describe('verify rendering', () => {
        before(setupSelectedColorFacet);
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedColorFacetsInBreadcrumb();
        BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      });

      describe('when deselecting a facetValue on breadcrumb', () => {
        const deselectionIndex = 0;
        function setupDeselectColorFacetValue() {
          setupSelectedColorFacet();
          deselectBreadcrumbAtIndex(deselectionIndex);
        }

        describe('verify rendering', () => {
          before(setupDeselectColorFacetValue);
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytic', () => {
          before(setupDeselectColorFacetValue);
          BreadboxAssertions.assertLogBreadcrumbFacet(colorFacetField);
        });

        describe('verify selected facetValue', () => {
          before(setupSelectedColorFacet);
          BreadboxAssertions.assertDeselectColorFacet(deselectionIndex);
        });
      });
    });

    describe('when select 3 facetValues', () => {
      const positions = [0, 1, 2];
      function setupSelectedMulitpleColorFacets() {
        setupBreadboxWithColorFacet();
        positions.forEach((position, i) => {
          selectIdleBoxValueAt(position);
          BreadboxSelectors.breadcrumbButton().should('have.length', i + 1);
        });
      }

      describe('verify rendering', () => {
        before(setupSelectedMulitpleColorFacets);
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedColorFacetsInBreadcrumb();
        BreadboxAssertions.assertDisplayBreadcrumbShowMore(false);
        BreadboxAssertions.assertBreadcrumbDisplayLength(positions.length);
      });
    });
  });
});
