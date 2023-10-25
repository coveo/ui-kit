import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const smartSnippetComponent = 'c-quantic-smart-snippet';

export interface SmartSnippetSelector extends ComponentSelector {
  smartSnippetCard: () => CypressSelector;
  smartSnippetQuestion: () => CypressSelector;
  smartSnippetAnswer: () => CypressSelector;
  smartSnippetSourceUri: () => CypressSelector;
  smartSnippetSourceTitle: () => CypressSelector;
  smartSnippetAnswerToggle: () => CypressSelector;
  smartSnippetExpandableAnswer: () => CypressSelector;
  smartSnippetInlineLink: () => CypressSelector;
  smartSnippetLikeButton: () => CypressSelector;
  smartSnippetDislikeButton: () => CypressSelector;
  smartSnippetExplainWhyButton: () => CypressSelector;
  feedbackOption: (index: number) => CypressSelector;
  feedbackSubmitButton: () => CypressSelector;
  feedbackCancelButton: () => CypressSelector;
  feedbackDoneButton: () => CypressSelector;
  feedbackDetailsInput: () => CypressSelector;
}

export const SmartSnippetSelectors: SmartSnippetSelector = {
  get: () => cy.get(smartSnippetComponent),

  smartSnippetCard: () =>
    SmartSnippetSelectors.get().find('[data-cy="smart-snippet-card"]'),
  smartSnippetQuestion: () =>
    SmartSnippetSelectors.smartSnippetCard().find('header'),
  smartSnippetAnswer: () =>
    SmartSnippetSelectors.get().find('[data-cy="smart-snippet-answer"]'),
  smartSnippetSourceUri: () =>
    SmartSnippetSelectors.get().find('[data-cy="smart-snippet__source-uri"]'),
  smartSnippetSourceTitle: () =>
    SmartSnippetSelectors.get().find('[data-cy="smart-snippet__source-title"]'),
  smartSnippetAnswerToggle: () =>
    SmartSnippetSelectors.get().find('[data-cy="smart-snippet-answer-toggle"]'),
  smartSnippetExpandableAnswer: () =>
    SmartSnippetSelectors.get().find(
      '[data-cy="expandable-smart-snippet-answer"]'
    ),
  smartSnippetInlineLink: () =>
    SmartSnippetSelectors.get().find(
      '[data-cy="smart-snippet__inline-link"] > a'
    ),
  smartSnippetLikeButton: () =>
    SmartSnippetSelectors.get().find('[data-cy="feedback__like-button"]'),
  smartSnippetDislikeButton: () =>
    SmartSnippetSelectors.get().find('[data-cy="feedback__dislike-button"]'),
  smartSnippetExplainWhyButton: () =>
    SmartSnippetSelectors.get().find(
      '[data-cy="feedback__explain-why-button"]'
    ),
  feedbackOption: (index: number) =>
    cy.get('lightning-modal').find('lightning-radio-group input').eq(index),
  feedbackSubmitButton: () =>
    cy.get('lightning-modal').find('[data-cy="feedback-modal-footer__submit"]'),
  feedbackCancelButton: () =>
    cy.get('lightning-modal').find('[data-cy="feedback-modal-footer__cancel"]'),
  feedbackDoneButton: () =>
    cy.get('lightning-modal').find('[data-cy="feedback-modal-footer__done"]'),
  feedbackDetailsInput: () =>
    cy
      .get('lightning-modal')
      .find('[data-cy="feedback-modal-body__details-input"] textarea'),
};
