import {generateComponentHTML} from '../../fixtures/test-fixture';

type ResultSection =
  | 'visual'
  | 'badges'
  | 'actions'
  | 'title'
  | 'titleMetadata'
  | 'emphasized'
  | 'excerpt'
  | 'bottomMetadata';

export const ResultListSelectors = {
  component: 'atomic-result-list-v1',
  placeholder: 'atomic-result-placeholder-v1',
  result: 'atomic-result-v1',
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

export const resultListTemplateComponent = (
  slots: Partial<Record<ResultSection, string | HTMLElement>> = {}
) => {
  const sections = (
    Object.entries(slots).filter(([, content]) => content !== undefined) as [
      ResultSection,
      string | HTMLElement
    ][]
  ).map(
    ([section, content]) =>
      generateComponentHTML(ResultListSelectors.sections[section], {}, content)
        .outerHTML
  );
  return generateComponentHTML(
    'atomic-result-template',
    {},
    `<template>${sections.join('')}</template>`
  );
};

export const resultListComponent = (
  slot = '',
  display = 'list',
  image = 'icon',
  density = 'normal'
) =>
  generateComponentHTML(
    ResultListSelectors.component,
    {display, image, density},
    slot
  ).outerHTML;
