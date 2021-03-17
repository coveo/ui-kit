import {
  setUpPage,
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

interface NumericRanges {
  range1: NumericRange;
  range2: NumericRange;
  range3: NumericRange;
}
const numericRange: NumericRanges = {
  range1: {
    start: 0,
    end: 100000,
  },
  range2: {
    start: 100001,
    end: 1000000,
  },
  range3: {
    start: 1000001,
    end: 10000000,
  },
};

function setupAutoNumericFacet(field: string, label: string, option?: string) {
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>
    <atomic-numeric-facet field="${field}" label="${label}" ${option}>
  </atomic-numeric-facet>`
  );
}

function setupCustomNumericFacet(
  field: string,
  label: string,
  numericRange: NumericRanges
) {
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>
    <atomic-numeric-facet field="${field}" label="${label}">
           <atomic-numeric-range start=${numericRange.range1.start} end=${numericRange.range1.end} end-inclusive="true"></atomic-numeric-range>
           <atomic-numeric-range start=${numericRange.range2.start} end=${numericRange.range2.end} end-inclusive="true"></atomic-numeric-range>
           <atomic-numeric-range start=${numericRange.range3.start} end=${numericRange.range3.end} end-inclusive="true"></atomic-numeric-range>
  </atomic-numeric-facet>`
  );
}

describe('Standard Numeric Facet', () => {
  beforeEach(() => {
    setupAutoNumericFacet(numericFacetProp.field, numericFacetProp.label);
    createAliasShadow(numericFacetProp.field, FacetSelectors.facetNumeric);
    createAliasFacetUL(numericFacetProp.field, FacetSelectors.facetNumeric);
  });

  describe('When page is loaded', () => {
    it('Numeric facet should load, pass accessibility test and have correct label', () => {
      validateFacetComponentLoaded(
        numericFacetProp.label,
        FacetSelectors.facetNumeric
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
});

describe('Numeric facet with custom ranges', () => {
  beforeEach(() => {
    setupCustomNumericFacet(
      numericFacetProp.field,
      numericFacetProp.label,
      numericRange
    );
    createAliasShadow(numericFacetProp.field, FacetSelectors.facetNumeric);
    createAliasFacetUL(numericFacetProp.field, FacetSelectors.facetNumeric);
  });

  describe('When page is loaded', () => {
    it('Numeric facet should load, pass accessibility test and have correct label', () => {
      validateFacetComponentLoaded(
        numericFacetProp.label,
        FacetSelectors.facetNumeric
      );
    });

    it('Should generate all custom ranges', () => {
      cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
        (elements) => {
          Object.keys(numericRange).forEach((i) => {
            const facetValueConverted = convertRangeToFacetValue(
              (numericRange as any)[i]
            );
            expect(elements).to.include(facetValueConverted);
          });
        }
      );
    });

    it('Should generate correct number of custom ranges', () => {
      const totalCustomRangeLength = Object.keys(numericRange).length;
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
    setUpPage(`
    <atomic-numeric-facet field="${numericFacetProp.field}" label="${numericFacetProp.label}">
          <atomic-numeric-range start='0' end='1' end-inclusive="true"></atomic-numeric-range> 
          <atomic-numeric-range start='1' end='1000' end-inclusive="true"></atomic-numeric-range> 
          <atomic-numeric-range start='10000' end='100000' end-inclusive="true"></atomic-numeric-range>             
    </atomic-numeric-facet>`);
    createAliasFacetUL(numericFacetProp.field, FacetSelectors.facetNumeric);
    assertNonZeroFacetCount();
  });
});

describe('Numeric with invalid options', () => {
  describe('When numeric facet uses invalid field/field returns no result', () => {
    it('Should hide the facet', () => {
      setupAutoNumericFacet('author', numericFacetProp.label);
      cy.get(FacetSelectors.facetNumeric).should('exist');
      cy.get(FacetSelectors.facetNumeric)
        .shadow()
        .find('div.facet div')
        .should('not.exist');
    });
  });
  describe('When numeric facet uses invalid range', () => {
    it('Should render a warning message when range start with non-number', () => {
      setUpPage(`
      <atomic-numeric-facet field="${numericFacetProp.field}" label="${numericFacetProp.label}">
            <atomic-numeric-range start='10000' end='100000' end-inclusive="true"></atomic-numeric-range>
            <atomic-numeric-range start='x1000000' end='1000000' end-inclusive="true"></atomic-numeric-range>
      </atomic-numeric-facet>`);
      shouldRenderErrorComponent(FacetSelectors.facetNumeric);
    });
  });
});
