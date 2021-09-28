import {
  TestFixture,
  generateComponentHTML,
  TagProps,
} from '../../fixtures/test-fixture';
import {resultTemplateComponent} from '../result-templates/result-template-selectors';
import {
  resultListComponent,
  ResultSection,
  resultSectionTags,
} from './result-list-selectors';

function toArray<T>(values: T | T[]): T[] {
  return Array.isArray(values) ? values : [values];
}

export function buildTemplateWithoutSections(
  elements: HTMLElement | HTMLElement[],
  props: TagProps = {}
) {
  const resultTemplate = generateComponentHTML(resultTemplateComponent, props);
  const template = generateComponentHTML('template') as HTMLTemplateElement;
  resultTemplate.appendChild(template);
  toArray(elements).forEach((element) => template.content.appendChild(element));
  return resultTemplate;
}

export function buildTemplateWithSections(
  sections: Partial<Record<ResultSection, HTMLElement | HTMLElement[]>>,
  props: TagProps = {}
) {
  const sectionPairs = Object.entries(sections) as [
    ResultSection,
    HTMLElement | HTMLElement[]
  ][];
  const sectionsEls: HTMLElement[] = [];
  for (const [section, elements] of sectionPairs) {
    const sectionEl = generateComponentHTML(resultSectionTags[section]);
    toArray(elements).forEach((e) => sectionEl.appendChild(e));
    sectionsEls.push(sectionEl);
  }
  return buildTemplateWithoutSections(sectionsEls, props);
}

export const addResultList =
  (template?: HTMLElement) => (fixture: TestFixture) => {
    const resultList = generateComponentHTML(resultListComponent);
    if (template) {
      resultList.appendChild(template);
    }
    fixture.withElement(resultList);
  };
