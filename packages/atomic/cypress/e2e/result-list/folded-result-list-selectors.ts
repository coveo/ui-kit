import {
  listRoot,
  resultComponent,
  resultPlaceholderComponent,
  resultRoot,
  resultSectionTags,
} from './result-list-selectors';

export const foldedResultListComponent = 'atomic-folded-result-list';
export const resultChildrenComponent = 'atomic-result-children';
export const resultChildrenTemplateComponent =
  'atomic-result-children-template';
export const beforeChildrenSlotName = 'before-children';
export const afterChildrenSlotName = 'after-children';

export const FoldedResultListSelectors = {
  shadow: () => cy.get(foldedResultListComponent).shadow(),
  root: () => FoldedResultListSelectors.shadow().find(listRoot),
  placeholder: () =>
    FoldedResultListSelectors.shadow().find(resultPlaceholderComponent),
  result: () => FoldedResultListSelectors.shadow().find(resultComponent),
  resultAt: (index = 0) =>
    FoldedResultListSelectors.result().shadow().eq(index),
  firstResult: () => FoldedResultListSelectors.result().first().shadow(),
  loadMoreChildren: () =>
    FoldedResultListSelectors.shadow().find('[part~="show-hide-button"]', {
      includeShadowDom: true,
    }),

  firstResultRoot: () =>
    FoldedResultListSelectors.firstResult().find(resultRoot),
  resultChildren: (resultIndex = 0) =>
    FoldedResultListSelectors.resultAt(resultIndex).find(
      resultChildrenComponent
    ),
  childResult: (childResultIndex: number, resultIndex = 0) =>
    FoldedResultListSelectors.resultChildren(resultIndex)
      .eq(childResultIndex)
      .shadow()
      .find(resultComponent),
  collapseButton: () =>
    FoldedResultListSelectors.shadow().find('[part~="show-hide-button"]', {
      includeShadowDom: true,
    }),
  childResultAtIndex: (childResultIndex: number, resultIndex = 0) =>
    FoldedResultListSelectors.resultChildren(resultIndex)
      .shadow()
      .find(resultComponent)
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
      .find(resultComponent)
      .shadow()
      .eq(grandChildIndex),
  noResultsLabel: () =>
    FoldedResultListSelectors.resultChildren()
      .should('have.attr', 'data-atomic-rendered', 'true')
      .shadow()
      .find('[part="no-result-root"]'),
  childrenRoot: () =>
    FoldedResultListSelectors.resultChildren()
      .shadow()
      .find('[part="children-root"]'),
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
