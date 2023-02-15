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
    SmartSnippetSelectors.get().find('[data-cy="smart-snippet__inline-link"]'),
};
