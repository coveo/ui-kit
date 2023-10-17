import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';
import {GeneratedAnswerSelectors} from './generated-answer-selectors';

export function assertLogOpenGeneratedAnswerSource(log: boolean) {
  it(`${should(log)} log a openGeneratedAnswerSource click event`, () => {
    if (log) {
      cy.expectCustomEvent('generatedAnswer', 'openGeneratedAnswerSource');
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker)
        .invoke('getLastCustomEvent')
        .should('not.exist');
    }
  });
}

export function assertAnswerVisibility(isVisible: boolean) {
  it(`${should(isVisible)} show the generated answer`, () => {
    GeneratedAnswerSelectors.answer().should(
      isVisible ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertFeedbackButtonsVisibility(isVisible: boolean) {
  it(`${should(isVisible)} show the feedback buttons`, () => {
    const expectation = isVisible ? 'be.visible' : 'not.exist';
    GeneratedAnswerSelectors.likeButton().should(expectation);
    GeneratedAnswerSelectors.dislikeButton().should(expectation);
  });
}

export function assertToggleValue(checked: boolean) {
  it(`toggle ${should(checked)} be checked`, () => {
    GeneratedAnswerSelectors.toggle().should(
      checked ? 'have.attr' : 'not.have.attr',
      'aria-checked'
    );
  });
}

export function assertLocalStorageData(data: {isVisible: boolean}) {
  it(`should have value in local storage: ${JSON.stringify(data)}`, () => {
    cy.window().then((win) => {
      const stored = JSON.parse(
        win.localStorage.getItem('coveo-generated-answer-data') ?? '{}'
      );
      expect(stored).eql(data);
    });
  });
}
