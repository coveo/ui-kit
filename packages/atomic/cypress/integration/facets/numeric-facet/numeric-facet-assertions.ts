import {convertFacetValueToAPIformat} from '../facet/facet-actions';
import {FacetSelector, numericFacetComponent} from '../facet/facet-selectors';
import {
  convertRangeToFacetValue,
  numericField,
  NumericRange,
  numericRanges,
} from './numeric-facet-actions';
import {RangeFacetRangeAlgorithm} from '@coveo/headless';

export function assertNumericFacetValueOnUrl(
  index = 0,
  field = numericField,
  valueSeparator = 'to'
) {
  it('should reflected selected facetValue on Url', () => {
    FacetSelector.facetValueLabelAtIndex(index, field, numericFacetComponent)
      .invoke('text')
      .then((txt) => {
        const facetValueInApiFormat = convertFacetValueToAPIformat(
          txt,
          numericFacetComponent,
          valueSeparator
        );
        const urlHash = `#nf[${field.toLowerCase()}]=${encodeURI(
          facetValueInApiFormat
        )}`;
        cy.url().should('include', urlHash);
      });
  });
}

export function assertCustomRangeDisplay(ranges = numericRanges) {
  it('should generate all manually specified ranges', () => {
    FacetSelector.valueLabels(numericField, numericFacetComponent).as(
      'numericFacetAllValueLabels'
    );
    cy.getTextOfAllElements('@numericFacetAllValueLabels').then((elements) => {
      ranges.forEach((r: NumericRange) => {
        const facetValueConverted = convertRangeToFacetValue(r);
        expect(elements).to.include(facetValueConverted);
      });
    });
  });
}

export function assertRangesGeneratedWithAlgorithm(
  rangeAlgorithm: RangeFacetRangeAlgorithm
) {
  it(`Facet ranges should be generated using the ${rangeAlgorithm} range algorithm`, () => {
    FacetSelector.valueLabels(numericField, numericFacetComponent).as(
      'numericFacetAllValueLabels'
    );
    cy.getTextOfAllElements('@numericFacetAllValueLabels').then((elements) => {
      // ranges.forEach((r: NumericRange) => {
      //   const facetValueConverted = convertRangeToFacetValue(r);
      //   expect(elements).to.include(facetValueConverted);
      // });
    });
  });
}
