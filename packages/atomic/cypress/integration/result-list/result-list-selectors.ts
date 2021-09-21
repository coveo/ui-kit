import {ResultTemplateSelectors} from '../result-templates/result-template-selectors';

type ResultSection =
  | 'visual'
  | 'badges'
  | 'actions'
  | 'title'
  | 'titleMetadata'
  | 'emphasized'
  | 'excerpt'
  | 'bottomMetadata';

export const resultListComponent = 'atomic-result-list';

export const ResultListSelectors = {
  shadow: () => cy.get(resultListComponent).shadow(),
  placeholder: () =>
    ResultListSelectors.shadow().find('atomic-result-placeholder'),
  result: () => ResultListSelectors.shadow().find('atomic-result'),
  firstResult: () => ResultListSelectors.result().first().shadow(),
  sections: <Record<ResultSection, string>>{
    visual: 'atomic-result-section-visual',
    badges: 'atomic-result-section-badges',
    actions: 'atomic-result-section-actions',
    title: 'atomic-result-section-title',
    titleMetadata: 'atomic-result-section-title-metadata',
    emphasized: 'atomic-result-section-emphasized',
    excerpt: 'atomic-result-section-excerpt',
    bottomMetadata: 'atomic-result-section-bottom-metadata',
  },
};

export const generateResultTemplate = (
  slots: Partial<Record<ResultSection, string | HTMLElement>> = {}
) => {
  const sections = (
    Object.entries(slots).filter(([, content]) => content !== undefined) as [
      ResultSection,
      string
    ][]
  ).map(
    ([section, content]) =>
      `<${ResultListSelectors.sections[section]}>${content}</${ResultListSelectors.sections[section]}>`
  );
  return `<${ResultTemplateSelectors.component}><template>${sections.join(
    ''
  )}</template></${ResultTemplateSelectors.component}>`;
};

export const generateResultList = (
  slot = '',
  options?: {display?: string; image?: string; density?: string}
) =>
  `<${resultListComponent}
    display="${options?.display ?? 'list'}"
    image="${options?.image ?? 'icon'}"
    density="${options?.density ?? 'normal'}"
   >
    ${slot}
   </${resultListComponent}>`;

export function getFirstResult() {
  return ResultListSelectors.firstResult();
}
