import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const generatedAnswerComponent = 'c-quantic-generated-answer';

export interface GeneratedAnswerSelector extends ComponentSelector {
  generatedAnswerCard: () => CypressSelector;
  generatedAnswer: () => CypressSelector;
  likeButton: () => CypressSelector;
  dislikeButton: () => CypressSelector;
}

export const GeneratedAnswerSelectors: GeneratedAnswerSelector = {
  get: () => cy.get(generatedAnswerComponent),

  generatedAnswerCard: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__card"]'),
  generatedAnswer: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__content"]'
    ),
  likeButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__feedback"] [data-cy="feedback__like-button"]'
    ),
  dislikeButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__feedback"] [data-cy="feedback__dislike-button"]'
    ),
};
