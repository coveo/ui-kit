import {TestFixture} from '../fixtures/test-fixture';
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

export function assertLogHoverGeneratedAnswerSource(log: boolean) {
  if (log) {
    cy.expectCustomEvent('generatedAnswer', 'openGeneratedAnswerSource');
  } else {
    cy.wait(50);
    cy.wrap(AnalyticsTracker).invoke('getLastCustomEvent').should('not.exist');
  }
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
      'have.attr',
      'aria-checked',
      String(!!checked)
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

export function assertAnswerStyle(expected: string) {
  cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
    expect(
      firstSearch.request.body.pipelineRuleParameters
        .mlGenerativeQuestionAnswering.responseFormat
    ).to.have.property('answerStyle', expected);
  });
}
