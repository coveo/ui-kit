import {FacetValue} from '@coveo/headless';
import {TestFixture} from '../../../fixtures/test-fixture';
import {AnalyticsTracker} from '../../../utils/analyticsUtils';
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
  pressLabelButton,
  pressShowLess,
  pressShowMore,
  typeFacetSearchQuery,
  selectIdleCheckboxValueAt,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet} from '../facet/facet-actions';
import * as FacetAssertions from '../facet/facet-assertions';
import {FacetSelectors} from '../facet/facet-selectors';
import {
  addColorFacet,
  colorFacetDefaultNumberOfValues,
  colorFacetField,
  colorFacetLabel,
  selectIdleBoxValueAt,
} from './color-facet-actions';
import * as ColorFacetAssertions from './color-facet-assertions';
import {
  colorFacetComponent,
  ColorFacetSelectors,
} from './color-facet-selectors';

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
    function setupSelectShowMore(sortCriteria?: string) {
      new TestFixture()
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
            ...(sortCriteria && {'sort-criteria': sortCriteria}),
          })
        )
        .init();
      pressShowMore(ColorFacetSelectors);
    }

    describe('verify rendering', () => {
      before(() => setupSelectShowMore('automatic'));
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
      CommonFacetAssertions.assertFocusBoxValue(ColorFacetSelectors, 0);
    });

    describe("when the sort order isn't automatic", () => {
      before(() => setupSelectShowMore('alphanumeric'));

      CommonFacetAssertions.assertFocusBoxValue(
        ColorFacetSelectors,
        colorFacetDefaultNumberOfValues
      );
    });

    describe('verify analytics', () => {
      before(() => setupSelectShowMore());
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
        .withHash(`f-${colorFacetField}=YouTubeVideo`)
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
    describe('verify rendering with standard values', () => {
      const colorFacetStyle = `atomic-color-facet::part(value-YouTubeVideo) {
        background-color:red
      }`;

      function generateCustomCSS() {
        new TestFixture()
          .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
          .withStyle(colorFacetStyle)
          .withHash(`f-${colorFacetField}=YouTubeVideo`)
          .init();
      }
      before(generateCustomCSS);
      CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
      ColorFacetAssertions.assertButtonBackgroundColor(
        'YouTubeVideo',
        'rgb(255, 255, 255)'
      );
    });

    describe('verify rendering with complex values', () => {
      function generateCustomCSS() {
        const colorFacetStyle = `atomic-color-facet::part(value-BlackRed) {
          background-color:red
        }`;

        new TestFixture()
          .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
          .withStyle(colorFacetStyle)
          .withCustomResponse((r) => {
            (r.facets[0].values[0] as FacetValue).value = 'Black / Red';
            return r;
          })
          .init();
      }
      before(generateCustomCSS);
      CommonFacetAssertions.assertDisplayFacet(ColorFacetSelectors, true);
      ColorFacetAssertions.assertButtonBackgroundColor(
        'Black / Red',
        'rgb(255, 255, 255)'
      );
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
        before(() => {
          setupSelectedColorFacet();
          cy.wait(TestFixture.interceptAliases.Search);
        });
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

        before(() => {
          setupDeselectColorFacetValue();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        BreadboxAssertions.assertDisplayBreadcrumb(false);
        BreadboxAssertions.assertLogBreadcrumbFacet(colorFacetField);
        ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
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
        before(() => {
          setupSelectedMulitpleColorFacets();
          cy.wait(TestFixture.interceptAliases.Search);
        });
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

  describe('with depends-on', () => {
    const facetId = 'abc';
    describe('as a dependent', () => {
      const parentFacetId = 'def';
      const parentField = 'author';
      const expectedValue = 'BPA';
      beforeEach(() => {
        new TestFixture()
          .with(
            addColorFacet({
              'facet-id': facetId,
              field: colorFacetField,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      it('should control display of both parent and child properly', () => {
        ColorFacetSelectors.withId(facetId).wrapper().should('not.exist');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });

      it('should control the display of both parent and child properly when the dependency is met', () => {
        typeFacetSearchQuery(
          FacetSelectors.withId(parentFacetId),
          expectedValue,
          true
        );
        selectIdleCheckboxValueAt(FacetSelectors.withId(parentFacetId), 0);
        ColorFacetSelectors.withId(facetId).wrapper().should('be.visible');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });
    });

    describe('as a parent', () => {
      const dependentFacetId = 'def';
      const dependentField = 'author';
      const expectedValue = 'doc';
      beforeEach(() => {
        new TestFixture()
          .with(addColorFacet({'facet-id': facetId, field: colorFacetField}))
          .with(
            addFacet({
              'facet-id': dependentFacetId,
              field: dependentField,
              [`depends-on-${facetId}`]: expectedValue,
            })
          )
          .init();
      });

      it('should control display of both parent and child properly', () => {
        FacetSelectors.withId(dependentFacetId).wrapper().should('not.exist');
        ColorFacetSelectors.withId(facetId).wrapper().should('be.visible');
      });

      it('should control the display of both parent and child properly when the dependency is met', () => {
        typeFacetSearchQuery(
          ColorFacetSelectors.withId(facetId),
          expectedValue,
          true
        );
        selectIdleBoxValueAt(0);
        FacetSelectors.withId(dependentFacetId).wrapper().should('be.visible');
        ColorFacetSelectors.withId(facetId).wrapper().should('be.visible');
      });
    });

    describe('with two dependencies', () => {
      before(() => {
        new TestFixture()
          .with(addFacet({'facet-id': 'abc', field: 'objecttype'}))
          .with(addFacet({'facet-id': 'def', field: 'filetype'}))
          .with(
            addColorFacet({
              'facet-id': 'ghi',
              field: colorFacetField,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        ColorFacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
