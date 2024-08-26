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
    beforeEach(setupColorFacet);
    describe('verify rendering', () => {
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

    describe('when searching for a value that returns results', () => {
      const query = 'html';
      function setupSearchFor() {
        typeFacetSearchQuery(ColorFacetSelectors, query, true);
      }

      beforeEach(setupSearchFor);
      describe('verify rendering', () => {
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
          AnalyticsTracker.reset();
          selectIdleBoxValueAt(0);
        }

        beforeEach(setupSelectSearchResult);
        describe('verify rendering', () => {
          ColorFacetAssertions.assertNumberOfSelectedBoxValues(1);
          ColorFacetAssertions.assertNumberOfIdleBoxValues(
            colorFacetDefaultNumberOfValues - 1
          );
          CommonFacetAssertions.assertSearchInputEmpty(ColorFacetSelectors);
        });

        describe('verify analytics', () => {
          it('should log the facet select results to UA ', () => {
            cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
              expect(analyticsBody.customData).to.have.property(
                'facetField',
                colorFacetField
              );
              expect(analyticsBody.facetState[0]).to.have.property(
                'state',
                'selected'
              );
              expect(analyticsBody.facetState[0]).to.have.property(
                'field',
                colorFacetField
              );
              expect(analyticsBody.customData).to.have.property(
                'facetValue',
                query
              );
            });
          });
        });
      });
    });
    describe('when selecting a value', () => {
      const selectionIndex = 1;
      function setupSelectBoxValue() {
        selectIdleBoxValueAt(selectionIndex);
      }

      beforeEach(setupSelectBoxValue);
      describe('verify rendering', () => {
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
        ColorFacetAssertions.assertLogColorFacetSelect(
          colorFacetField,
          selectionIndex
        );
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondBoxValue() {
          selectIdleBoxValueAt(secondSelectionIndex);
        }

        beforeEach(setupSelectSecondBoxValue);
        describe('verify rendering', () => {
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
          ColorFacetAssertions.assertLogColorFacetSelect(
            colorFacetField,
            secondSelectionIndex
          );
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            pressClearButton(ColorFacetSelectors);
          }

          beforeEach(setupClearBoxValues);
          describe('verify rendering', () => {
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
            CommonFacetAssertions.assertLogClearFacetValues(colorFacetField);
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
      beforeEach(() => setupSelectShowMore('automatic'));
      CommonFacetAssertions.assertFocusBoxValue(ColorFacetSelectors, 0);
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
    });

    describe("when the sort order isn't automatic", () => {
      beforeEach(() => setupSelectShowMore('alphanumeric'));
      CommonFacetAssertions.assertFocusBoxValue(
        ColorFacetSelectors,
        colorFacetDefaultNumberOfValues
      );
    });

    describe('verify analytics', () => {
      beforeEach(() => setupSelectShowMore());
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
        beforeEach(setupRepeatShowMore);

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

      beforeEach(setupSelectShowLess);
      describe('verify rendering', () => {
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

    beforeEach(setupSelectLabelCollapse);
    describe('verify rendering', () => {
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
        ColorFacetSelectors.labelButton().click();
      }

      beforeEach(setupSelectLabelExpand);

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

    beforeEach(setupCustomNumberOfValues);
    describe('verify rendering', () => {
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
      beforeEach(() => {
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

  describe('with #resultsMustMatch set to default value', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
          })
        )
        .init();

      selectIdleBoxValueAt(0);
    });

    it('should set resultsMustMatch to `atLeastOneValue`', () => {
      cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
        expect(firstSearch.request.body.facets[0]).to.have.property(
          'resultsMustMatch',
          'atLeastOneValue'
        );
      });
    });
  });

  describe('with #resultsMustMatch set to "allValues"', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addColorFacet({
            field: colorFacetField,
            label: colorFacetLabel,
            'results-must-match': 'allValues',
          })
        )
        .init();

      selectIdleBoxValueAt(0);
    });

    it('should set resultsMustMatch to `allValues`', () => {
      cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
        expect(firstSearch.request.body.facets[0]).to.have.property(
          'resultsMustMatch',
          'allValues'
        );
      });
    });
  });

  describe('with #withSearch to false', () => {
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
      beforeEach(generateCustomCSS);
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
      beforeEach(generateCustomCSS);
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
    beforeEach(setupBreadboxWithColorFacet);
    describe('verify rendering', () => {
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a facetValue', () => {
      const selectionIndex = 2;

      function setupSelectedColorFacet() {
        selectIdleBoxValueAt(selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      beforeEach(setupSelectedColorFacet);

      describe('verify rendering', () => {
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
          deselectBreadcrumbAtIndex(deselectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        beforeEach(setupDeselectColorFacetValue);

        BreadboxAssertions.assertDisplayBreadcrumb(false);
        BreadboxAssertions.assertLogBreadcrumbFacet(colorFacetField);
        ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
      });
    });

    describe('when select 3 facetValues', () => {
      const positions = [0, 1, 2];
      function setupSelectedMultipleColorFacets() {
        positions.forEach((position, i) => {
          selectIdleBoxValueAt(position);
          BreadboxSelectors.breadcrumbButton().should('have.length', i + 1);
        });
        cy.wait(TestFixture.interceptAliases.Search);
      }

      beforeEach(setupSelectedMultipleColorFacets);
      describe('verify rendering', () => {
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
      const expectedValue = 'amoreau';
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
      beforeEach(() => {
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

  describe('with allowed-values', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addColorFacet({
            field: 'objecttype',
            'allowed-values': JSON.stringify(['FAQ', 'People']),
          })
        )
        .init();
    });

    it('returns only allowed values', () => {
      ColorFacetSelectors.valueLabel()
        .should('contain.text', 'FAQ')
        .should('contain.text', 'People')
        .should('not.contain.text', 'Page');
    });
  });

  describe('with custom-sort', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addColorFacet({
            field: 'filetype',
            'custom-sort': JSON.stringify(['txt', 'rssitem']),
          })
        )
        .init();
    });

    it('returns values sorted in the proper order', () => {
      ColorFacetSelectors.valueLabel().eq(0).should('contain.text', 'txt');
      ColorFacetSelectors.valueLabel().eq(1).should('contain.text', 'rssitem');
    });
  });
});
