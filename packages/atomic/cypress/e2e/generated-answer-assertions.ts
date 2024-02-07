import {TestFixture} from '../fixtures/test-fixture';
import {should} from './common-assertions';
import {GeneratedAnswerSelectors} from './generated-answer-selectors';

export function assertLogOpenGeneratedAnswerSource() {
  cy.expectCustomEvent('generatedAnswer', 'openGeneratedAnswerSource');
}

export function assertLogGeneratedAnswerSourceHover() {
  cy.expectCustomEvent('generatedAnswer', 'generatedAnswerSourceHover');
}

export function assertLogGeneratedAnswerStreamEnd() {
  cy.expectCustomEvent('generatedAnswer', 'generatedAnswerStreamEnd');
}

export function assertLogLikeGeneratedAnswer() {
  cy.expectCustomEvent('generatedAnswer', 'likeGeneratedAnswer');
}

export function assertLogDislikeGeneratedAnswer() {
  cy.expectCustomEvent('generatedAnswer', 'dislikeGeneratedAnswer');
}

export function assertLogCopyGeneratedAnswer() {
  cy.expectCustomEvent('generatedAnswer', 'generatedAnswerCopyToClipboard');
}

export function assertLogRephraseGeneratedAnswer(format: string) {
  cy.expectSearchEvent('rephraseGeneratedAnswer').then((analyticsBody) => {
    expect(analyticsBody.customData).to.have.property('rephraseFormat', format);
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

export function assertLogHideGeneratedAnswer() {
  it('should log generatedAnswerHideAnswers analytics event', () => {
    cy.expectCustomEvent('generatedAnswer', 'generatedAnswerHideAnswers');
  });
}

export function assertLogShowGeneratedAnswer() {
  it('should log generatedAnswerShowAnswers analytics event', () => {
    cy.expectCustomEvent('generatedAnswer', 'generatedAnswerShowAnswers');
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

export function assertCopyButtonVisibility(isVisible: boolean) {
  it(`${should(isVisible)} show the copy button`, () => {
    GeneratedAnswerSelectors.copyButton().should(
      isVisible ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertAnswerCopiedToClipboard(answer: string) {
  cy.window().then((win) => {
    win.navigator.clipboard.readText().then((text) => {
      expect(text).to.eq(answer);
    });
  });
}
