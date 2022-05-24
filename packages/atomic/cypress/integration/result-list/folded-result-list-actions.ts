import {generateComponentHTML} from '../../fixtures/test-fixture';
import {
  resultChildrenComponent,
  resultChildrenTemplateComponent,
} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';
import {resultSectionTags} from './result-list-selectors';

export function buildResultTopChild(children?: HTMLElement): HTMLElement[] {
  return [
    generateComponentHTML(resultLinkComponent),
    buildResultChildren(children),
  ];
}

export function buildResultChildren(grandChildren?: HTMLElement): HTMLElement {
  const children = generateComponentHTML(resultChildrenComponent);
  const childrenTemplate = generateComponentHTML(
    resultChildrenTemplateComponent
  );
  const sectionEl = generateComponentHTML(resultSectionTags.title);
  const link = generateComponentHTML(resultLinkComponent);
  const template = generateComponentHTML('template') as HTMLTemplateElement;
  sectionEl.appendChild(link);
  template.content.appendChild(sectionEl);

  if (grandChildren) {
    const childrenSectionEL = generateComponentHTML(resultSectionTags.children);
    childrenSectionEL.appendChild(grandChildren);

    template.content.appendChild(childrenSectionEL);
  }

  childrenTemplate.appendChild(template);
  children.appendChild(childrenTemplate);
  return children;
}
