import {TestFixture, generateComponentHTML} from '../../fixtures/test-fixture';
import {ResultSection, resultSectionTags} from './result-list-selectors';

function toArray<T>(values: T | T[]): T[] {
  return Array.isArray(values) ? values : [values];
}

function buildTemplate(
  sections: Partial<Record<ResultSection, HTMLElement | HTMLElement[]>>
) {
  const sectionPairs = Object.entries(sections) as [
    ResultSection,
    HTMLElement | HTMLElement[]
  ][];
  if (sectionPairs.length === 0) {
    return null;
  }
  const resultTemplate = generateComponentHTML('atomic-result-template');
  const template = generateComponentHTML('template') as HTMLTemplateElement;
  resultTemplate.appendChild(template);
  for (const [section, elements] of sectionPairs) {
    const element = generateComponentHTML(resultSectionTags[section]);
    toArray(elements).forEach((e) => element.appendChild(e));
    template.content.appendChild(element);
  }
  return resultTemplate;
}

export const addResultList =
  (
    sections: Partial<Record<ResultSection, HTMLElement | HTMLElement[]>> = {}
  ) =>
  (fixture: TestFixture) => {
    const resultList = generateComponentHTML('atomic-result-list');
    const template = buildTemplate(sections);
    if (template) {
      resultList.appendChild(template);
    }
    fixture.withElement(resultList);
  };
