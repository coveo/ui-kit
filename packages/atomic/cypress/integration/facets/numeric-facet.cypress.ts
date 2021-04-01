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
  convertRangeToFacetValue,
  convertFacetValueToAPIformat,
  FacetType,
  NumericRange,
  assertDeselectFacet,
  assertClearAllFacet,
  assertNonZeroFacetCount,
} from './facet-utils';

import {
  FacetSelectors,
  createAliasShadow,
  createAliasFacetUL,
  createBreadcrumbShadowAlias,
  FacetAlias,
  BreadcrumbAlias,
} from './facet-selectors';

const numericFacetProp = {
  field: 'size',
  label: 'File size',
};

const numericRanges: NumericRange[] = [
  {
    start: 0,
    end: 100000,
  },
  {
    start: 100001,
    end: 1000000,
  },
  {
    start: 1000001,
    end: 10000000,
  },
];

function setupAutoNumericFacet(field: string, label: string, option?: string) {
  setupPage({
    html: `
  <atomic-breadcrumb-manager></atomic-breadcrumb-manager>
  <atomic-numeric-facet field="${field}" label="${label}" ${option}></atomic-numeric-facet>`,
  });
}

function setupCustomNumericFacet(
  field: string,
  label: string,
  numericRanges: NumericRange[]
) {
  const ranges = numericRanges
    .map(
      (r: NumericRange) =>
        `<atomic-numeric-range start=${r.start} end=${r.end} end-inclusive="true"></atomic-numeric-range>`
    )
    .join();
  const html = `
  <atomic-breadcrumb-manager></atomic-breadcrumb-manager>
  <atomic-numeric-facet field="${field}" label="${label}">${ranges}</atomic-numeric-facet>`;

  setupPage({html});
}

describe('Standard Numeric Facet with automatic ranges generated', () => {
  beforeEach(() => {
    setupAutoNumericFacet(numericFacetProp.field, numericFacetProp.label);
    createAliasShadow(numericFacetProp.field, FacetSelectors.numericFacet);
    createAliasFacetUL(numericFacetProp.field, FacetSelectors.numericFacet);
  });

  it('Numeric facet should load, pass accessibility test and have correct label', () => {
    validateFacetComponentLoaded(
      numericFacetProp.label,
      FacetSelectors.numericFacet
    );
  });

  it('Should contains more than 1 checkboxes', () => {
    validateFacetNumberofValueGreaterThan(1);
  });

  describe('When select 1 facetValue checkbox', () => {
    it('Should activate checkbox and log UA', () => {
      assertBasicFacetFunctionality(
        FacetAlias.facetFirstValueLabel,
        numericFacetProp.field
      );
    });

    it('Should trigger breadcrumb and display correctly', () => {
      cy.get(FacetAlias.facetFirstValueLabel).click();
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbClearAllFilter).should('be.visible');
      facetValueShouldDisplayInBreadcrumb(
        FacetAlias.facetFirstValueLabel,
        '.breadcrumb:nth-child(1) button span'
      );
    });

    it('Should reflect selected facetValue on URL', () => {
      cy.get(FacetAlias.facetFirstValueLabel)
        .click()
        .find('label span:nth-child(1)')
        .invoke('text')
        .then((txt) => {
          const facetValueInApiFormat = convertFacetValueToAPIformat(
            txt,
            FacetType.numericFacet
          );
          const urlHash = `#nf[${numericFacetProp.field}]=${encodeURI(
            facetValueInApiFormat
          )}`;
          cy.url().should('include', urlHash);
        });
    });
  });

  describe('When deselect 1 selected facetValue checkbox', () => {
    it('should clear the checkbox and log UA', () => {
      assertDeselectFacet(numericFacetProp.field);
    });
  });

  describe('When click ClearAll facet', () => {
    it('Should clear all checkboxes and log UA', () => {
      assertClearAllFacet();
    });
  });
});

describe('Numeric facet with manually specified ranges', () => {
  beforeEach(() => {
    setupCustomNumericFacet(
      numericFacetProp.field,
      numericFacetProp.label,
      numericRanges
    );
    createAliasShadow(numericFacetProp.field, FacetSelectors.numericFacet);
    createAliasFacetUL(numericFacetProp.field, FacetSelectors.numericFacet);
  });

  describe('When page is loaded', () => {
    it('Numeric facet should load, pass accessibility test and have correct label', () => {
      validateFacetComponentLoaded(
        numericFacetProp.label,
        FacetSelectors.numericFacet
      );
    });

    it('Should generate all manually specified ranges', () => {
      cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
        (elements) => {
          numericRanges.forEach((r: NumericRange) => {
            const facetValueConverted = convertRangeToFacetValue(r);
            expect(elements).to.include(facetValueConverted);
          });
        }
      );
    });

    it('Should generate correct number of manually specified ranges', () => {
      const totalCustomRangeLength = numericRanges.length;
      validateFacetNumberofValueEqual(totalCustomRangeLength);
    });

    describe('When select 1 facetValue checkbox', () => {
      it('Should activate checkbox and log UA', () => {
        assertBasicFacetFunctionality(
          FacetAlias.facetFirstValueLabel,
          numericFacetProp.field
        );
      });
    });
  });
});

describe('Numeric facet contains range returns 0 result', () => {
  it('Should hide the range automatically', () => {
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
    setupCustomNumericFacet(
      numericFacetProp.field,
      numericFacetProp.label,
      noResultnumericRanges
    );
    createAliasFacetUL(numericFacetProp.field, FacetSelectors.numericFacet);
    assertNonZeroFacetCount();
  });
});

describe('Numeric with invalid options', () => {
  describe('When numeric facet uses invalid field/field returns no result', () => {
    it('Should hide the facet', () => {
      setupAutoNumericFacet('author', numericFacetProp.label);
      cy.get(FacetSelectors.numericFacet).should('exist');
      cy.get(FacetSelectors.numericFacet)
        .shadow()
        .find('div.facet div')
        .should('not.exist');
    });
  });
  describe('When numeric facet uses invalid range', () => {
    it('Should render a warning message when range start with non-number', () => {
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

      setupCustomNumericFacet(
        numericFacetProp.field,
        numericFacetProp.label,
        invalidNumericRanges
      );
      shouldRenderErrorComponent(FacetSelectors.numericFacet);
    });
  });
});
