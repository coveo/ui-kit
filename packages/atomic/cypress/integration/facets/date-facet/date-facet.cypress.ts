import {
  buildTestUrl,
  injectComponent,
  RouteAlias,
  setupIntercept,
} from '../../../utils/setupComponent';
import {
  selectFacetValueAt,
  selectClearAllFacetsButton,
} from '../facet/facet-actions';

import {dateFacetComponent} from '../facet/facet-selectors';
import * as FacetAssertions from '../facet/facet-assertions';
import * as DateFacetAssertions from './date-facet-assertions';
import {
  dateField,
  dateLabel,
  DateRange,
  dateRanges,
  setupDateFacet,
} from './date-facet-actions';

describe('Date Facet Test Suites', () => {
  describe('Date Facet with automatic ranges generated', () => {
    describe('verify rendering', () => {
      before(() => {
        setupDateFacet();
        cy.wait(RouteAlias.search);
      });
      FacetAssertions.assertDisplayFacet(true, dateField, dateFacetComponent);
      FacetAssertions.assertAccessibility(dateFacetComponent);
      FacetAssertions.assertContainsLabel(
        dateLabel,
        dateField,
        dateFacetComponent
      );
      FacetAssertions.assertNonZeroFacetCount(dateField, dateFacetComponent);
      FacetAssertions.assertDisplayFacetSearchbox(
        false,
        dateField,
        dateFacetComponent
      );
      FacetAssertions.assertFacetNumberOfValueGreaterThan(
        1,
        dateField,
        dateFacetComponent
      );
    });

    describe('When user selects 1 date-facet checkbox', () => {
      function setupDateFacetWithCheckboxSelected() {
        setupDateFacet();
        cy.wait(RouteAlias.search);
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0, dateField, dateFacetComponent);
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertCheckboxDisplay(
          0,
          true,
          dateField,
          dateFacetComponent
        );
        FacetAssertions.assertNonZeroFacetCount(dateField, dateFacetComponent);
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex(
          0,
          dateLabel,
          dateField,
          dateFacetComponent
        );
        DateFacetAssertions.assertDateFacetValueOnUrl();
      });

      describe('verify analytics', () => {
        beforeEach(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertAnalyticLogFacetSelect(
          dateField,
          dateFacetComponent,
          0
        );
      });

      describe('When user deselects 1 date-facet checkbox', () => {
        function setupDateFacetWithCheckboxDeSelected() {
          setupDateFacetWithCheckboxSelected();
          cy.wait(RouteAlias.analytics);
          selectFacetValueAt(0, dateField, dateFacetComponent);
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupDateFacetWithCheckboxDeSelected);
          FacetAssertions.assertCheckboxDisplay(
            0,
            false,
            dateField,
            dateFacetComponent
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupDateFacetWithCheckboxDeSelected);
          FacetAssertions.assertAnalyticLogFacetDeselect(dateField);
        });
      });

      describe('When user clicks ClearAll facet button', () => {
        function setupFacetWithTwoCheckboxesSelected() {
          setupDateFacetWithCheckboxSelected();
          cy.wait(RouteAlias.analytics);
          selectClearAllFacetsButton(dateField, dateFacetComponent);
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupFacetWithTwoCheckboxesSelected);
          FacetAssertions.assertCheckboxDisplay(
            0,
            false,
            dateField,
            dateFacetComponent
          );
          FacetAssertions.assertCheckboxDisplay(
            1,
            false,
            dateField,
            dateFacetComponent
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupFacetWithTwoCheckboxesSelected);
          FacetAssertions.assertAnalyticLogClearAllFacets();
        });
      });
    });
  });

  describe('Date Facet with custom ranges generated', () => {
    function setupDateFacetWithCustomRange() {
      setupDateFacet({ranges: dateRanges});
      cy.wait(RouteAlias.search);
    }
    describe('verify rendering', () => {
      before(setupDateFacetWithCustomRange);
      FacetAssertions.assertDisplayFacet(true, dateField, dateFacetComponent);
      FacetAssertions.assertAccessibility(dateFacetComponent);
      FacetAssertions.assertContainsLabel(
        dateLabel,
        dateField,
        dateFacetComponent
      );
      FacetAssertions.assertNonZeroFacetCount(dateField, dateFacetComponent);
      FacetAssertions.assertFacetNumberOfValueEqual(
        dateRanges.length,
        dateField,
        dateFacetComponent
      );
      DateFacetAssertions.assertDateRangeDisplay();
    });

    describe('When user selects 1 date-facet checkbox', () => {
      function setupDateFacetWithCheckboxSelected() {
        setupDateFacetWithCustomRange();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0, dateField, dateFacetComponent);
      }

      describe('verify rendering', () => {
        before(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertCheckboxDisplay(
          0,
          true,
          dateField,
          dateFacetComponent
        );
        FacetAssertions.assertNonZeroFacetCount(dateField, dateFacetComponent);
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex(
          0,
          dateLabel,
          dateField,
          dateFacetComponent
        );
      });

      describe.skip('verify analytics', () => {
        beforeEach(setupDateFacetWithCheckboxSelected);
        FacetAssertions.assertAnalyticLogFacetSelect(
          dateField,
          dateFacetComponent,
          0
        );
      });
    });
  });

  describe('Date facet contains range returns 0 result', () => {
    const rangeWithNoResultsPeriods: DateRange[] = [
      {
        start: '01/01/2006',
        end: '01/01/2014',
      },
      {
        start: '01/01/2014',
        end: '01/01/2021',
      },
      {
        start: '01/01/20014',
        end: '01/01/20021',
      },
    ];
    before(() => {
      setupDateFacet({ranges: rangeWithNoResultsPeriods});
      cy.wait(RouteAlias.search);
    });
    FacetAssertions.assertNonZeroFacetCount(dateField, dateFacetComponent);
  });

  describe('Date with custom date-format', () => {
    const dateFormat = 'DD/MMM/YYYY';
    const customDateFormatDateRanges: DateRange[] = [
      {
        start: '01/01/2006',
        end: '01/01/2014',
      },
      {
        start: '01/01/2014',
        end: '01/01/2021',
      },
    ];
    describe('verify rendering', () => {
      before(() => {
        setupDateFacet({
          ranges: customDateFormatDateRanges,
          attributes: `date-format=${dateFormat}`,
        });
      });
      FacetAssertions.assertDisplayFacet(true, dateField, dateFacetComponent);
      FacetAssertions.assertAccessibility(dateFacetComponent);
      FacetAssertions.assertContainsLabel(
        dateLabel,
        dateField,
        dateFacetComponent
      );
      FacetAssertions.assertNonZeroFacetCount(dateField, dateFacetComponent);
      DateFacetAssertions.assertCustomDateFormatRangeAtIndex(
        customDateFormatDateRanges[0],
        dateFormat
      );
      DateFacetAssertions.assertCustomDateFormatRangeAtIndex(
        customDateFormatDateRanges[1],
        dateFormat,
        1
      );
    });
  });

  describe('Date facet with invalid option', () => {
    describe('When date facet uses invalid field/field returns no result', () => {
      before(() => {
        setupDateFacet({field: 'author'});
      });
      FacetAssertions.assertDisplayFacet(false, 'author', dateFacetComponent);
    });

    describe('When date facet uses invalid field', () => {
      const invalidDateRanges: DateRange[] = [
        {
          start: '01/01/2006',
          end: '01/01/2014',
        },
        {
          start: 'x01/01/2014',
          end: '01/01/2021',
        },
      ];
      before(() => {
        setupDateFacet({ranges: invalidDateRanges});
      });
      FacetAssertions.assertContainsComponentError(
        true,
        dateField,
        dateFacetComponent
      );
    });
  });

  describe('When no first search has yet been executed', () => {
    beforeEach(() => {
      setupDateFacet({executeFirstSearch: false});
    });

    FacetAssertions.assertRenderPlaceHolder(dateField, dateFacetComponent);
  });

  describe('Date Facet with selected value on initialization', () => {
    before(() => {
      setupIntercept();
      cy.visit(
        buildTestUrl(
          `df[${dateField}]=2000/01/01@00:00:00..2004/01/01@00:00:00`
        )
      );
      injectComponent(
        `<atomic-date-facet field="${dateField}"></atomic-date-facet>`,
        true
      );
    });
    FacetAssertions.assertAnalyticLogFacetInInterfaceLoadEvent(dateField);
    FacetAssertions.assertCheckboxDisplay(
      0,
      true,
      dateField,
      dateFacetComponent
    );
  });
});
