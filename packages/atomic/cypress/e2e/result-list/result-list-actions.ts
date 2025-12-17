import {ResultWithFolding} from '@coveo/headless/dist/definitions/features/folding/folding-slice';
import {
  TestFixture,
  generateComponentHTML,
  TagProps,
} from '../../fixtures/test-fixture';
import {toArray} from '../../utils/arrayUtils';
import {
  resultListComponent,
  ResultSection,
  resultSectionTags,
} from './result-list-selectors';
import {resultTemplateComponent} from './result-template-selectors';

export function buildTemplateWithoutSections(
  nodes: Node | Node[],
  props: TagProps = {},
  templateComponent = resultTemplateComponent
) {
  const resultTemplate = generateComponentHTML(templateComponent, props);
  const template = generateComponentHTML('template') as HTMLTemplateElement;
  resultTemplate.appendChild(template);
  template.content.append(...toArray(nodes));
  return resultTemplate;
}

export function buildTemplateWithSections(
  sections: Partial<Record<ResultSection, Node | Node[]>>,
  props: TagProps = {},
  templateComponent = resultTemplateComponent
) {
  const sectionPairs = Object.entries(sections) as [
    ResultSection,
    HTMLElement | HTMLElement[],
  ][];
  const sectionsEls: HTMLElement[] = [];
  for (const [section, nodes] of sectionPairs) {
    const sectionEl = generateComponentHTML(resultSectionTags[section]);
    sectionEl.append(...toArray(nodes));
    sectionsEls.push(sectionEl);
  }
  return buildTemplateWithoutSections(sectionsEls, props, templateComponent);
}

export const addFieldValueInResponse =
  (field: string, fieldValue: string | number | string[] | null) =>
  (fixture: TestFixture) => {
    fixture.withCustomResponse((response) =>
      response.results.forEach((result) => {
        if (fieldValue === null) {
          delete result.raw[field];
        } else {
          result.raw[field] = fieldValue;
        }
      })
    );
  };

export const addResultList =
  (template?: HTMLElement, props = {}) =>
  (fixture: TestFixture) => {
    const resultList = generateComponentHTML(resultListComponent, props);
    if (template) {
      resultList.appendChild(template);
    }
    fixture.withElement(resultList);
  };

export const addGridResultList =
  (template?: HTMLElement, tags?: TagProps) => (fixture: TestFixture) => {
    const gridResultList = generateComponentHTML(resultListComponent, {
      ...tags,
      display: 'grid',
    });
    if (template) {
      gridResultList.appendChild(template);
    }
    fixture.withElement(gridResultList);
  };

export const removeResultChildrenFromResponse = (fixture: TestFixture) => {
  fixture.withCustomResponse((response) =>
    response.results.forEach((result) => {
      (result as ResultWithFolding).childResults = [];
    })
  );
};
