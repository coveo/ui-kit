import {TestFixture} from '../../../fixtures/test-fixture';
import {
  BaseFacetSelector,
  FacetWithLinkSelector,
} from '../facet-common-assertions';
import {ratingFacetDefaultNumberOfIntervals} from './rating-facet-actions';

export interface BaseRatingFacetSelector
  extends BaseFacetSelector,
    FacetWithLinkSelector {
  starsIconAtIndex: (index: number) => Cypress.Chainable<JQuery<HTMLElement>>;
  facetValueAtIndex: (index: number) => Cypress.Chainable<JQuery<HTMLElement>>;
  valueRating: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function assertNumberOfStarAtIndex(
  BaseRatingFacetSelector: BaseRatingFacetSelector,
  stars: number,
  index = 1
) {
  it(`should display ${stars} number of stars each line`, () => {
    BaseRatingFacetSelector.starsIconAtIndex(index)
      .its('length')
      .should('eq', stars * 2);
  });
}

export function assertNumberofYellowStar(
  BaseRatingFacetSelector: BaseRatingFacetSelector,
  index: number | 'last',
  count: number,
  interval = ratingFacetDefaultNumberOfIntervals
) {
  it(`should display ${count} yellow star(s) at facetValue index "${index}""`, () => {
    const percentDisplayStars = (100 * count) / interval;
    if (index === 'last') {
      BaseRatingFacetSelector.valueRating()
        .last()
        .find('div[style]')
        .should('have.attr', 'style', `width: ${percentDisplayStars}%;`);
    } else {
      BaseRatingFacetSelector.facetValueAtIndex(index)
        .find('div[style]')
        .should('have.attr', 'style', `width: ${percentDisplayStars}%;`);
    }
  });
}

export function assertLogRatingFacetSelect(field: string) {
  it('should log the facet select results to UA ', () => {
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);
    });
  });
}

export function assertSelectedFacetValueContainsNumberOfStar(
  BaseRatingFacetSelector: BaseRatingFacetSelector,
  count: number,
  interval = ratingFacetDefaultNumberOfIntervals
) {
  it(`display ${count} yellow star(s) at selected facetValue`, () => {
    const percentDisplayStars = (100 * count) / interval;
    BaseRatingFacetSelector.selectedLinkValue()
      .parent()
      .find('[part="value-rating"]')
      .find('div[style]')
      .should('have.attr', 'style', `width: ${percentDisplayStars}%;`);
  });
}
