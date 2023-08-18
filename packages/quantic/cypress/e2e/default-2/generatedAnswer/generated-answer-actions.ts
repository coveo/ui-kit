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
  };
}

export const GeneratedAnswerActions = {
  ...generatedAnswerActions(GeneratedAnswerSelectors),
};
