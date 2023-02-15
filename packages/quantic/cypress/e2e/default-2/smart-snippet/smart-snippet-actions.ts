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
        .click()
        .logAction('When clicking on the smart snippet source title'),

    clickSmartSnippetSourceUri: () =>
      selector
        .smartSnippetSourceUri()
        .click()
        .logAction('When clicking on the smart snippet source uri'),

    clickSmartSnippetInlineLink: () =>
      selector
        .smartSnippetInlineLink()
        .click()
        .logAction(
          'When clicking on an inline link within the smart snippet answer'
        ),
  };
}

export const SmartSnippetActions = {
  ...smartSnippetActions(SmartSnippetSelectors),
};
