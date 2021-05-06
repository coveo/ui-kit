import {convertFacetValueToAPIformat} from '../facet/facet-actions';
import {FacetSelector, numericFacetComponent} from '../facet/facet-selectors';
import {
  convertRangeToFacetValue,
  numericField,
  NumericRange,
  numericRanges,
} from './numeric-facet-actions';

export function assertNumericFacetValueOnUrl(
  index = 0,
  field = numericField,
  type = numericFacetComponent,
  valueSeparator = 'to'
) {
  it('Should reflected selected facetValue on Url', () => {
    FacetSelector.facetValueLabelAtIndex(index, field, type)
      .invoke('text')
      .then((txt) => {
        const facetValueInApiFormat = convertFacetValueToAPIformat(
          txt,
          type,
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
  it('Should generate all manually specified ranges', () => {
    FacetSelector.valueLabels(numericField, numericFacetComponent).as(
      'numericFacetAllValueLabels'
    );
    cy.getTextOfAllElements('@numericFacetAllValueLabels').then((elements) => {
      console.log(elements);
      ranges.forEach((r: NumericRange) => {
        const facetValueConverted = convertRangeToFacetValue(r);
        expect(elements).to.include(facetValueConverted);
      });
    });
  });
}
