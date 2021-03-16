import {setUpPage, shouldRenderErrorComponent} from '../utils/setupComponent';
import {
  validateFacetComponentLoaded,
  validateFacetNumberofValueGreaterThan,
  validateFacetNumberofValueEqual,
  assertBasicFacetFunctionality,
  facetValueShouldDisplayInBreadcrumb,
  assertNonZeroFacetCount,
  convertFacetValueToAPIformat,
  FacetType,
  DateRange,
  convertDateToFacetValue,
  assertDeselectFacet,
  assertClearAllFacet,
  convertDateFormatLabel,
} from './facet-utils';

import {
  FacetSelectors,
  createAliasShadow,
  createAliasFacetUL,
  createBreadcrumbShadowAlias,
} from './facet-selectors';

const dateFacetProp = {
  field: 'date',
  label: 'Date',
};

interface DateRanges {
  range1: DateRange;
  range2: DateRange;
  range3: DateRange;
}
const dateRange: DateRanges = {
  range1: {
    start: '01/01/2006',
    end: '01/01/2011',
  },
  range2: {
    start: '01/01/2011',
    end: '01/01/2015',
  },
  range3: {
    start: '01/01/2015',
    end: '01/01/2021',
  },
};

function setupAutoDateFacet(field: string, label: string, option?: string) {
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>    
    <atomic-date-facet field="${field}" label="${label}" ${option}>
  </atomic-date-facet>`
  );
}

function setupCustomDateFacet(
  field: string,
  label: string,
  dateRange: DateRanges
) {
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>
    <atomic-date-facet field="${field}" label="${label}">
           <atomic-date-range start=${dateRange.range1.start} end=${dateRange.range1.end} end-inclusive="true"></atomic-date-range>
           <atomic-date-range start=${dateRange.range2.start} end=${dateRange.range2.end} end-inclusive="true"></atomic-date-range>
           <atomic-date-range start=${dateRange.range3.start} end=${dateRange.range3.end} end-inclusive="true"></atomic-date-range>
  </atomic-date-facet>`
  );
}

describe('Standard Numeric Facet', () => {
  beforeEach(() => {
    setupAutoDateFacet(dateFacetProp.field, dateFacetProp.label);
    createAliasShadow(dateFacetProp.field, FacetSelectors.facetDate);
    createAliasFacetUL(dateFacetProp.field, FacetSelectors.facetDate);
  });

  describe('When page is loaded', () => {
    it('Numeric facet should load, pass accessibility test and have correct label and facetCount', () => {
      validateFacetComponentLoaded(
        dateFacetProp.label,
        FacetSelectors.facetDate
      );
    });

    it('Should contains more than 1 checkboxes', () => {
      validateFacetNumberofValueGreaterThan(1);
    });

    describe('When select 1 facetValue checkbox', () => {
      it('Should activate checkbox, have valid facetCount and log UA', () => {
        assertBasicFacetFunctionality('@firstFacetValue', dateFacetProp.field);
      });

      it('Should trigger breadcrumb and display correctly', () => {
        cy.get('@firstFacetValue').click();
        createBreadcrumbShadowAlias();
        cy.get('@breadcrumbClearAllFilter').should('be.visible');
        facetValueShouldDisplayInBreadcrumb(
          '@firstFacetValue',
          '.breadcrumb:nth-child(1) button span'
        );
      });

      it('Should reflect selected facetValue on URL', () => {
        cy.get('@firstFacetValue')
          .click()
          .find('label span:nth-child(1)')
          .invoke('text')
          .then((txt) => {
            const facetValueInApiFormat = convertFacetValueToAPIformat(
              txt,
              FacetType.dateFacet
            );
            const urlHash = `#df[${dateFacetProp.field}]=${encodeURI(
              facetValueInApiFormat
            )}`;
            cy.url().should('include', urlHash);
          });
      });
    });

    describe('When deselect 1 selected facetValue checkbox', () => {
      it('should clear the checkbox and log UA', () => {
        assertDeselectFacet(dateFacetProp.field);
      });
    });

    describe('When click ClearAll facet', () => {
      it('Should clear all checkboxes and log UA', () => {
        assertClearAllFacet();
      });
    });
  });
});

describe('Date facet with custom ranges', () => {
  beforeEach(() => {
    setupCustomDateFacet(dateFacetProp.field, dateFacetProp.label, dateRange);
    createAliasShadow(dateFacetProp.field, FacetSelectors.facetDate);
    createAliasFacetUL(dateFacetProp.field, FacetSelectors.facetDate);
  });

  describe('When page is loaded', () => {
    it('Numeric facet should load, pass accessibility test and have correct label', () => {
      validateFacetComponentLoaded(
        dateFacetProp.label,
        FacetSelectors.facetDate
      );
    });

    it('Should generate all custom ranges', () => {
      cy.getTextOfAllElements('@allFacetValueLabel').then((elements) => {
        Object.keys(dateRange).forEach((i) => {
          const facetValueConverted = convertDateToFacetValue(
            (dateRange as any)[i]
          );
          expect(elements).to.include(facetValueConverted);
        });
      });
    });

    it('Should generate correct number of custom ranges', () => {
      const totalCustomRangeLength = Object.keys(dateRange).length;
      validateFacetNumberofValueEqual(totalCustomRangeLength);
    });

    describe.skip('When select 1 facetValue checkbox', () => {
      it('Should activate checkbox and log UA', () => {
        assertBasicFacetFunctionality('@firstFacetValue', dateFacetProp.field);
      });
    });
  });
});

describe('Date facet contains range returns 0 result', () => {
  it('Should hide the range automatically', () => {
    setUpPage(`
    <atomic-date-facet field="${dateFacetProp.field}" label="${dateFacetProp.label}">
        <atomic-date-range start='01/01/2006' end='01/01/2014' end-inclusive="true"></atomic-date-range>
        <atomic-date-range start='01/01/2014' end='01/01/2021' end-inclusive="true"></atomic-date-range>
        <atomic-date-range start='01/01/20014' end='01/01/20021' end-inclusive="true"></atomic-date-range>
    </atomic-date-facet>`);
    createAliasFacetUL(dateFacetProp.field, FacetSelectors.facetDate);
    assertNonZeroFacetCount();
  });
});

describe('Date with custom date-format', () => {
  it('Should render correct date format', () => {
    setUpPage(`
    <atomic-date-facet field="${dateFacetProp.field}" label="${dateFacetProp.label}" date-format="DD/MMM/YYYY">
          <atomic-date-range start='01/01/2006' end='01/01/2014' end-inclusive="true"></atomic-date-range>
          <atomic-date-range start='01/01/2014' end='01/01/2021' end-inclusive="true"></atomic-date-range>
    </atomic-date-facet>`);
    createAliasFacetUL(dateFacetProp.field, FacetSelectors.facetDate);
    validateFacetComponentLoaded(dateFacetProp.label, FacetSelectors.facetDate);

    const formatedStart = convertDateFormatLabel('01/01/2006', 'DD/MMM/YYYY');
    const formatedEnd = convertDateFormatLabel('01/01/2014', 'DD/MMM/YYYY');
    const formatedLabel = `${formatedStart} to ${formatedEnd}`;

    cy.get('@firstFacetValue')
      .find('label span:nth-child(1)')
      .should('contain.text', formatedLabel);
  });
});

describe('Date with invalid options', () => {
  describe('When date facet uses invalid field/field returns no result', () => {
    it('Should hide the facet', () => {
      setupAutoDateFacet('author', dateFacetProp.label);
      cy.get(FacetSelectors.facetDate).should('exist');
      cy.get(FacetSelectors.facetDate)
        .shadow()
        .find('div.facet div')
        .should('not.exist');
    });
  });

  describe('When date facet uses invalid range', () => {
    it('Should render a warning message when range start with non-number', () => {
      setUpPage(`
      <atomic-date-facet field="${dateFacetProp.field}" label="${dateFacetProp.label}">
            <atomic-date-range start='01/01/2006' end='01/01/2014' end-inclusive="true"></atomic-date-range>
            <atomic-date-range start='x01/01/2014' end='01/01/2021' end-inclusive="true"></atomic-date-range>
      </atomic-date-facet>`);
      shouldRenderErrorComponent(FacetSelectors.facetDate);
    });
  });
});
