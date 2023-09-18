import {RecsSelectors} from './recs-list-selectors';

export function assertRendersRecommendations(numberOfRecs: number) {
  RecsSelectors.result().should('have.length', numberOfRecs).and('be.visible');
}

export function assertRendersPlaceholders(numberOfRecs: number) {
  RecsSelectors.placeholder()
    .should('have.length', numberOfRecs)
    .and('be.visible');
}

export function assertRendersIndicators(numberOfPages: number) {
  RecsSelectors.indicator()
    .should('have.length', numberOfPages)
    .and('be.visible');
}

export function assertIndicatorsActiveAtIndex(index: number) {
  RecsSelectors.indicator()
    .eq(index)
    .should('have.attr', 'part')
    .then((part) => {
      expect(part).to.contain('active-indicator');
    });
}

export function assertFirstRecommendationsContainsText(text: string) {
  RecsSelectors.firstResult().should('contain.text', text);
}
