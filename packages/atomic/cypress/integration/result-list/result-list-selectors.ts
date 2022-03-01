export type ResultSection =
  | 'visual'
  | 'badges'
  | 'actions'
  | 'title'
  | 'titleMetadata'
  | 'emphasized'
  | 'excerpt'
  | 'bottomMetadata';

export const resultSectionTags: Record<ResultSection, string> = {
  visual: 'atomic-result-section-visual',
  badges: 'atomic-result-section-badges',
  actions: 'atomic-result-section-actions',
  title: 'atomic-result-section-title',
  titleMetadata: 'atomic-result-section-title-metadata',
  emphasized: 'atomic-result-section-emphasized',
  excerpt: 'atomic-result-section-excerpt',
  bottomMetadata: 'atomic-result-section-bottom-metadata',
};

export const resultListComponent = 'atomic-result-list';

export const ResultListSelectors = {
  shadow: () => cy.get(resultListComponent).shadow(),
  root: () => ResultListSelectors.shadow().find('.list-root'),
  placeholder: () =>
    ResultListSelectors.shadow().find('atomic-result-placeholder'),
  result: () => ResultListSelectors.shadow().find('atomic-result'),
  firstResult: () => ResultListSelectors.result().first().shadow(),
  firstResultRoot: () => ResultListSelectors.firstResult().find('.result-root'),
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
