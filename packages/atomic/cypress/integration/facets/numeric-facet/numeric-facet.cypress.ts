import {
  buildTestUrl,
  injectComponent,
  RouteAlias,
  setupIntercept,
} from '../../../utils/setupComponent';
import {numericFacetComponent} from '../facet/facet-selectors';
import {
  numericField,
  numericLabel,
  NumericRange,
  numericRanges,
  setupNumericFacet,
} from './numeric-facet-actions';
import * as FacetAssertions from '../facet/facet-assertions';
import * as NumericFacetAssertions from './numeric-facet-assertions';
import {
  selectClearAllFacetsButton,
  selectFacetValueAt,
} from '../facet/facet-actions';

describe('Numeric Facet Test Suites', () => {
  describe('Numeric Facet with automatic ranges generated', () => {
    describe('verify rendering', () => {
      before(() => {
        setupNumericFacet();
        cy.wait(RouteAlias.search);
      });

      FacetAssertions.assertDisplayFacet(
        true,
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertAccessibility(numericFacetComponent);
      FacetAssertions.assertContainsLabel(
        numericLabel,
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertNonZeroFacetCount(
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertDisplayFacetSearchbox(
        false,
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertFacetNumberOfValueGreaterThan(
        1,
        numericField,
        numericFacetComponent
      );
    });

    describe('When user selects 1 numeric-facet checkbox', () => {
      function setupDateFacetWithCheckboxSelected() {
        setupNumericFacet();
        cy.wait(RouteAlias.search);
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0, numericField, numericFacetComponent);
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertCheckboxDisplay(
          0,
          true,
          numericField,
          numericFacetComponent
        );
        FacetAssertions.assertNonZeroFacetCount(
          numericField,
          numericFacetComponent
        );
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex(
          0,
          numericLabel,
          numericField,
          numericFacetComponent
        );

        NumericFacetAssertions.assertNumericFacetValueOnUrl();
      });

      describe('verify analytics', () => {
        beforeEach(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertAnalyticLogFacetSelect(
          numericField,
          numericFacetComponent,
          0
        );
      });

      describe('When user deselects 1 numeric-facet checkbox', () => {
        function setupNumericFacetWithCheckboxDeSelected() {
          setupDateFacetWithCheckboxSelected();
          cy.wait(RouteAlias.analytics);
          selectFacetValueAt(0, numericField, numericFacetComponent);
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupNumericFacetWithCheckboxDeSelected);
          FacetAssertions.assertCheckboxDisplay(
            0,
            false,
            numericField,
            numericFacetComponent
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupNumericFacetWithCheckboxDeSelected);
          FacetAssertions.assertAnalyticLogFacetDeselect(numericField);
        });
      });

      describe('When user clicks ClearAll facet button', () => {
        function setupFacetWithTwoCheckboxesSelected() {
          setupDateFacetWithCheckboxSelected();
          cy.wait(RouteAlias.analytics);
          selectClearAllFacetsButton(numericField, numericFacetComponent);
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupFacetWithTwoCheckboxesSelected);
          FacetAssertions.assertCheckboxDisplay(
            0,
            false,
            numericField,
            numericFacetComponent
          );
          FacetAssertions.assertCheckboxDisplay(
            1,
            false,
            numericField,
            numericFacetComponent
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupFacetWithTwoCheckboxesSelected);
          FacetAssertions.assertAnalyticLogClearAllFacets();
        });
      });
    });
  });

  describe('Numeric Facet with custom ranges generated', () => {
    function setupDateFacetWithCustomRange() {
      setupNumericFacet({ranges: numericRanges});
      cy.wait(RouteAlias.search);
    }

    describe('verify rendering', () => {
      before(setupDateFacetWithCustomRange);
      FacetAssertions.assertDisplayFacet(
        true,
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertAccessibility(numericFacetComponent);
      FacetAssertions.assertContainsLabel(
        numericLabel,
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertNonZeroFacetCount(
        numericField,
        numericFacetComponent
      );
      FacetAssertions.assertFacetNumberOfValueEqual(
        numericRanges.length,
        numericField,
        numericFacetComponent
      );
      NumericFacetAssertions.assertCustomRangeDisplay();
    });

    describe('When user selects 1 date-facet checkbox', () => {
      function setupDateFacetWithCheckboxSelected() {
        setupDateFacetWithCustomRange();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0, numericField, numericFacetComponent);
      }

      describe('verify rendering', () => {
        before(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertCheckboxDisplay(
          0,
          true,
          numericField,
          numericFacetComponent
        );
        FacetAssertions.assertNonZeroFacetCount(
          numericField,
          numericFacetComponent
        );
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex(
          0,
          numericLabel,
          numericField,
          numericFacetComponent
        );
      });

      describe('verify analytics', () => {
        beforeEach(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertAnalyticLogFacetSelect(
          numericField,
          numericFacetComponent,
          0
        );
      });
    });
  });

  describe('Numeric facet contains range returns 0 result', () => {
    const noResultnumericRanges: NumericRange[] = [
      {
        start: 0,
        end: 1,
      },
      {
        start: 1,
        end: 1000,
      },
      {
        start: 10000,
        end: 100000,
      },
    ];
    before(() => {
      setupNumericFacet({ranges: noResultnumericRanges});
      cy.wait(RouteAlias.search);
    });
    FacetAssertions.assertNonZeroFacetCount(
      numericField,
      numericFacetComponent
    );
  });

  describe('Numeric facet with invalid option', () => {
    describe('When numeric facet uses invalid field/field returns no result', () => {
      before(() => {
        setupNumericFacet({field: 'author'});
      });
      FacetAssertions.assertDisplayFacet(
        false,
        'author',
        numericFacetComponent
      );
    });

    describe('When date numeric uses invalid field', () => {
      const invalidNumericRanges: NumericRange[] = [
        {
          start: 10000,
          end: 100000,
        },
        {
          start: ('x1000000' as unknown) as number,
          end: 1000000,
        },
      ];
      before(() => {
        setupNumericFacet({ranges: invalidNumericRanges});
      });
      FacetAssertions.assertContainsComponentError(
        true,
        numericField,
        numericFacetComponent
      );
    });
  });

  describe('Numeric facet with even as algorithm choice for automatic range creation', () => {
    before(() => {
      setupNumericFacet({rangeAlgorithm: 'even', field: 'ytlikecount'});
    });
    FacetAssertions.assertDisplayFacet(
      true,
      'ytlikecount',
      numericFacetComponent
    );
    NumericFacetAssertions.assertRangesGeneratedWithAlgorithm(
      'even',
      'ytlikecount'
    );
  });

  describe('Numeric facet with equiprobable as algorithm choice for automatic range creation', () => {
    before(() => {
      setupNumericFacet({rangeAlgorithm: 'equiprobable', field: 'ytlikecount'});
    });
    FacetAssertions.assertDisplayFacet(
      true,
      'ytlikecount',
      numericFacetComponent
    );
    NumericFacetAssertions.assertRangesGeneratedWithAlgorithm(
      'equiprobable',
      'ytlikecount'
    );
  });

  describe('When no first search has yet been executed', () => {
    beforeEach(() => {
      setupNumericFacet({executeFirstSearch: false});
    });

    FacetAssertions.assertRenderPlaceHolder(
      numericField,
      numericFacetComponent
    );
  });

  describe('Numeric Facet with selected value on initialization', () => {
    before(() => {
      setupIntercept();
      cy.visit(buildTestUrl(`nf[${numericField}]=0..1000`));
      injectComponent(
        `<atomic-numeric-facet field="${numericField}"></atomic-numeric-facet>`,
        true
      );
    });
    FacetAssertions.assertAnalyticLogFacetInInterfaceLoadEvent(numericField);
    FacetAssertions.assertCheckboxDisplay(
      0,
      true,
      numericField,
      numericFacetComponent
    );
  });
});
