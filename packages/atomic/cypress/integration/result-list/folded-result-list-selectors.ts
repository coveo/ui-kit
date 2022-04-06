import {resultSectionTags} from './result-list-selectors';

export const foldedResultListComponent = 'atomic-folded-result-list';

export const FoldedResultListSelectors = {
  shadow: () => cy.get(foldedResultListComponent).shadow(),
  root: () => FoldedResultListSelectors.shadow().find('.list-root'),
  placeholder: () =>
    FoldedResultListSelectors.shadow().find('atomic-result-placeholder'),
  result: () => FoldedResultListSelectors.shadow().find('atomic-result'),
  resultAt: (index = 0) =>
    FoldedResultListSelectors.shadow().find('atomic-result').eq(index),
  firstResult: () => FoldedResultListSelectors.result().first().shadow(),
  firstResultRoot: () =>
    FoldedResultListSelectors.firstResult().find('.result-root'),
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

export function getAtomicResultAtIndex(
  selectors: typeof FoldedResultListSelectors,
  index: number
) {
  return selectors
    .firstResult()
    .find('atomic-result-children')
    .shadow()
    .find('atomic-result')
    .eq(index)
    .shadow();
}
