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
  placeholder: () =>
    ResultListSelectors.shadow().find('atomic-result-placeholder'),
  result: () => ResultListSelectors.shadow().find('atomic-result'),
  firstResult: () => ResultListSelectors.result().first().shadow(),
  sections: {
    visual: () =>
      ResultListSelectors.firstResult().find('atomic-result-section-visual'),
    badges: () =>
      ResultListSelectors.firstResult().find('atomic-result-section-badges'),
    actions: () =>
      ResultListSelectors.firstResult().find('atomic-result-section-actions'),
    title: () =>
      ResultListSelectors.firstResult().find('atomic-result-section-title'),
    titleMetadata: () =>
      ResultListSelectors.firstResult().find(
        'atomic-result-section-title-metadata'
      ),
    emphasized: () =>
      ResultListSelectors.firstResult().find(
        'atomic-result-section-emphasized'
      ),
    excerpt: () =>
      ResultListSelectors.firstResult().find('atomic-result-section-excerpt'),
    bottomMetadata: () =>
      ResultListSelectors.firstResult().find(
        'atomic-result-section-bottom-metadata'
      ),
  },
};

export function getFirstResult() {
  return ResultListSelectors.firstResult();
}
