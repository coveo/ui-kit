import {RatingRangeFacetSelectors} from './rating-range-facet-selectors';

export function assertFacetValueContainsTextOnlyAndUp() {
  it('should contains text "Only and & Up"', () => {
    RatingRangeFacetSelectors.valueLabel().as('ratingRangeFacetAllValuesLabel');
    cy.getTextOfAllElements('@ratingRangeFacetAllValuesLabel').then(
      (element) => {
        (element as string[]).forEach((el: string, i: number) => {
          if (i === 0) {
            expect(el).to.contain('only');
          } else {
            expect(el).to.contain('& up');
          }
        });
      }
    );
  });
}

export function assertFacetValueContainsAndUp() {
  it('should contains text "& Up"', () => {
    RatingRangeFacetSelectors.valueLabel().as('ratingRangeFacetAllValuesLabel');
    cy.getTextOfAllElements('@ratingRangeFacetAllValuesLabel').then(
      (element) => {
        (element as string[]).forEach((el: string) => {
          expect(el).to.contain('& up');
        });
      }
    );
  });
}
