import {should} from './common-assertions';
import {SmartSnippetFeedbackModalSelectors} from './smart-snippet-feedback-modal-selectors';

export function assertDisplayModal(opened: boolean) {
  it(`${should(opened)} display the smart snippet feedback modal`, () => {
    cy.get('atomic-search-interface').should(
      opened ? 'have.class' : 'not.have.class',
      'atomic-modal-opened'
    );
    cy.get('body').should(
      opened ? 'have.class' : 'not.have.class',
      'atomic-modal-opened'
    );
  });
}

export function assertFormErrors() {
  it('should display form validation errors', () => {
    SmartSnippetFeedbackModalSelectors.invalidInputs().should('exist');
  });
}

export function assertDisplayDetails(display: boolean) {
  it(`${should(display)} display the details textarea`, () => {
    SmartSnippetFeedbackModalSelectors.detailsInput().should(
      display ? 'exist' : 'not.exist'
    );
  });
}

export function assertLogOpenSmartSnippetFeedbackModal() {
  it('should log a openSmartSnippetFeedbackModal custom event', () => {
    cy.expectCustomEvent('smartSnippet', 'openSmartSnippetFeedbackModal');
  });
}

export function assertLogCloseSmartSnippetFeedbackModal() {
  it('should log a closeSmartSnippetFeedbackModal custom event', () => {
    cy.expectCustomEvent('smartSnippet', 'closeSmartSnippetFeedbackModal');
  });
}

export function assertLogSendSpecificSmartSnippetFeedback() {
  it('should log a sendSmartSnippetReason custom event without details', () => {
    cy.expectCustomEvent('smartSnippet', 'sendSmartSnippetReason')
      .its('customData')
      .should('not.have.a.property', 'details');
  });
}

export function assertLogSendDetailedSmartSnippetFeedback() {
  it('should log a sendSmartSnippetReason custom event with details', () => {
    cy.expectCustomEvent('smartSnippet', 'sendSmartSnippetReason')
      .its('customData')
      .should('have.a.property', 'details');
  });
}
