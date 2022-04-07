import {generateComponentHTML} from '../../fixtures/test-fixture';
import {
  resultChildrenComponent,
  resultChildrenTemplateComponent,
} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';

export function buildResultChildren(grandChildren?: HTMLElement): HTMLElement {
  const children = generateComponentHTML(resultChildrenComponent);
  const childrenTemplate = generateComponentHTML(
    resultChildrenTemplateComponent
  );
  const link = generateComponentHTML(resultLinkComponent);
  const template = generateComponentHTML('template') as HTMLTemplateElement;

  template.content.appendChild(link);
  if (grandChildren) {
    template.content.appendChild(grandChildren);
  }

  childrenTemplate.appendChild(template);
  children.appendChild(childrenTemplate);
  return children;
}
