import {should} from './common-assertions';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

export function assertShowMore(display: boolean) {
  it(`${should(display)} display the show more button`, () => {
    SmartSnippetSelectors.showMoreButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertShowLess(display: boolean) {
  it(`${should(display)} display the show less button`, () => {
    SmartSnippetSelectors.showLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertAnswerHeight(expectedHeight: number) {
  it(`the answer should have a displayed height of ${expectedHeight}px`, () => {
    SmartSnippetSelectors.truncatedAnswer()
      .invoke('height')
      .should('equal', expectedHeight);
  });
}

export function assertAnswerTopMargin(margin: number) {
  it(`has a ${margin}px gap between the title and the snippet`, () => {
    SmartSnippetSelectors.question()
      .distanceTo(SmartSnippetSelectors.answer)
      .should('have.property', 'vertical', margin);
  });
}

export function assertAnswerBottomMargin(margin: number) {
  it(`has a ${margin} gap between the snippet and the show less button`, () => {
    SmartSnippetSelectors.answer()
      .distanceTo(SmartSnippetSelectors.showLessButton)
      .should('have.property', 'vertical', margin);
  });
}
