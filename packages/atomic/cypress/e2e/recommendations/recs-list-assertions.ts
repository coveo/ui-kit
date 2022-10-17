import {RecsSelectors} from './recs-list-selectors';

export function assertRendersRecommendations(numberOfRecs: number) {
  it(`should render the right number of recommendations (${numberOfRecs})`, () => {
    RecsSelectors.result()
      .should('have.length', numberOfRecs)
      .and('be.visible');
  });
}

export function assertRendersPlaceholders(numberOfRecs: number) {
  it(`should render the right number of placeholders (${numberOfRecs})`, () => {
    RecsSelectors.placeholder()
      .should('have.length', numberOfRecs)
      .and('be.visible');
  });
}

export function assertRendersIndicators(numberOfPages: number) {
  it(`should render the right number of indicators (${numberOfPages})`, () => {
    RecsSelectors.indicator()
      .should('have.length', numberOfPages)
      .and('be.visible');
  });
}

export function assertIndicatorsActiveAtIndex(index: number) {
  it(`should activated indicators at the index #${index}`, () => {
    RecsSelectors.indicator()
      .eq(index)
      .should('have.attr', 'part')
      .then((part) => {
        expect(part).to.contain('active-indicator');
      });
  });
}

export function assertFirstRecommendationsContainsText(text: string) {
  it(`first result should contain the text ${text}`, () => {
    RecsSelectors.firstResult().should('contain.text', text);
  });
}
