import {
  GeneratedAnswerSelector,
  GeneratedAnswerSelectors,
} from './generated-answer-selectors';

function generatedAnswerActions(selector: GeneratedAnswerSelector) {
  return {
    likeGeneratedAnswer: () =>
      selector
        .likeButton()
        .click()
        .logAction('When clicking on the like button of the generated answer'),

    dislikeGeneratedAnswer: () =>
      selector
        .dislikeButton()
        .click()
        .logAction(
          'When clicking on the dislike button of the generated answer'
        ),

    clickCitation: (index: number) =>
      selector
        .citationLink(index)
        .then((element) => {
          // In the tests, we want to avoid opening a citation source in a new tab, cause originally the value of the target attribute is set to "_blank"
          element.get(0).setAttribute('target', '_self');
        })
        .click()
        .logAction(`When clicking on the citation link at the index ${index}`),

    clickRetry: () =>
      selector
        .retryButton()
        .click()
        .logAction('When clicking on the retry button of the generated answer'),

    clickToggleGeneratedAnswerButton: () =>
      selector
        .toggleGeneratedAnswerButton()
        .click()
        .logAction(
          'When clicking on the toggle button of the generated answer'
        ),

    clickFeedbackOption: (value: string, index: number) =>
      selector
        .feedbackOption(value, index)
        .click({force: true})
        .logAction(
          `When clicking the feedback option ${value} at the question at index ${index}`
        ),

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

    typeInFeedbackDocumentUrlInput: (text: string) =>
      selector
        .feedbackDocumentUrlInput()
        .type(text)
        .logAction('When typing in the feedback document url input'),

    typeInFeedbackDetailsInput: (text: string) =>
      selector
        .feedbackDetailsInput()
        .type(text)
        .logAction('When typing in the feedback details input'),

    hoverOverCitation: (index: number) =>
      selector
        .citationLink(index)
        .trigger('mouseenter')
        .logAction(`When hovering over the citation at index ${index}`),

    stopHoverOverCitation: (index: number) =>
      selector
        .citationLink(index)
        .trigger('mouseleave')
        .logAction(`When stop hovering over the citation at index ${index}`),

    clickCopyToClipboardButton: () =>
      selector
        .copyToClipboardButton()
        .click()
        .logAction('When clicking on the copy to clipboard button'),

    clickToggleCollapseButton: () =>
      selector
        .toggleCollapseButton()
        .click()
        .logAction('When clicking on the toggle collapse button'),
  };
}

export const GeneratedAnswerActions = {
  ...generatedAnswerActions(GeneratedAnswerSelectors),
};
