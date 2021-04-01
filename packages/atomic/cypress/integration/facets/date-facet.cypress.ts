import {
  setupPage,
  shouldRenderErrorComponent,
} from '../../utils/setupComponent';
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
  FacetAlias,
} from './facet-selectors';

const dateFacetProp = {
  field: 'date',
  label: 'Date',
};

const dateRanges: DateRange[] = [
  {
    start: '01/01/2006',
    end: '01/01/2011',
  },
  {
    start: '01/01/2011',
    end: '01/01/2015',
  },
  {
    start: '01/01/2015',
    end: '01/01/2021',
  },
];

function setupAutoDateFacet(field: string, label: string, option?: string) {
  setupPage({
    html: `
  <atomic-breadcrumb-manager></atomic-breadcrumb-manager>    
  <atomic-date-facet field="${field}" label="${label}" ${option}></atomic-date-facet>`,
  });
}

function setupCustomDateFacet(
  field: string,
  label: string,
  dateRanges: DateRange[],
  option?: {}
) {
  const ranges = dateRanges
    .map(
      (r: DateRange) =>
        `<atomic-date-range start=${r.start} end=${r.end} end-inclusive="true"></atomic-date-range>`
    )
    .join();
  const html = `
  <atomic-breadcrumb-manager></atomic-breadcrumb-manager>
  <atomic-date-facet field="${field}" label="${label}" ${option}>${ranges}</atomic-date-facet>`;

  setupPage({html});
}

describe('Date Facet with automatic ranges generated', () => {
  beforeEach(() => {
    setupAutoDateFacet(dateFacetProp.field, dateFacetProp.label);
    createAliasShadow(dateFacetProp.field, FacetSelectors.dateFacet);
    createAliasFacetUL(dateFacetProp.field, FacetSelectors.dateFacet);
  });

  it.skip('Date facet should load, pass accessibility test and have correct label and facetCount', () => {
    validateFacetComponentLoaded(dateFacetProp.label, FacetSelectors.dateFacet);
  });

  it.skip('Should contains more than 1 checkboxes', () => {
    validateFacetNumberofValueGreaterThan(1);
  });

  describe('When select 1 facetValue checkbox', () => {
    it.skip('Should activate checkbox, have valid facetCount and log UA', () => {
      assertBasicFacetFunctionality(
        FacetAlias.facetFirstValueLabel,
        dateFacetProp.field
      );
    });

    it.skip('Should trigger breadcrumb and display correctly', () => {
      cy.get(FacetAlias.facetFirstValueLabel).click();
      createBreadcrumbShadowAlias();
      cy.get('@breadcrumbClearAllFilter').should('be.visible');
      facetValueShouldDisplayInBreadcrumb(
        FacetAlias.facetFirstValueLabel,
        '.breadcrumb:nth-child(1) button span'
      );
    });

    it.skip('Should reflect selected facetValue on URL', () => {
      cy.get(FacetAlias.facetFirstValueLabel)
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
    it.skip('should clear the checkbox and log UA', () => {
      assertDeselectFacet(dateFacetProp.field);
    });
  });

  describe('When click ClearAll facet', () => {
    it.skip('Should clear all checkboxes and log UA', () => {
      assertClearAllFacet();
    });
  });
});

describe('Date facet with manually specified ranges', () => {
  beforeEach(() => {
    setupCustomDateFacet(dateFacetProp.field, dateFacetProp.label, dateRanges);
    createAliasShadow(dateFacetProp.field, FacetSelectors.dateFacet);
    createAliasFacetUL(dateFacetProp.field, FacetSelectors.dateFacet);
  });

  describe('When page is loaded', () => {
    it.skip('Date facet should load, pass accessibility test and have correct label', () => {
      validateFacetComponentLoaded(
        dateFacetProp.label,
        FacetSelectors.dateFacet
      );
    });

    it.skip('Should generate all manually specified ranges', () => {
      cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
        (elements) => {
          dateRanges.forEach((r: DateRange) => {
            const facetValueConverted = convertDateToFacetValue(r);
            expect(elements).to.include(facetValueConverted);
          });
        }
      );
    });

    it.skip('Should generate correct number of manually specified ranges', () => {
      const totalCustomRangeLength = dateRanges.length;
      validateFacetNumberofValueEqual(totalCustomRangeLength);
    });

    describe.skip('When select 1 facetValue checkbox', () => {
      it.skip('Should activate checkbox and log UA', () => {
        assertBasicFacetFunctionality(
          FacetAlias.facetFirstValueLabel,
          dateFacetProp.field
        );
      });
    });
  });
});

describe('Date facet contains range returns 0 result', () => {
  it.skip('Should hide the range automatically', () => {
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
    setupCustomDateFacet(
      dateFacetProp.field,
      dateFacetProp.label,
      rangeWithNoResultsPeriods
    );

    createAliasFacetUL(dateFacetProp.field, FacetSelectors.dateFacet);
    assertNonZeroFacetCount();
  });
});

describe('Date with custom date-format', () => {
  it.skip('Should render correct date format', () => {
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

    setupCustomDateFacet(
      dateFacetProp.field,
      dateFacetProp.label,
      customDateFormatDateRanges,
      'date-format="DD/MMM/YYYY"'
    );

    createAliasFacetUL(dateFacetProp.field, FacetSelectors.dateFacet);
    validateFacetComponentLoaded(dateFacetProp.label, FacetSelectors.dateFacet);

    const formatedStart = convertDateFormatLabel('01/01/2006', 'DD/MMM/YYYY');
    const formatedEnd = convertDateFormatLabel('01/01/2014', 'DD/MMM/YYYY');
    const formatedLabel = `${formatedStart} to ${formatedEnd}`;

    cy.get(FacetAlias.facetFirstValueLabel)
      .find('label span:nth-child(1)')
      .should('contain.text', formatedLabel);
  });
});

describe('Date with invalid options', () => {
  describe('When date facet uses invalid field/field returns no result', () => {
    it.skip('Should hide the facet', () => {
      setupAutoDateFacet('author', dateFacetProp.label);
      cy.get(FacetSelectors.dateFacet).should('exist');
      cy.get(FacetSelectors.dateFacet)
        .shadow()
        .find('div.facet div')
        .should('not.exist');
    });
  });

  describe('When date facet uses invalid range', () => {
    it.skip('Should render a warning message when range start with non-number', () => {
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

      setupCustomDateFacet(
        dateFacetProp.field,
        dateFacetProp.label,
        invalidDateRanges
      );
      shouldRenderErrorComponent(FacetSelectors.dateFacet);
    });
  });
});
