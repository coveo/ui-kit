import {convertFacetValueToAPIformat} from '../facet/facet-actions';
import {FacetSelector, numericFacetComponent} from '../facet/facet-selectors';
import {
  convertRangeToFacetValue,
  convertFacetValueToRange,
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
      if (rangeAlgorithm === 'even') {
        const firstRange = convertFacetValueToRange(elements[0]);
        elements.forEach((element: string) => {
          const rangeConverted = convertFacetValueToRange(element);
          expect(firstRange.end - firstRange.start).equals(
            rangeConverted.end - rangeConverted.start
          );
        });
      }
      if (rangeAlgorithm === 'equiprobable') {
        let allRangesEqual = true;
        elements.forEach((element: string) => {
          const currentRangeConverted = convertFacetValueToRange(element);
          elements.forEach((otherElements: string) => {
            const rangeConverted = convertFacetValueToRange(otherElements);
            allRangesEqual =
              currentRangeConverted.end - currentRangeConverted.start ===
              rangeConverted.end - rangeConverted.start;
            if (!allRangesEqual) return;
          });
          expect(allRangesEqual).equals(false);
        });
      }
    });
  });
}
