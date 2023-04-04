import {
  FoldedResultListSelector,
  FoldedResultListSelectors,
} from './folded-result-list-selectors';

function foldedResultListActions(selector: FoldedResultListSelector) {
  return {
    toggleMoreChidResults: () =>
      selector
        .childResultsToggleButton()
        .click()
        .logAction('When clicking on the child results toggle button'),
  };
}

export const FoldedResultListActions = {
  ...foldedResultListActions(FoldedResultListSelectors),
};
