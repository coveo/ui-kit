import {resultSectionTags} from './result-list-selectors';

export const foldedResultListComponent = 'atomic-folded-result-list';
export const resultChildrenComponent = 'atomic-result-children';
export const resultChildrenTemplateComponent =
  'atomic-result-children-template';

export const beforeChildrenSlotName = 'before-children';
export const afterChildrenSlotName = 'after-children';

export const FoldedResultListSelectors = {
  shadow: () => cy.get(foldedResultListComponent).shadow(),
  root: () => FoldedResultListSelectors.shadow().find('.list-root'),
  placeholder: () =>
    FoldedResultListSelectors.shadow().find('atomic-result-placeholder'),
  result: () => FoldedResultListSelectors.shadow().find('atomic-result'),
  resultAt: (index = 0) =>
    FoldedResultListSelectors.result().shadow().eq(index),
  firstResult: () => FoldedResultListSelectors.result().first().shadow(),
  firstResultRoot: () =>
    FoldedResultListSelectors.firstResult().find('.result-root'),
  resultChildren: (resultIndex = 0) =>
    FoldedResultListSelectors.resultAt(resultIndex).find(
      resultChildrenComponent
    ),
  childResultAtIndex: (childResultIndex: number, resultIndex = 0) =>
    FoldedResultListSelectors.resultChildren(resultIndex)
      .shadow()
      .find('atomic-result')
      .eq(childResultIndex)
      .shadow(),
  grandChildResultAtIndex: (
    grandChildIndex: number,
    childResultIndex = 0,
    resultIndex = 0
  ) =>
    FoldedResultListSelectors.childResultAtIndex(childResultIndex, resultIndex)
      .find(resultChildrenComponent)
      .shadow()
      .find('atomic-result')
      .shadow()
      .eq(grandChildIndex),
  sections: {
    visual: () =>
      FoldedResultListSelectors.firstResult().find(resultSectionTags.visual),
    badges: () =>
      FoldedResultListSelectors.firstResult().find(resultSectionTags.badges),
    actions: () =>
      FoldedResultListSelectors.firstResult().find(resultSectionTags.actions),
    title: () =>
      FoldedResultListSelectors.firstResult().find(resultSectionTags.title),
    titleMetadata: () =>
      FoldedResultListSelectors.firstResult().find(
        resultSectionTags.titleMetadata
      ),
    emphasized: () =>
      FoldedResultListSelectors.firstResult().find(
        resultSectionTags.emphasized
      ),
    excerpt: () =>
      FoldedResultListSelectors.firstResult().find(resultSectionTags.excerpt),
    bottomMetadata: () =>
      FoldedResultListSelectors.firstResult().find(
        resultSectionTags.bottomMetadata
      ),
  },
};
