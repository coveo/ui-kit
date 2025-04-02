import {
  SmartSnippetSelector,
  SmartSnippetSelectors,
} from './smart-snippet-selectors';

function smartSnippetActions(selector: SmartSnippetSelector) {
  return {
    toggleSmartSnippetAnswer: () =>
      selector
        .smartSnippetAnswerToggle()
        .click()
        .logAction('When clicking on the smart snippet answer toggle'),

    clickSmartSnippetSourceTitle: () =>
      selector
        .smartSnippetSourceTitle()
        .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
        .click()
        .logAction('When clicking on the smart snippet source title'),

    clickSmartSnippetSourceUri: () =>
      selector
        .smartSnippetSourceUri()
        .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
        .click()
        .logAction('When clicking on the smart snippet source uri'),

    clickSmartSnippetInlineLink: () =>
      selector
        .smartSnippetInlineLink()
        .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
        .click()
        .logAction(
          'When clicking on an inline link within the smart snippet answer'
        ),
    clickSmartSnippetLikeButton: () =>
      selector
        .smartSnippetLikeButton()
        .click()
        .logAction('When clicking on the feedback like button'),

    clickSmartSnippetDislikeButton: () =>
      selector
        .smartSnippetDislikeButton()
        .click()
        .logAction('When clicking on the feedback dislike button'),

    clickSmartSnippetExplainWhyButton: () =>
      selector
        .smartSnippetExplainWhyButton()
        .click()
        .logAction('When clicking on the feedback explain why button'),

    clickFeedbackOption: (index: number) =>
      selector
        .feedbackOption(index)
        .click({force: true})
        .logAction(`When clicking the feedback option at the index ${index}`),

    clickFeedbackSubmitButton: () =>
      selector
        .feedbackSubmitButton()
        .click()
        .logAction('When clicking on the feedback modal submit button'),

    clickFeedbackCancelButton: () =>
      selector
        .feedbackCancelButton()
        .click()
        .logAction('When clicking on the feedback modal cancel button'),

    clickFeedbackDoneButton: () =>
      selector
        .feedbackDoneButton()
        .click()
        .logAction('When clicking on the feedback modal done button'),

    typeInFeedbackDetailsInput: (text: string) =>
      selector
        .feedbackDetailsInput()
        .type(text)
        .logAction('When typing in the feedback details input'),
  };
}

export const SmartSnippetActions = {
  ...smartSnippetActions(SmartSnippetSelectors),
};
