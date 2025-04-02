export type ResultSection =
  | 'visual'
  | 'badges'
  | 'actions'
  | 'title'
  | 'titleMetadata'
  | 'emphasized'
  | 'excerpt'
  | 'bottomMetadata'
  | 'children';

export const resultSectionTags: Record<ResultSection, string> = {
  visual: 'atomic-result-section-visual',
  badges: 'atomic-result-section-badges',
  actions: 'atomic-result-section-actions',
  title: 'atomic-result-section-title',
  titleMetadata: 'atomic-result-section-title-metadata',
  emphasized: 'atomic-result-section-emphasized',
  excerpt: 'atomic-result-section-excerpt',
  bottomMetadata: 'atomic-result-section-bottom-metadata',
  children: 'atomic-result-section-children',
};

export const resultComponent = 'atomic-result';
export const resultPlaceholderComponent = 'atomic-result-placeholder';
export const resultListComponent = 'atomic-result-list';

export const listRoot = '.list-root';
export const resultRoot = '.result-root';

export const ResultListSelectors = {
  shadow: () => cy.get(resultListComponent).shadow(),
  root: () => ResultListSelectors.shadow().find(listRoot),
  placeholder: () =>
    ResultListSelectors.shadow().find(resultPlaceholderComponent),
  result: () => ResultListSelectors.shadow().find(resultComponent),
  resultGridClickable: () =>
    ResultListSelectors.shadow().find('[part="result-list-grid-clickable"]'),
  resultGridClickableContainer: () =>
    ResultListSelectors.shadow().find(
      '[part="result-list-grid-clickable-container"]'
    ),
  firstResult: () => ResultListSelectors.result().first().shadow(),
  firstResultRoot: () => ResultListSelectors.firstResult().find(resultRoot),
  sections: {
    visual: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.visual),
    badges: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.badges),
    actions: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.actions),
    title: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.title),
    titleMetadata: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.titleMetadata),
    emphasized: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.emphasized),
    excerpt: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.excerpt),
    bottomMetadata: () =>
      ResultListSelectors.firstResult().find(resultSectionTags.bottomMetadata),
  },
};

export function getFirstResult() {
  return ResultListSelectors.firstResult();
}
