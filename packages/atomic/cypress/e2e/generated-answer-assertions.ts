import {should} from './common-assertions';
import {GeneratedAnswerSelectors} from './generated-answer-selectors';

export function assertLogOpenGeneratedAnswerSource() {
  cy.expectClickEvent('generatedAnswerCitationClick');
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

export function assertToggleVisibility(isVisible: boolean) {
  it(`${should(isVisible)} show the toggle button`, () => {
    GeneratedAnswerSelectors.toggle().should(
      isVisible ? 'be.visible' : 'not.exist'
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

export function assertDisclaimer(isDisplayed: boolean) {
  it(`${should(isDisplayed)} show the disclaimer`, () => {
    GeneratedAnswerSelectors.disclaimer().should(
      isDisplayed ? 'exist' : 'not.exist'
    );
  });
}

export function assertShowButton(isDisplayed: boolean) {
  it(`${should(isDisplayed)} show the show button`, () => {
    GeneratedAnswerSelectors.showButton().should(
      isDisplayed ? 'be.visible' : 'be.hidden'
    );
  });
}

export function assertAnswerCollapsed(isCollapsed: boolean) {
  it(`${should(isCollapsed)} show the answer collapsed`, () => {
    GeneratedAnswerSelectors.answerContainer().should(
      isCollapsed ? 'have.class' : 'not.have.class',
      'answer-collapsed'
    );
  });
}

export function assertShowMoreLabel(isShowMore: boolean) {
  const expectedLabel = isShowMore ? 'show more' : 'show less';
  it(`should show the ${expectedLabel} label`, () => {
    GeneratedAnswerSelectors.showButton().should(
      'have.text',
      isShowMore ? 'Show more' : 'Show less'
    );
  });
}
