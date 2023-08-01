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
  };
}

export const GeneratedAnswerActions = {
  ...generatedAnswerActions(GeneratedAnswerSelectors),
};
